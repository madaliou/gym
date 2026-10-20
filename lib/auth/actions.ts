"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { requireActor } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/services/audit-service";
import { countUsers, createUserRecord } from "@/lib/services/user-service";
import { loginFormSchema, setupAdminFormSchema } from "@/lib/validations/user";

export type AuthActionResult = { ok: true } | { ok: false; message: string };

function readField(formData: FormData, field: string) {
  const entry = formData.get(field);
  return typeof entry === "string" ? entry : "";
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginFormSchema.safeParse({
    email: readField(formData, "email"),
    password: readField(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "E-mail ou mot de passe incorrect." };
    }

    throw error;
  }

  return { ok: true };
}

export async function setupAdminAction(formData: FormData): Promise<AuthActionResult> {
  if ((await countUsers()) > 0) {
    return { ok: false, message: "Un compte administrateur existe déjà." };
  }

  const parsed = setupAdminFormSchema.safeParse({
    firstName: readField(formData, "firstName"),
    lastName: readField(formData, "lastName"),
    email: readField(formData, "email"),
    role: "ADMIN",
    password: readField(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." };
  }

  const created = await createUserRecord({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    password: parsed.data.password,
    role: "ADMIN",
  });

  await writeAuditLog({
    userId: created.id,
    action: "USER_CREATE",
    entity: "User",
    entityId: created.id,
    metadata: { bootstrap: true, role: "ADMIN" },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Le compte a été créé. Connectez-vous depuis la page de connexion." };
    }

    throw error;
  }

  return { ok: true };
}

export async function logoutAction() {
  const user = await requireActor().catch(() => null);
  if (user) {
    await writeAuditLog({
      userId: user.id,
      action: "LOGOUT",
      entity: "Auth",
      entityId: user.id,
    });
  }

  await signOut({ redirectTo: "/login" });
}
