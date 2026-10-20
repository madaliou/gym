import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessPath, canManageUsers, canMutateMembers, canMutateSubscriptions } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/validations/user";

export class AuthRequiredError extends Error {
  constructor(message = "Connexion requise.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Cette action n'est pas autorisée.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requirePathAccess(pathname: string) {
  const user = await requireSession();
  if (!canAccessPath(user.role, pathname)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireActor() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthRequiredError();
  }

  return session.user;
}

export async function requireMemberMutation() {
  const user = await requireActor();
  if (!canMutateMembers(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireSubscriptionMutation() {
  const user = await requireActor();
  if (!canMutateSubscriptions(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireAdminActor() {
  const user = await requireActor();
  if (!canManageUsers(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};
