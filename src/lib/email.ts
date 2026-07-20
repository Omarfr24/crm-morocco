import { Resend } from "resend";
import { log } from "@/lib/logger";
import { getTranslations } from "@/i18n/request";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendQuotationEmailParams {
  to: string;
  customerName: string;
  quoteNumber: string;
  pdfBuffer: Buffer;
}

export async function sendQuotationEmail({
  to,
  customerName,
  quoteNumber,
  pdfBuffer,
}: SendQuotationEmailParams): Promise<{ success: boolean; error?: string }> {
  const { t } = await getTranslations("email");

  if (!process.env.RESEND_API_KEY) {
    log("warn", "RESEND_API_KEY not configured — skipping email");
    return { success: false, error: t("serviceNotConfigured") };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? process.env.COMPANY_EMAIL ?? "noreply@yourcompany.com",
      to,
      subject: t("quotationSubject", { quoteNumber }),
      html: `
        <p>${t("greeting", { customerName })}</p>
        <p>${t("body", { quoteNumber })}</p>
        <p>${t("closing")}</p>
        <p>${t("regards", { companyName: process.env.COMPANY_NAME ?? "Your Company" })}</p>
      `,
      attachments: [
        {
          filename: `${quoteNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    log("info", "Quotation email sent", { to, quoteNumber });
    return { success: true };
  } catch (err) {
    log("error", "Failed to send quotation email", {
      to,
      quoteNumber,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { success: false, error: t("failedToSend") };
  }
}
