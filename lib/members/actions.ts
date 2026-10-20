"use server";

import { revalidatePath } from "next/cache";
import { AuthRequiredError, ForbiddenError, requireMemberMutation } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/services/audit-service";
import {
  createMemberRecord,
  deleteMemberRecord,
  uniqueMemberFieldFromError,
  updateMemberRecord,
} from "@/lib/services/member-service";
import {
  persistMemberPhoto,
  PhotoStorageError,
  removeStoredPhoto,
  storedPathFromPublicUrl,
} from "@/lib/storage/member-photo";
import { sendSubscriptionNotice } from "@/lib/email/subscription";
import type { EmailDelivery } from "@/lib/email/types";
import { subscriptionEndDate } from "@/lib/subscriptions/dates";
import { subscriptionWhatsAppHref } from "@/lib/subscriptions/message";
import {
  createMemberFormSchema,
  toCreateMemberInput,
  toUpdateMemberInput,
  updateMemberFormSchema,
} from "@/lib/validations/member";

export type MemberMutationResult =
  | { ok: true; email?: EmailDelivery; whatsAppHref?: string | null; photoWarning?: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

function readField(formData: FormData, field: string) {
  const entry = formData.get(field);
  return typeof entry === "string" ? entry : "";
}

function readFormValues(formData: FormData) {
  return {
    firstName: readField(formData, "firstName"),
    lastName: readField(formData, "lastName"),
    phone: readField(formData, "phone"),
    email: readField(formData, "email"),
    gender: readField(formData, "gender") || "UNSPECIFIED",
    dateOfBirth: readField(formData, "dateOfBirth"),
    address: readField(formData, "address"),
    notes: readField(formData, "notes"),
    subscriptionMonths: readField(formData, "subscriptionMonths") || "1",
    joinedAt: readField(formData, "joinedAt"),
  };
}

function fieldErrorsFromZod(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Partial<Record<string, string>> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function revalidateMembers() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/subscriptions/expiring");
  revalidatePath("/dashboard/audit-logs");
}

function mutationMessage(error: unknown) {
  if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
    return error.message;
  }

  if (error instanceof Error && error.message === "Ce membre est introuvable.") {
    return error.message;
  }

  if (error instanceof Error && error.message === "DATABASE_URL is not set.") {
    return "La connexion à la base de données n'est pas configurée.";
  }

  const text = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : String(error);

  if (/can't connect|econnrefused|etimedout|p1001|p1017|server has gone away/i.test(text)) {
    return "La base de données est injoignable. Réessayez dans un instant.";
  }

  if (/does not exist|p2021|p2022|unknown column|unknown table/i.test(text)) {
    return "La base de données n'est pas à jour. Relancez les migrations.";
  }

  if (/data too long/i.test(text)) {
    return "Une valeur est trop longue pour être enregistrée.";
  }

  return "Une erreur est survenue. Réessayez, ou enregistrez sans photo si le problème continue.";
}

function mutationFailure(error: unknown, storedPathname: string | null): MemberMutationResult {
  console.error("member mutation failed", error);

  if (error instanceof PhotoStorageError || (error instanceof Error && error.name === "PhotoStorageError")) {
    return {
      ok: false,
      message: error.message,
      fieldErrors: { photo: error.message },
    };
  }

  const uniqueField = uniqueMemberFieldFromError(error);

  if (uniqueField) {
    return {
      ok: false,
      message: uniqueField.message,
      fieldErrors: { [uniqueField.field]: uniqueField.message },
    };
  }

  return {
    ok: false,
    message: mutationMessage(error),
  };
}

export async function createMember(formData: FormData): Promise<MemberMutationResult> {
  let actor;
  try {
    actor = await requireMemberMutation();
  } catch (error) {
    return mutationFailure(error, null);
  }

  const parsed = createMemberFormSchema.safeParse(readFormValues(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const photo = formData.get("photo");
  let storedPathname: string | null = null;

  try {
    const persisted = await persistMemberPhoto(photo);
    storedPathname = persisted.storedPathname;
    const input = toCreateMemberInput(parsed.data, persisted.photoUrl);
    const created = await createMemberRecord(input);
    await writeAuditLog({
      userId: actor.id,
      action: "MEMBER_CREATE",
      entity: "Member",
      entityId: created.id,
      metadata: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        phone: parsed.data.phone,
      },
    });
    const notice = {
      firstName: input.firstName,
      phone: input.phone,
      email: input.email,
      durationMonths: input.subscriptionMonths,
      startDate: input.joinedAt,
      endDate: subscriptionEndDate(input.joinedAt, input.subscriptionMonths),
    };
    const email = await sendSubscriptionNotice(notice);
    revalidateMembers();
    return {
      ok: true,
      email,
      photoWarning: persisted.warning,
      whatsAppHref: subscriptionWhatsAppHref(notice),
    };
  } catch (error) {
    if (storedPathname) {
      await removeStoredPhoto(storedPathname);
    }

    return mutationFailure(error, storedPathname);
  }
}

export async function updateMember(memberId: string, formData: FormData): Promise<MemberMutationResult> {
  let actor;
  try {
    actor = await requireMemberMutation();
  } catch (error) {
    return mutationFailure(error, null);
  }

  const parsed = updateMemberFormSchema.safeParse({
    firstName: readField(formData, "firstName"),
    lastName: readField(formData, "lastName"),
    phone: readField(formData, "phone"),
    email: readField(formData, "email"),
    gender: readField(formData, "gender") || "UNSPECIFIED",
    dateOfBirth: readField(formData, "dateOfBirth"),
    address: readField(formData, "address"),
    notes: readField(formData, "notes"),
    joinedAt: readField(formData, "joinedAt"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const photo = formData.get("photo");
  let storedPathname: string | null = null;
  let photoWarning: string | undefined;

  try {
    const persisted = await persistMemberPhoto(photo);
    storedPathname = persisted.storedPathname;
    photoWarning = persisted.warning;
    const photoUrl = persisted.photoUrl ?? undefined;
    const updated = await updateMemberRecord(memberId, toUpdateMemberInput(parsed.data, photoUrl));
    await writeAuditLog({
      userId: actor.id,
      action: "MEMBER_UPDATE",
      entity: "Member",
      entityId: memberId,
      metadata: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      },
    });

    if (storedPathname && updated.previousPhotoUrl && updated.previousPhotoUrl !== photoUrl) {
      await removeStoredPhoto(storedPathFromPublicUrl(updated.previousPhotoUrl));
    }
  } catch (error) {
    if (storedPathname) {
      await removeStoredPhoto(storedPathname);
    }

    return mutationFailure(error, storedPathname);
  }

  revalidateMembers();
  return { ok: true, photoWarning };
}

export async function deleteMember(memberId: string): Promise<MemberMutationResult> {
  try {
    const actor = await requireMemberMutation();
    const deleted = await deleteMemberRecord(memberId);
    await writeAuditLog({
      userId: actor.id,
      action: "MEMBER_DELETE",
      entity: "Member",
      entityId: memberId,
    });
    await removeStoredPhoto(storedPathFromPublicUrl(deleted.photoUrl));
  } catch (error) {
    return mutationFailure(error, null);
  }

  revalidateMembers();
  return { ok: true };
}
