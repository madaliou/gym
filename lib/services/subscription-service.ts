import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  addUtcDays,
  parseIsoDate,
  subscriptionEndDate,
  subscriptionStatusForPeriod,
  todayUtcDate,
  toIsoDate,
} from "@/lib/subscriptions/dates";
import type { MemberOption, SubscriptionListItem } from "@/lib/subscriptions/types";
import type { SubscriptionStatus } from "@/lib/validations/subscription";

export type { MemberOption, SubscriptionListItem };

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionError";
  }
}

const pageSize = 20;
const openStatuses: SubscriptionStatus[] = ["ACTIVE", "PENDING", "SUSPENDED"];

function memberName(member: { firstName: string; lastName: string }) {
  return `${member.firstName} ${member.lastName}`;
}

export async function refreshSubscriptionStatuses(today = todayUtcDate()) {
  const prisma = getPrismaClient();

  await prisma.subscription.updateMany({
    where: {
      status: { in: ["ACTIVE", "PENDING", "SUSPENDED"] },
      endDate: { lt: today },
    },
    data: { status: "EXPIRED" },
  });

  await prisma.subscription.updateMany({
    where: {
      status: "PENDING",
      startDate: { lte: today },
      endDate: { gte: today },
    },
    data: { status: "ACTIVE" },
  });
}

async function nextStartDate(memberId: string, today: Date) {
  const prisma = getPrismaClient();
  const openSubscription = await prisma.subscription.findFirst({
    where: {
      memberId,
      status: { in: openStatuses },
      endDate: { gte: today },
    },
    orderBy: { endDate: "desc" },
    select: { endDate: true },
  });

  return openSubscription ? addUtcDays(openSubscription.endDate, 1) : today;
}

async function assertNoOverlap(
  memberId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
) {
  const prisma = getPrismaClient();
  const overlap = await prisma.subscription.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      memberId,
      status: { not: "CANCELLED" },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { id: true },
  });

  if (overlap) {
    throw new SubscriptionError("Ce membre a déjà une souscription sur cette période.");
  }
}

async function syncMemberDuration(memberId: string) {
  const prisma = getPrismaClient();
  const current = await prisma.subscription.findFirst({
    where: { memberId, status: { in: openStatuses } },
    orderBy: { startDate: "asc" },
    select: { durationMonths: true },
  });

  await prisma.member.update({
    where: { id: memberId },
    data: { subscriptionMonths: current?.durationMonths ?? null },
  });
}

function toListItem(
  subscription: {
    id: string;
    memberId: string;
    durationMonths: number;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
    member: { firstName: string; lastName: string; phone: string | null };
  },
  renewStartDate: string,
): SubscriptionListItem {
  return {
    id: subscription.id,
    memberId: subscription.memberId,
    memberName: memberName(subscription.member),
    firstName: subscription.member.firstName,
    phone: subscription.member.phone,
    durationMonths: subscription.durationMonths,
    startDate: toIsoDate(subscription.startDate),
    endDate: toIsoDate(subscription.endDate),
    status: subscription.status,
    renewStartDate,
  };
}

export async function listMemberOptions(): Promise<MemberOption[]> {
  const prisma = getPrismaClient();
  const members = await prisma.member.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  return members.map((member) => ({ id: member.id, name: memberName(member) }));
}

export async function listSubscriptions(filters: {
  query: string;
  status: SubscriptionStatus | null;
  page: number;
}) {
  await refreshSubscriptionStatuses();
  const prisma = getPrismaClient();
  const today = todayUtcDate();
  const query = filters.query.trim();
  const where: Prisma.SubscriptionWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (query.length > 0) {
    where.member = {
      OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }],
    };
  }

  const page = Number.isFinite(filters.page) && filters.page > 0 ? Math.floor(filters.page) : 1;
  const [total, hasAny, rows] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.count(),
    prisma.subscription.findMany({
      where,
      orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        memberId: true,
        durationMonths: true,
        startDate: true,
        endDate: true,
        status: true,
        member: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
  ]);

  const renewStarts = await renewStartDates(
    rows.map((row) => row.memberId),
    today,
  );

  return {
    items: rows.map((row) => toListItem(row, renewStarts.get(row.memberId) ?? toIsoDate(today))),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    hasAny: hasAny > 0,
  };
}

export async function listExpiringSubscriptions(withinDays: number) {
  await refreshSubscriptionStatuses();
  const prisma = getPrismaClient();
  const today = todayUtcDate();
  const horizon = addUtcDays(today, withinDays);
  const rows = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: today, lte: horizon },
    },
    orderBy: [{ endDate: "asc" }],
    select: {
      id: true,
      memberId: true,
      durationMonths: true,
      startDate: true,
      endDate: true,
      status: true,
      member: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  const renewStarts = await renewStartDates(
    rows.map((row) => row.memberId),
    today,
  );

  return rows.map((row) => toListItem(row, renewStarts.get(row.memberId) ?? toIsoDate(today)));
}

