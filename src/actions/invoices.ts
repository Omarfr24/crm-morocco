"use server";

import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { paymentSchema, type PaymentInput } from "@/schemas/invoice";
import { revalidatePath } from "next/cache";
import { getTranslations } from "@/i18n/request";
import { getOrganizationId } from "@/lib/auth-helpers";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function getInvoices(options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<
  ActionResult<{
    items: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      status: string;
      quotationId: string;
      totalAmount: unknown;
      paidAmount: unknown;
      quotation: {
        quoteNumber: string;
        customer: { companyName: string };
      };
    }[];
    total: number;
  }>
> {
  const { t } = await getTranslations("invoices");
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
        {
          quotation: {
            quoteNumber: { contains: search, mode: "insensitive" },
          },
        },
        {
          quotation: {
            customer: {
              companyName: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          quotation: {
            select: {
              quoteNumber: true,
              customer: { select: { companyName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.invoice.count({ where }),
    ]);

    return { success: true, data: { items, total } };
  } catch (err) {
    log("error", "Failed to fetch invoices", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoad") };
  }
}

export async function getInvoice(id: string): Promise<
  ActionResult<
    Awaited<ReturnType<typeof db.invoice.findUnique>> & {
      quotation: {
        quoteNumber: string;
        currency: string;
        notes: string | null;
        customer: {
          companyName: string;
          contactPerson: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          address: string | null;
        };
      };
      payments: Awaited<ReturnType<typeof db.payment.findMany>>;
    } | null
  >
> {
  const { t } = await getTranslations("invoices");
  try {
    const organizationId = await getOrganizationId();

    const invoice = await db.invoice.findFirst({
      where: { id, organizationId },
      include: {
        quotation: {
          select: {
            quoteNumber: true,
            currency: true,
            notes: true,
            customer: {
              select: {
                companyName: true,
                contactPerson: true,
                phone: true,
                email: true,
                whatsapp: true,
                address: true,
              },
            },
          },
        },
        payments: { orderBy: { date: "desc" } },
      },
    });

    if (!invoice) {
      return { success: false, error: t("invoiceNotFound") };
    }

    return { success: true, data: invoice };
  } catch (err) {
    log("error", "Failed to fetch invoice", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoad") };
  }
}

async function updateInvoiceStatus(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { totalAmount: true, paidAmount: true },
  });

  if (!invoice) return;

  let status: "UNPAID" | "PARTIALLY_PAID" | "PAID" = "UNPAID";
  if (Number(invoice.paidAmount) >= Number(invoice.totalAmount)) {
    status = "PAID";
  } else if (Number(invoice.paidAmount) > 0) {
    status = "PARTIALLY_PAID";
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });
}

export async function convertToInvoice(
  quotationId: string
): Promise<ActionResult<Awaited<ReturnType<typeof db.invoice.create>>>> {
  const { t } = await getTranslations("invoices");
  try {
    const organizationId = await getOrganizationId();

    const quotation = await db.quotation.findFirst({
      where: { id: quotationId, organizationId },
      include: { items: true, invoice: true },
    });

    if (!quotation) {
      return { success: false, error: t("quotationNotFound") };
    }

    if (quotation.invoice) {
      return { success: false, error: t("alreadyConverted") };
    }

    if (quotation.status !== "ACCEPTED") {
      return { success: false, error: t("onlyAcceptedConvert") };
    }

    const totalAmount = quotation.items.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );

    const invoice = await db.invoice.create({
      data: {
        quotationId,
        organizationId,
        status: "UNPAID",
        totalAmount,
        paidAmount: 0,
      },
    });

    await db.quotation.update({
      where: { id: quotationId },
      data: { status: "ACCEPTED" },
    });

    log("info", "Invoice created from quotation", {
      invoiceId: invoice.id,
      quotationId,
      totalAmount,
    });

    revalidatePath("/invoices");
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, data: invoice };
  } catch (err) {
    log("error", "Failed to convert quotation to invoice", {
      quotationId,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToCreate") };
  }
}

export async function recordPayment(
  invoiceId: string,
  input: PaymentInput
): Promise<ActionResult<Omit<Awaited<ReturnType<typeof db.payment.create>>, 'amount'> & { amount: number }>> {
  const { t } = await getTranslations("invoices");
  try {
    const organizationId = await getOrganizationId();

    const parsed = paymentSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, organizationId },
    });
    if (!invoice) {
      return { success: false, error: t("invoiceNotFound") };
    }

    const data = parsed.data;
    const newPaidAmount = Number(invoice.paidAmount) + data.amount;

    if (newPaidAmount > Number(invoice.totalAmount)) {
      const remaining = (Number(invoice.totalAmount) - Number(invoice.paidAmount)).toFixed(2);
      return {
        success: false,
        error: t("paymentExceedsBalance", { amount: remaining }),
      };
    }

    const payment = await db.payment.create({
      data: {
        invoiceId,
        organizationId,
        amount: data.amount,
        method: data.method,
        date: new Date(data.date),
        notes: data.notes || null,
      },
    });

    await db.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount },
    });

    await updateInvoiceStatus(invoiceId);

    log("info", "Payment recorded", {
      paymentId: payment.id,
      invoiceId,
      amount: data.amount,
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");
    return { success: true, data: { ...payment, amount: Number(payment.amount) } };
  } catch (err) {
    log("error", "Failed to record payment", {
      invoiceId,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToRecordPayment") };
  }
}

export async function deletePayment(
  paymentId: string
): Promise<ActionResult<void>> {
  const { t } = await getTranslations("invoices");
  try {
    const organizationId = await getOrganizationId();

    const payment = await db.payment.findFirst({
      where: { id: paymentId, organizationId },
    });
    if (!payment) {
      return { success: false, error: t("paymentNotFound") };
    }

    const invoice = await db.invoice.findUnique({
      where: { id: payment.invoiceId },
    });
    if (!invoice) {
      return { success: false, error: t("invoiceNotFound") };
    }

    const newPaidAmount = Math.max(0, Number(invoice.paidAmount) - Number(payment.amount));

    await db.payment.delete({ where: { id: paymentId } });

    await db.invoice.update({
      where: { id: payment.invoiceId },
      data: { paidAmount: newPaidAmount },
    });

    await updateInvoiceStatus(payment.invoiceId);

    log("info", "Payment deleted", { paymentId, invoiceId: payment.invoiceId });
    revalidatePath(`/invoices/${payment.invoiceId}`);
    revalidatePath("/invoices");
    return { success: true, data: undefined };
  } catch (err) {
    log("error", "Failed to delete payment", {
      paymentId,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToDeletePayment") };
  }
}
