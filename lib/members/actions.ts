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
  deleteStoredFile,
  PhotoStorageError,
  saveMemberPhoto,
  storedPathFromPublicUrl,
} from "@/lib/storage/local-folder";
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
  | { ok: true; email?: EmailDelivery; whatsAppHref?: string | null }
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
    gender: readField(formData, "gender"),
    dateOfBirth: readField(formData, "dateOfBirth"),
    address: readField(formData, "address"),
    notes: readField(formData, "notes"),
    subscriptionMonths: readField(formData, "subscriptionMonths"),
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
    message:
      error instanceof AuthRequiredError || error instanceof ForbiddenError
        ? error.message
        : error instanceof Error && error.message === "Ce membre est introuvable."
          ? error.message
          : "Une erreur est survenue.",
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
  let photoUrl: string | null = null;

  try {
    if (photo instanceof File && photo.size > 0) {
      const saved = await saveMemberPhoto(photo);
      storedPathname = saved.pathname;
      photoUrl = saved.url;
    }

    const input = toCreateMemberInput(parsed.data, photoUrl);
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
      whatsAppHref: subscriptionWhatsAppHref(notice),
    };
  } catch (error) {
    if (storedPathname) {
      await deleteStoredFile(storedPathname);
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
    gender: readField(formData, "gender"),
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
  let photoUrl: string | undefined;

  try {
    if (photo instanceof File && photo.size > 0) {
      const saved = await saveMemberPhoto(photo);
      storedPathname = saved.pathname;
      photoUrl = saved.url;
    }

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
      const previousPath = storedPathFromPublicUrl(updated.previousPhotoUrl);
      if (previousPath) {
        await deleteStoredFile(previousPath);
      }
    }
  } catch (error) {
    if (storedPathname) {
      await deleteStoredFile(storedPathname);
    }

    return mutationFailure(error, storedPathname);
  }

  revalidateMembers();
  return { ok: true };
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
    const photoPath = storedPathFromPublicUrl(deleted.photoUrl);
    if (photoPath) {
      await deleteStoredFile(photoPath);
    }
  } catch (error) {
    return mutationFailure(error, null);
  }

  revalidateMembers();
  return { ok: true };
}
