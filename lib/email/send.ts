import "server-only";
import nodemailer from "nodemailer";
import { APP_NAME } from "@/lib/config";
import type { EmailDelivery } from "@/lib/email/types";

export type { EmailDelivery };

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");

  if (!host || !from || !Number.isInteger(port) || port <= 0) {
    return null;
  }

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: user && pass ? { user, pass } : undefined,
    }),
  };
}

export async function sendClubEmail(input: {
  to: string | null | undefined;
  subject: string;
  text: string;
}): Promise<EmailDelivery> {
  const recipient = input.to?.trim();

  if (!recipient) {
    return { status: "skipped", reason: "missing_recipient" };
  }

  const config = smtpConfig();

  if (!config) {
    return { status: "skipped", reason: "not_configured" };
  }

  try {
    await config.transporter.sendMail({
      from: config.from.includes("<") ? config.from : `${APP_NAME} <${config.from}>`,
      to: recipient,
      subject: input.subject,
      text: input.text,
    });
    return { status: "sent" };
  } catch (error) {
    console.error("email send failed", error);
    return { status: "failed" };
  }
}
