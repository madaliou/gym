"use server";

import { revalidatePath } from "next/cache";
import {
  cancelSubscriptionRecord,
  createSubscriptionRecord,
  parseSubscriptionStartDate,
  reactivateSubscriptionRecord,
  renewSubscriptionRecord,
  SubscriptionError,
  suspendSubscriptionRecord,
} from "@/lib/services/subscription-service";
import {
  createSubscriptionFormSchema,
  renewSubscriptionFormSchema,
} from "@/lib/validations/subscription";

export type SubscriptionActionResult = { ok: true } | { ok: false; message: string };

function readField(formData: FormData, field: string) {
  const entry = formData.get(field);
  return typeof entry === "string" ? entry : "";
}

function revalidateSubscriptions() {
  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/subscriptions/expiring");
  revalidatePath("/dashboard/members");
}

function failure(error: unknown): SubscriptionActionResult {
  if (error instanceof SubscriptionError) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Une erreur est survenue." };
}

export async function createSubscription(formData: FormData): Promise<SubscriptionActionResult> {
  const parsed = createSubscriptionFormSchema.safeParse({
    memberId: readField(formData, "memberId"),
    durationMonths: readField(formData, "durationMonths"),
    startDate: readField(formData, "startDate"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." };
  }

  try {
    await createSubscriptionRecord({
      memberId: parsed.data.memberId,
      durationMonths: Number(parsed.data.durationMonths),
      startDate: parseSubscriptionStartDate(parsed.data.startDate),
    });
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function renewSubscription(formData: FormData): Promise<SubscriptionActionResult> {
  const parsed = renewSubscriptionFormSchema.safeParse({
    subscriptionId: readField(formData, "subscriptionId"),
    durationMonths: readField(formData, "durationMonths"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." };
  }

  try {
    await renewSubscriptionRecord(parsed.data.subscriptionId, Number(parsed.data.durationMonths));
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function suspendSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    await suspendSubscriptionRecord(subscriptionId);
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function reactivateSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    await reactivateSubscriptionRecord(subscriptionId);
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    await cancelSubscriptionRecord(subscriptionId);
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}
