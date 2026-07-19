"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  phone: z.string().min(1, "Phone is required").max(50),
  email: z.string().email("Invalid email").max(200),
  logo: z.string().max(500).optional().or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export async function getCompanyProfile(): Promise<
  ActionResult<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo: string | null;
  } | null>
> {
  try {
    await requireAuth();
    const profile = await db.companyProfile.findFirst();
    return { success: true, data: profile };
  } catch (err) {
    log("error", "Failed to fetch company profile", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: "Failed to load company profile." };
  }
}

type UpsertResult = ActionResult<{ id: string }>;

export async function upsertCompanyProfile(
  input: CompanyProfileInput
): Promise<UpsertResult> {
  try {
    await requireAuth();

    const parsed = companyProfileSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;
    const existing = await db.companyProfile.findFirst();

    if (existing) {
      await db.companyProfile.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          logo: data.logo || null,
        },
      });
    } else {
      await db.companyProfile.create({
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          logo: data.logo || null,
        },
      });
    }

    log("info", "Company profile updated");
    revalidatePath("/settings");
    return { success: true, data: { id: existing?.id ?? "" } };
  } catch (err) {
    log("error", "Failed to update company profile", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: "Failed to save company profile." };
  }
}
