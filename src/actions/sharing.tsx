"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { sendQuotationEmail } from "@/lib/email";
import { QuotationDocument } from "@/components/pdf/quotation-document";
import { headers } from "next/headers";
import { getTranslations } from "@/i18n/request";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

const COMPANY = {
  name: process.env.COMPANY_NAME ?? "Your Company",
  address: process.env.COMPANY_ADDRESS ?? "Casablanca, Morocco",
  phone: process.env.COMPANY_PHONE ?? "+212 600 000 000",
  email: process.env.COMPANY_EMAIL ?? "info@yourcompany.com",
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function generatePdfBuffer(quotationId: string): Promise<Buffer | null> {
  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    include: {
      customer: {
        select: {
          companyName: true,
          contactPerson: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      items: true,
    },
  });

  if (!quotation) return null;

  const { t } = await getTranslations("pdf");

  return renderToBuffer(
    <QuotationDocument
      data={{
        quoteNumber: quotation.quoteNumber,
        date: formatDate(quotation.date),
        expirationDate: quotation.expirationDate
          ? formatDate(quotation.expirationDate)
          : null,
        currency: quotation.currency,
        notes: quotation.notes,
        customer: quotation.customer,
        items: quotation.items.map((it) => ({
          name: it.name,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          discount: Number(it.discount),
          tax: Number(it.tax),
          total: Number(it.total),
        })),
        company: COMPANY,
        translations: {
          quotation: t("quotation"),
          billTo: t("billTo"),
          date: t("date"),
          validUntil: t("validUntil"),
          currency: t("currency"),
          item: t("item"),
          qty: t("qty"),
          unitPrice: t("unitPrice"),
          discPercent: t("discPercent"),
          taxPercent: t("taxPercent"),
          total: t("total"),
          totalLabel: t("totalLabel"),
          notesAndTerms: t("notesAndTerms"),
          thankYou: t("thankYou"),
        },
      }}
    />
  );
}

export async function sendQuotationPdfEmail(
  quotationId: string,
  recipientEmail: string
): Promise<ActionResult<void>> {
  const { t } = await getTranslations("quotations");
  try {
    await auth.api.getSession({ headers: await headers() });

    const pdfBuffer = await generatePdfBuffer(quotationId);
    if (!pdfBuffer) {
      return { success: false, error: t("notFound") };
    }

    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { customer: { select: { companyName: true } } },
    });

    if (!quotation) {
      return { success: false, error: t("notFound") };
    }

    const result = await sendQuotationEmail({
      to: recipientEmail,
      customerName: quotation.customer.companyName,
      quoteNumber: quotation.quoteNumber,
      pdfBuffer,
    });

    if (!result.success) {
      return { success: false, error: result.error ?? t("failedToSendEmail") };
    }

    return { success: true, data: undefined };
  } catch (err) {
    log("error", "Failed to send quotation email", {
      quotationId,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToSendEmail") };
  }
}

export async function getWhatsAppLink(
  quotationId: string
): Promise<ActionResult<string>> {
  const { t } = await getTranslations("quotations");
  try {
    await auth.api.getSession({ headers: await headers() });

    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: { select: { companyName: true, contactPerson: true, whatsapp: true } },
      },
    });

    if (!quotation) {
      return { success: false, error: t("notFound") };
    }

    const whatsapp = quotation.customer.whatsapp;
    if (!whatsapp) {
      return { success: false, error: "Customer has no WhatsApp number." };
    }

    const cleanPhone = whatsapp.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hi ${quotation.customer.contactPerson ?? quotation.customer.companyName},\n\n` +
      `Please find quotation ${quotation.quoteNumber} attached.\n` +
      `View PDF: ${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/pdf/${quotationId}\n\n` +
      `Let us know if you have any questions!`
    );

    const link = `https://wa.me/${cleanPhone}?text=${message}`;
    return { success: true, data: link };
  } catch (err) {
    log("error", "Failed to generate WhatsApp link", {
      quotationId,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToGenerateWhatsApp") };
  }
}