async function renewStartDates(memberIds: string[], today: Date) {
  const prisma = getPrismaClient();
  const uniqueIds = [...new Set(memberIds)];
  const starts = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return starts;
  }

  const openSubscriptions = await prisma.subscription.findMany({
    where: {
      memberId: { in: uniqueIds },
      status: { in: openStatuses },
      endDate: { gte: today },
    },
    orderBy: { endDate: "desc" },
    select: { memberId: true, endDate: true },
  });

  for (const subscription of openSubscriptions) {
    if (!starts.has(subscription.memberId)) {
      starts.set(subscription.memberId, toIsoDate(addUtcDays(subscription.endDate, 1)));
    }
  }

  for (const memberId of uniqueIds) {
    if (!starts.has(memberId)) {
      starts.set(memberId, toIsoDate(today));
    }
  }

  return starts;
}

export async function createSubscriptionRecord(input: {
  memberId: string;
  durationMonths: number;
  startDate: Date;
}) {
  const prisma = getPrismaClient();
  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, status: true, firstName: true, phone: true, email: true },
  });

  if (!member || member.status === "ARCHIVED") {
    throw new SubscriptionError("Choisissez un membre actif.");
  }

  if (!Number.isInteger(input.durationMonths) || input.durationMonths < 1 || input.durationMonths > 6) {
    throw new SubscriptionError("Choisissez une durée de souscription.");
  }

  const today = todayUtcDate();
  const endDate = subscriptionEndDate(input.startDate, input.durationMonths);
  await assertNoOverlap(input.memberId, input.startDate, endDate);

  const subscription = await prisma.subscription.create({
    data: {
      memberId: input.memberId,
      durationMonths: input.durationMonths,
      startDate: input.startDate,
      endDate,
      status: subscriptionStatusForPeriod(input.startDate, endDate, today),
    },
    select: {
      id: true,
      durationMonths: true,
      startDate: true,
      endDate: true,
    },
  });

  await syncMemberDuration(input.memberId);
  return {
    ...subscription,
    firstName: member.firstName,
    phone: member.phone,
    email: member.email,
  };
}

export async function renewSubscriptionRecord(subscriptionId: string, durationMonths: number) {
  const prisma = getPrismaClient();
  const current = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { memberId: true },
  });

  if (!current) {
    throw new SubscriptionError("Cette souscription est introuvable.");
  }

  const startDate = await nextStartDate(current.memberId, todayUtcDate());
  return createSubscriptionRecord({
    memberId: current.memberId,
    durationMonths,
    startDate,
  });
}

async function requireSubscription(subscriptionId: string) {
  const prisma = getPrismaClient();
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true, memberId: true, status: true, startDate: true, endDate: true },
  });

  if (!subscription) {
    throw new SubscriptionError("Cette souscription est introuvable.");
  }

  return subscription;
}

export async function suspendSubscriptionRecord(subscriptionId: string) {
  await refreshSubscriptionStatuses();
  const subscription = await requireSubscription(subscriptionId);

  if (subscription.status !== "ACTIVE") {
    throw new SubscriptionError("Seule une souscription active peut être suspendue.");
  }

  const prisma = getPrismaClient();
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "SUSPENDED" },
  });
  await syncMemberDuration(subscription.memberId);
}

export async function reactivateSubscriptionRecord(subscriptionId: string) {
  await refreshSubscriptionStatuses();
  const subscription = await requireSubscription(subscriptionId);
  const today = todayUtcDate();

  if (subscription.endDate < today) {
    throw new SubscriptionError("Cette souscription est arrivée à échéance.");
  }

  if (subscription.status !== "SUSPENDED") {
    throw new SubscriptionError("Seule une souscription suspendue peut être réactivée.");
  }

  const prisma = getPrismaClient();

  await assertNoOverlap(
    subscription.memberId,
    subscription.startDate,
    subscription.endDate,
    subscription.id,
  );

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE" },
  });
  await syncMemberDuration(subscription.memberId);
}

export async function cancelSubscriptionRecord(subscriptionId: string) {
  const subscription = await requireSubscription(subscriptionId);

  if (!openStatuses.includes(subscription.status)) {
    throw new SubscriptionError("Cette souscription ne peut plus être annulée.");
  }

  const prisma = getPrismaClient();
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELLED" },
  });
  await syncMemberDuration(subscription.memberId);
}

export function parseSubscriptionStartDate(value: string) {
  return parseIsoDate(value);
}
