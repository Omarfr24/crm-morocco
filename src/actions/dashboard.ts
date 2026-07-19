"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { headers } from "next/headers";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getDashboardStats(): Promise<
  ActionResult<{
    totalCustomers: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    recentQuotations: {
      id: string;
      quoteNumber: string;
      status: string;
      currency: string;
      date: Date;
      nextFollowUpDate: Date | null;
      customer: { companyName: string };
    }[];
    overdueFollowUps: {
      id: string;
      quoteNumber: string;
      nextFollowUpDate: Date | null;
      customer: { companyName: string };
    }[];
  }>
> {
  try {
    await requireAuth();

    const today = new Date();

    const [
      totalCustomers,
      pendingQuotes,
      acceptedQuotes,
      revenueResult,
      recentQuotations,
      overdueFollowUps,
    ] = await Promise.all([
      db.customer.count(),
      db.quotation.count({ where: { status: "SENT" } }),
      db.quotation.count({ where: { status: "ACCEPTED" } }),
      db.invoice.aggregate({
        where: { status: { in: ["PAID", "PARTIALLY_PAID"] } },
        _sum: { paidAmount: true },
      }),
      db.quotation.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { companyName: true } },
        },
      }),
      db.quotation.findMany({
        where: {
          nextFollowUpDate: { not: null, lte: today },
          status: { in: ["SENT", "PENDING"] },
        },
        take: 10,
        include: {
          customer: { select: { companyName: true } },
        },
        orderBy: { nextFollowUpDate: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        totalCustomers,
        pendingQuotes,
        acceptedQuotes,
        totalRevenue: Number(revenueResult._sum.paidAmount ?? 0),
        recentQuotations,
        overdueFollowUps,
      },
    };
  } catch (err) {
    log("error", "Failed to fetch dashboard stats", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: "Failed to load dashboard." };
  }
}

export async function globalSearch(query: string): Promise<
  ActionResult<{
    customers: { id: string; companyName: string; contactPerson: string | null; email: string | null }[];
    quotations: { id: string; quoteNumber: string; status: string; customer: { companyName: string } }[];
    invoices: { id: string; status: string; quotation: { quoteNumber: string; customer: { companyName: string } } }[];
  }>
> {
  try {
    await requireAuth();

    const q = query.trim();
    if (!q) {
      return {
        success: true,
        data: { customers: [], quotations: [], invoices: [] },
      };
    }

    const [customers, quotations, invoices] = await Promise.all([
      db.customer.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: "insensitive" } },
            { contactPerson: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
        },
      }),
      db.quotation.findMany({
        where: {
          OR: [
            { quoteNumber: { contains: q, mode: "insensitive" } },
            {
              customer: {
                companyName: { contains: q, mode: "insensitive" },
              },
            },
          ],
        },
        take: 5,
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          customer: { select: { companyName: true } },
        },
      }),
      db.invoice.findMany({
        where: {
          OR: [
            {
              quotation: {
                quoteNumber: { contains: q, mode: "insensitive" },
              },
            },
            {
              quotation: {
                customer: {
                  companyName: { contains: q, mode: "insensitive" },
                },
              },
            },
          ],
        },
        take: 5,
        select: {
          id: true,
          status: true,
          quotation: {
            select: {
              quoteNumber: true,
              customer: { select: { companyName: true } },
            },
          },
        },
      }),
    ]);

    return { success: true, data: { customers, quotations, invoices } };
  } catch (err) {
    log("error", "Failed to perform global search", {
      query,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: "Search failed." };
  }
}
