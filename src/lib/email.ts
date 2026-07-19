import { Resend } from "resend";
import { log } from "@/lib/logger";

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
  if (!process.env.RESEND_API_KEY) {
    log("warn", "RESEND_API_KEY not configured — skipping email");
    return { success: false, error: "Email service not configured." };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? process.env.COMPANY_EMAIL ?? "noreply@yourcompany.com",
      to,
      subject: `Quotation ${quoteNumber}`,
      html: `
        <p>Dear ${customerName},</p>
        <p>Please find attached quotation <strong>${quoteNumber}</strong>.</p>
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best regards,<br/>${process.env.COMPANY_NAME ?? "Your Company"}</p>
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
    return { success: false, error: "Failed to send email. Please try again." };
  }
}
