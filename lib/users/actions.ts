"use server";

import { revalidatePath } from "next/cache";
import { requireAdminActor, AuthRequiredError, ForbiddenError } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/services/audit-service";
import { createUserRecord, updateUserRecord, UserServiceError } from "@/lib/services/user-service";
import { createUserFormSchema, updateUserFormSchema } from "@/lib/validations/user";

export type UserMutationResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> };

function readField(formData: FormData, field: string) {
  const entry = formData.get(field);
  return typeof entry === "string" ? entry : "";
}

function failure(error: unknown): UserMutationResult {
  if (error instanceof UserServiceError || error instanceof ForbiddenError || error instanceof AuthRequiredError) {
    return { ok: false, message: error.message };
  }

  console.error("user mutation failed", error);
  return { ok: false, message: "Une erreur est survenue." };
}

export async function createUser(formData: FormData): Promise<UserMutationResult> {
  try {
    const actor = await requireAdminActor();
    const parsed = createUserFormSchema.safeParse({
      firstName: readField(formData, "firstName"),
      lastName: readField(formData, "lastName"),
      email: readField(formData, "email"),
      role: readField(formData, "role"),
      password: readField(formData, "password"),
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      return { ok: false, message: "Vérifiez les champs du formulaire.", fieldErrors };
    }

    const created = await createUserRecord(parsed.data);
    await writeAuditLog({
      userId: actor.id,
      action: "USER_CREATE",
      entity: "User",
      entityId: created.id,
      metadata: {
        email: created.email,
        role: created.role,
        name: `${created.firstName} ${created.lastName}`,
      },
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/audit-logs");
  return { ok: true };
}

export async function updateUser(userId: string, formData: FormData): Promise<UserMutationResult> {
  try {
    const actor = await requireAdminActor();
    const parsed = updateUserFormSchema.safeParse({
      firstName: readField(formData, "firstName"),
      lastName: readField(formData, "lastName"),
      email: readField(formData, "email"),
      role: readField(formData, "role"),
      isActive: readField(formData, "isActive") || "true",
      password: readField(formData, "password"),
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      return { ok: false, message: "Vérifiez les champs du formulaire.", fieldErrors };
    }

    const updated = await updateUserRecord(userId, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      role: parsed.data.role,
      isActive: parsed.data.isActive === "true",
      password: parsed.data.password.length > 0 ? parsed.data.password : undefined,
    });

    if (parsed.data.password.length > 0) {
      await writeAuditLog({
        userId: actor.id,
        action: "USER_PASSWORD_RESET",
        entity: "User",
        entityId: updated.id,
      });
    }

    if (!updated.isActive) {
      await writeAuditLog({
        userId: actor.id,
        action: "USER_DISABLE",
        entity: "User",
        entityId: updated.id,
        metadata: { email: updated.email },
      });
    }

    await writeAuditLog({
      userId: actor.id,
      action: "USER_UPDATE",
      entity: "User",
      entityId: updated.id,
      metadata: {
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/audit-logs");
  return { ok: true };
}
