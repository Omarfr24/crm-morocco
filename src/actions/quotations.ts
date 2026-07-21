"use server";

import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { Prisma } from "@/generated/prisma/client";
import { quotationSchema, calculateItemTotal, type QuotationInput } from "@/schemas/quotation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "@/i18n/request";
import { getOrganizationId, requireAuth } from "@/lib/auth-helpers";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function generateQuoteNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;

  const lastQuote = await db.quotation.findFirst({
    where: {
      organizationId,
      quoteNumber: { startsWith: prefix },
    },
    orderBy: { quoteNumber: "desc" },
    select: { quoteNumber: true },
  });

  let nextNum = 1;
  if (lastQuote) {
    const lastNum = parseInt(lastQuote.quoteNumber.split("-")[2] ?? "0", 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

export async function getQuotations(options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<
  ActionResult<{
    items: Awaited<ReturnType<typeof db.quotation.findMany>>;
    total: number;
  }>
> {
  const { t } = await getTranslations("quotations");
  try {
    const organizationId = await getOrganizationId();

    const search = options?.search?.trim() ?? "";
    const status = options?.status?.trim() ?? "";
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { organizationId };

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { customer: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      db.quotation.findMany({
        where,
        include: { customer: { select: { companyName: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.quotation.count({ where }),
    ]);

    return { success: true, data: { items, total } };
  } catch (err) {
    log("error", "Failed to fetch quotations", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoad") };
  }
}

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: {
    customer: { select: { companyName: true; contactPerson: true; phone: true; whatsapp: true; email: true } };
    items: true;
    invoice: { select: { id: true; status: true } };
  };
}>;

export async function getQuotation(id: string): Promise<
  ActionResult<QuotationWithRelations | null>
> {
  const { t } = await getTranslations("quotations");
  try {
    const organizationId = await getOrganizationId();

    const quotation = await db.quotation.findFirst({
      where: { id, organizationId },
      include: {
        customer: { select: { companyName: true, contactPerson: true, phone: true, whatsapp: true, email: true } },
        items: true,
        invoice: { select: { id: true, status: true } },
      },
    });

    if (!quotation) {
      return { success: false, error: t("notFound") };
    }

    return { success: true, data: quotation };
  } catch (err) {
    log("error", "Failed to fetch quotation", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoad") };
  }
}

export async function createQuotation(
  input: QuotationInput
): Promise<ActionResult<Awaited<ReturnType<typeof db.quotation.create>>>> {
  const { t } = await getTranslations("quotations");
  try {
    const session = await requireAuth();
    const organizationId = session.user.organizationId;

    const parsed = quotationSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;
    const quoteNumber = await generateQuoteNumber(organizationId);

    const quotation = await db.quotation.create({
      data: {
        quoteNumber,
        customerId: data.customerId,
        userId: session.user.id,
        organizationId,
        status: "DRAFT",
        currency: data.currency,
        date: new Date(data.date),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        notes: data.notes || null,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax,
            total: calculateItemTotal(item),
          })),
        },
      },
      include: { items: true },
    });

    log("info", "Quotation created", { id: quotation.id, quoteNumber });
    revalidatePath("/quotations");
    return { success: true, data: quotation };
  } catch (err) {
    log("error", "Failed to create quotation", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToCreate") };
  }
}

export async function updateQuotation(
  id: string,
  input: QuotationInput
): Promise<ActionResult<Awaited<ReturnType<typeof db.quotation.update>>>> {
  const { t } = await getTranslations("quotations");
  try {
    const organizationId = await getOrganizationId();

    const existing = await db.quotation.findFirst({
      where: { id, organizationId },
      select: { status: true },
    });
    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    if (existing.status !== "DRAFT") {
      return { success: false, error: t("onlyDraftEditable") };
    }

    const parsed = quotationSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;

    await db.quotationItem.deleteMany({ where: { quotationId: id } });

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        customerId: data.customerId,
        currency: data.currency,
        date: new Date(data.date),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        notes: data.notes || null,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax,
            total: calculateItemTotal(item),
          })),
        },
      },
      include: { items: true },
    });

    log("info", "Quotation updated", { id: quotation.id });
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true, data: quotation };
  } catch (err) {
    log("error", "Failed to update quotation", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToUpdate") };
  }
}

export async function updateQuotationStatus(
  id: string,
  status: "DRAFT" | "SENT" | "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED"
): Promise<ActionResult<Awaited<ReturnType<typeof db.quotation.update>>>> {
  const { t } = await getTranslations("quotations");
  try {
    const organizationId = await getOrganizationId();

    const existing = await db.quotation.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    const quotation = await db.quotation.update({
      where: { id },
      data: { status },
    });

    log("info", "Quotation status updated", { id, status });
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true, data: quotation };
  } catch (err) {
    log("error", "Failed to update quotation status", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToUpdateStatus") };
  }
}

export async function deleteQuotation(id: string): Promise<ActionResult<void>> {
  const { t } = await getTranslations("quotations");
  try {
    const organizationId = await getOrganizationId();

    const existing = await db.quotation.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: t("notFound") };
    }

    const hasInvoice = await db.invoice.count({ where: { quotationId: id } });
    if (hasInvoice > 0) {
      return {
        success: false,
        error: t("cannotDeleteConverted"),
      };
    }

    await db.quotation.delete({ where: { id } });

    log("info", "Quotation deleted", { id });
    revalidatePath("/quotations");
    return { success: true, data: undefined };
  } catch (err) {
    log("error", "Failed to delete quotation", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToDelete") };
  }
}
