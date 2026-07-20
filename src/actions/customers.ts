"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { customerSchema, type CustomerInput } from "@/schemas/customer";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "@/i18n/request";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getCustomers(options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<
  ActionResult<{ items: Awaited<ReturnType<typeof db.customer.findMany>>; total: number }>
> {
  const { t } = await getTranslations("errors");
  try {
    await requireAuth();

    const search = options?.search?.trim() ?? "";
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { contactPerson: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.customer.count({ where }),
    ]);

    return { success: true, data: { items, total } };
  } catch (err) {
    log("error", "Failed to fetch customers", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoadCustomers") };
  }
}

export async function getCustomer(id: string): Promise<
  ActionResult<Awaited<ReturnType<typeof db.customer.findUnique>>>
> {
  const { t } = await getTranslations("errors");
  try {
    await requireAuth();

    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer) {
      return { success: false, error: "Customer not found." };
    }

    return { success: true, data: customer };
  } catch (err) {
    log("error", "Failed to fetch customer", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoadCustomers") };
  }
}

export async function createCustomer(
  input: CustomerInput
): Promise<ActionResult<Awaited<ReturnType<typeof db.customer.create>>>> {
  const { t } = await getTranslations("errors");
  try {
    await requireAuth();

    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;
    const customer = await db.customer.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });

    log("info", "Customer created", { id: customer.id });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (err) {
    log("error", "Failed to create customer", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoadCustomers") };
  }
}

export async function updateCustomer(
  id: string,
  input: CustomerInput
): Promise<ActionResult<Awaited<ReturnType<typeof db.customer.update>>>> {
  const { t } = await getTranslations("errors");
  try {
    await requireAuth();

    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;
    const customer = await db.customer.update({
      where: { id },
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });

    log("info", "Customer updated", { id: customer.id });
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, data: customer };
  } catch (err) {
    log("error", "Failed to update customer", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoadCustomers") };
  }
}

export async function deleteCustomer(
  id: string
): Promise<ActionResult<void>> {
  const { t } = await getTranslations("errors");
  try {
    await requireAuth();

    const hasQuotations = await db.quotation.count({ where: { customerId: id } });
    if (hasQuotations > 0) {
      return {
        success: false,
        error: "Cannot delete customer with existing quotations. Remove linked quotations first.",
      };
    }

    await db.customer.delete({ where: { id } });

    log("info", "Customer deleted", { id });
    revalidatePath("/customers");
    return { success: true, data: undefined };
  } catch (err) {
    log("error", "Failed to delete customer", {
      id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToLoadCustomers") };
  }
}
