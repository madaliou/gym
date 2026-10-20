"use server";

import { revalidatePath } from "next/cache";
import { AuthRequiredError, ForbiddenError, requireSubscriptionMutation } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/services/audit-service";
import {
  cancelSubscriptionRecord,
  createSubscriptionRecord,
  parseSubscriptionStartDate,
  reactivateSubscriptionRecord,
  renewSubscriptionRecord,
  SubscriptionError,
  suspendSubscriptionRecord,
} from "@/lib/services/subscription-service";
import { sendSubscriptionNotice } from "@/lib/email/subscription";
import type { EmailDelivery } from "@/lib/email/types";
import { subscriptionWhatsAppHref } from "@/lib/subscriptions/message";
import {
  createSubscriptionFormSchema,
  renewSubscriptionFormSchema,
} from "@/lib/validations/subscription";

export type SubscriptionActionResult =
  | { ok: true; email?: EmailDelivery; whatsAppHref?: string | null }
  | { ok: false; message: string };

function readField(formData: FormData, field: string) {
  const entry = formData.get(field);
  return typeof entry === "string" ? entry : "";
}

function revalidateSubscriptions() {
  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/subscriptions/expiring");
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/audit-logs");
}

function failure(error: unknown): SubscriptionActionResult {
  if (error instanceof SubscriptionError || error instanceof AuthRequiredError || error instanceof ForbiddenError) {
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
    const actor = await requireSubscriptionMutation();
    const created = await createSubscriptionRecord({
      memberId: parsed.data.memberId,
      durationMonths: Number(parsed.data.durationMonths),
      startDate: parseSubscriptionStartDate(parsed.data.startDate),
    });
    await writeAuditLog({
      userId: actor.id,
      action: "SUBSCRIPTION_CREATE",
      entity: "Subscription",
      entityId: created.id,
      metadata: { memberId: parsed.data.memberId, durationMonths: Number(parsed.data.durationMonths) },
    });
    const email = await sendSubscriptionNotice(created);
    revalidateSubscriptions();
    return {
      ok: true,
      email,
      whatsAppHref: subscriptionWhatsAppHref(created),
    };
  } catch (error) {
    return failure(error);
  }
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
    const actor = await requireSubscriptionMutation();
    const renewed = await renewSubscriptionRecord(
      parsed.data.subscriptionId,
      Number(parsed.data.durationMonths),
    );
    await writeAuditLog({
      userId: actor.id,
      action: "SUBSCRIPTION_RENEW",
      entity: "Subscription",
      entityId: renewed.id,
      metadata: { previousSubscriptionId: parsed.data.subscriptionId },
    });
    const email = await sendSubscriptionNotice({ ...renewed, renewed: true });
    revalidateSubscriptions();
    return {
      ok: true,
      email,
      whatsAppHref: subscriptionWhatsAppHref({ ...renewed, renewed: true }),
    };
  } catch (error) {
    return failure(error);
  }
}

export async function suspendSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    const actor = await requireSubscriptionMutation();
    await suspendSubscriptionRecord(subscriptionId);
    await writeAuditLog({
      userId: actor.id,
      action: "SUBSCRIPTION_SUSPEND",
      entity: "Subscription",
      entityId: subscriptionId,
    });
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function reactivateSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    const actor = await requireSubscriptionMutation();
    await reactivateSubscriptionRecord(subscriptionId);
    await writeAuditLog({
      userId: actor.id,
      action: "SUBSCRIPTION_REACTIVATE",
      entity: "Subscription",
      entityId: subscriptionId,
    });
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}

export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
  try {
    const actor = await requireSubscriptionMutation();
    await cancelSubscriptionRecord(subscriptionId);
    await writeAuditLog({
      userId: actor.id,
      action: "SUBSCRIPTION_CANCEL",
      entity: "Subscription",
      entityId: subscriptionId,
    });
  } catch (error) {
    return failure(error);
  }

  revalidateSubscriptions();
  return { ok: true };
}
