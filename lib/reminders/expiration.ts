import { APP_NAME } from "@/lib/config";
import { addUtcDays, toIsoDate } from "@/lib/subscriptions/dates";

export const expirationReminderHorizons = [
  { id: "expired", label: "Vient d'expirer", offsetDays: -1 },
  { id: "today", label: "Expire aujourd'hui", offsetDays: 0 },
  { id: "tomorrow", label: "Expire demain", offsetDays: 1 },
  { id: "in3", label: "Expire dans 3 jours", offsetDays: 3 },
  { id: "in7", label: "Expire dans 7 jours", offsetDays: 7 },
  { id: "in30", label: "Expire dans 30 jours", offsetDays: 30 },
] as const;

export type ExpirationReminderHorizonId = (typeof expirationReminderHorizons)[number]["id"];

export function reminderTargetDates(today: Date) {
  return expirationReminderHorizons.map((horizon) => ({
    ...horizon,
    date: addUtcDays(today, horizon.offsetDays),
    isoDate: toIsoDate(addUtcDays(today, horizon.offsetDays)),
  }));
}

export function expirationReminderMessage(input: {
  firstName: string;
  endDateLabel: string;
  expired: boolean;
}) {
  if (input.expired) {
    return `Bonjour ${input.firstName},\n\nVotre abonnement à ${APP_NAME} a expiré le ${input.endDateLabel}.\n\nPassez à l'accueil pour le renouveler.`;
  }

  return `Bonjour ${input.firstName},\n\nVotre abonnement à ${APP_NAME} expire le ${input.endDateLabel}.\n\nMerci.`;
}

export function whatsAppDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 9) {
    digits = `221${digits}`;
  }

  if (digits.length < 8 || digits.length > 15) {
    return null;
  }

  return digits;
}

export function whatsAppUrl(phone: string, message: string) {
  const digits = whatsAppDigits(phone);

  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
