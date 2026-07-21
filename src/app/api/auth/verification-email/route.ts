import { NextResponse } from "next/server";
import { Resend } from "resend";
import { log } from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, name, url } = await request.json();

  if (!to || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    log("warn", "RESEND_API_KEY not configured — skipping verification email");
    return NextResponse.json({ success: true });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? process.env.COMPANY_EMAIL ?? "noreply@yourcompany.com",
      to,
      subject: "Verify your email address",
      html: `
        <p>Hello ${name || "there"},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${url}">Verify Email</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
      `,
    });

    log("info", "Verification email sent", { to });
    return NextResponse.json({ success: true });
  } catch (err) {
    log("error", "Failed to send verification email", {
      to,
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
