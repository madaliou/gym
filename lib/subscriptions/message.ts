import { APP_NAME } from "@/lib/config";
import { whatsAppUrl } from "@/lib/reminders/expiration";
import { formatClubDate } from "@/lib/subscriptions/dates";
import { subscriptionMonthsLabel } from "@/lib/validations/member";

export function subscriptionNoticeSubject(renewed = false) {
  return renewed ? `Votre abonnement ${APP_NAME} a été renouvelé` : `Votre abonnement ${APP_NAME}`;
}

export function subscriptionWhatsAppMessage(input: {
  firstName: string;
  durationMonths: number;
  startDate: Date;
  endDate: Date;
  renewed?: boolean;
}) {
  const duration = subscriptionMonthsLabel(input.durationMonths);
  const startLabel = formatClubDate(input.startDate);
  const endLabel = formatClubDate(input.endDate);
  const verb = input.renewed ? "a été renouvelé" : "est enregistré";

  return `Bonjour ${input.firstName},

Votre abonnement à ${APP_NAME} ${verb} : ${duration}, du ${startLabel} au ${endLabel}.

Merci, à bientôt à la salle !`;
}

export function subscriptionWhatsAppHref(input: {
  firstName: string;
  phone: string | null;
  durationMonths: number;
  startDate: Date;
  endDate: Date;
  renewed?: boolean;
}) {
  if (!input.phone) {
    return null;
  }

  return whatsAppUrl(input.phone, subscriptionWhatsAppMessage(input));
}
