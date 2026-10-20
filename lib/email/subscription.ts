import "server-only";
import { sendClubEmail } from "@/lib/email/send";
import type { EmailDelivery } from "@/lib/email/types";
import {
  subscriptionNoticeSubject,
  subscriptionWhatsAppMessage,
} from "@/lib/subscriptions/message";

export async function sendSubscriptionNotice(input: {
  email: string | null;
  firstName: string;
  durationMonths: number;
  startDate: Date;
  endDate: Date;
  renewed?: boolean;
}): Promise<EmailDelivery> {
  return sendClubEmail({
    to: input.email,
    subject: subscriptionNoticeSubject(input.renewed),
    text: subscriptionWhatsAppMessage(input),
  });
}
