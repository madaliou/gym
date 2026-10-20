import { z } from "zod";
import { subscriptionMonthValues } from "@/lib/validations/member";

export const subscriptionStatuses = ["ACTIVE", "EXPIRED", "PENDING", "SUSPENDED", "CANCELLED"] as const;

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expirée",
  PENDING: "En attente",
  SUSPENDED: "Suspendue",
  CANCELLED: "Annulée",
};

export const subscriptionStatusFilters = ["", ...subscriptionStatuses] as const;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string) {
  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const createSubscriptionFormSchema = z.object({
  memberId: z.string().trim().min(1, "Choisissez un membre."),
  durationMonths: z.string().refine(
    (value) => (subscriptionMonthValues as readonly string[]).includes(value),
    "Choisissez une durée de souscription.",
  ),
  startDate: z.string().trim().refine(isValidDate, "La date de début est obligatoire."),
});

export const renewSubscriptionFormSchema = z.object({
  subscriptionId: z.string().trim().min(1, "Cette souscription est introuvable."),
  durationMonths: z.string().refine(
    (value) => (subscriptionMonthValues as readonly string[]).includes(value),
    "Choisissez une durée de souscription.",
  ),
});

export type CreateSubscriptionFormValues = z.infer<typeof createSubscriptionFormSchema>;
