import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotationDocument } from "@/components/pdf/quotation-document";
import { log } from "@/lib/logger";
import { getTranslations } from "@/i18n/request";
import { auth } from "@/lib/auth";

const DEFAULT_COMPANY = {
  name: "Your Company",
  address: "Casablanca, Morocco",
  phone: "+212 600 000 000",
  email: "info@yourcompany.com",
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: _request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const organizationId = session.user.organizationId;

    const quotation = await db.quotation.findFirst({
      where: { id, organizationId },
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

    if (!quotation) {
      return new Response("Quotation not found", { status: 404 });
    }

    const companyProfile = await db.companyProfile.findUnique({
      where: { organizationId },
    });
    const company = companyProfile
      ? {
          name: companyProfile.name,
          address: companyProfile.address,
          phone: companyProfile.phone,
          email: companyProfile.email,
        }
      : DEFAULT_COMPANY;

    const { t } = await getTranslations("pdf");

    const pdfBuffer = await renderToBuffer(
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
          company,
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

    log("info", "PDF generated", { id, quoteNumber: quotation.quoteNumber });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quotation.quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    log("error", "PDF generation failed", {
      id: (await params).id,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
