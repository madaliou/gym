import "server-only";
import { headers } from "next/headers";
import { getPrismaClient } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export const auditActions = [
  "LOGIN",
  "LOGOUT",
  "MEMBER_CREATE",
  "MEMBER_UPDATE",
  "MEMBER_DELETE",
  "SUBSCRIPTION_CREATE",
  "SUBSCRIPTION_RENEW",
  "SUBSCRIPTION_SUSPEND",
  "SUBSCRIPTION_REACTIVATE",
  "SUBSCRIPTION_CANCEL",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DISABLE",
  "USER_PASSWORD_RESET",
  "ROLE_CHANGE",
] as const;

export type AuditAction = (typeof auditActions)[number];

export const auditActionLabels: Record<AuditAction, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  MEMBER_CREATE: "Création de membre",
  MEMBER_UPDATE: "Modification de membre",
  MEMBER_DELETE: "Suppression de membre",
  SUBSCRIPTION_CREATE: "Création de souscription",
  SUBSCRIPTION_RENEW: "Renouvellement de souscription",
  SUBSCRIPTION_SUSPEND: "Suspension de souscription",
  SUBSCRIPTION_REACTIVATE: "Réactivation de souscription",
  SUBSCRIPTION_CANCEL: "Annulation de souscription",
  USER_CREATE: "Création d'utilisateur",
  USER_UPDATE: "Modification d'utilisateur",
  USER_DISABLE: "Désactivation d'utilisateur",
  USER_PASSWORD_RESET: "Réinitialisation de mot de passe",
  ROLE_CHANGE: "Changement de rôle",
};

export const auditEntityLabels: Record<string, string> = {
  Auth: "Authentification",
  Member: "Membre",
  Subscription: "Souscription",
  User: "Utilisateur",
};

export type AuditLogInput = {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function requestIpAddress() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || null;
}

export async function writeAuditLog(input: AuditLogInput) {
  try {
    const prisma = getPrismaClient();
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: await requestIpAddress(),
      },
    });
  } catch (error) {
    console.error("audit log failed", error);
  }
}

export type AuditLogListItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export async function listAuditLogs(): Promise<AuditLogListItem[]> {
  const prisma = getPrismaClient();
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}
