import "server-only";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  expirationReminderHorizons,
  expirationReminderMessage,
  reminderTargetDates,
  whatsAppUrl,
  type ExpirationReminderHorizonId,
} from "@/lib/reminders/expiration";
import { formatClubDate, todayUtcDate, toIsoDate } from "@/lib/subscriptions/dates";
import { refreshSubscriptionStatuses } from "@/lib/services/subscription-service";

export type ExpirationReminder = {
  subscriptionId: string;
  memberName: string;
  phone: string | null;
  endDateLabel: string;
  horizonId: ExpirationReminderHorizonId;
  message: string;
  whatsAppHref: string | null;
};

export type ExpirationReminderGroup = {
  id: ExpirationReminderHorizonId;
  label: string;
  reminders: ExpirationReminder[];
};

export async function listExpirationReminders(today = todayUtcDate()): Promise<ExpirationReminderGroup[]> {
  await refreshSubscriptionStatuses(today);
  const prisma = getPrismaClient();
  const targets = reminderTargetDates(today);
  const targetByIso = new Map(targets.map((target) => [target.isoDate, target]));
  const rows = await prisma.subscription.findMany({
    where: {
      endDate: { in: targets.map((target) => target.date) },
      status: { in: ["ACTIVE", "EXPIRED", "SUSPENDED"] },
    },
    orderBy: [{ endDate: "asc" }, { member: { lastName: "asc" } }],
    select: {
      id: true,
      endDate: true,
      status: true,
      member: {
        select: { firstName: true, lastName: true, phone: true },
      },
    },
  });

  const grouped = new Map<ExpirationReminderHorizonId, ExpirationReminder[]>(
    expirationReminderHorizons.map((horizon) => [horizon.id, []]),
  );

  for (const row of rows) {
    const isoDate = toIsoDate(row.endDate);
    const target = targetByIso.get(isoDate);

    if (!target) {
      continue;
    }

    if (target.offsetDays < 0 && row.status !== "EXPIRED") {
      continue;
    }

    if (target.offsetDays >= 0 && row.status === "EXPIRED") {
      continue;
    }

    const endDateLabel = formatClubDate(row.endDate);
    const message = expirationReminderMessage({
      firstName: row.member.firstName,
      endDateLabel,
      expired: target.offsetDays < 0,
    });
    const reminder: ExpirationReminder = {
      subscriptionId: row.id,
      memberName: `${row.member.firstName} ${row.member.lastName}`,
      phone: row.member.phone,
      endDateLabel,
      horizonId: target.id,
      message,
      whatsAppHref: row.member.phone ? whatsAppUrl(row.member.phone, message) : null,
    };

    grouped.get(target.id)?.push(reminder);
  }

  return expirationReminderHorizons.map((horizon) => ({
    id: horizon.id,
    label: horizon.label,
    reminders: grouped.get(horizon.id) ?? [],
  }));
}

export async function countDashboardFigures() {
  const prisma = getPrismaClient();
  const [memberCount, activeSubscriptionCount] = await Promise.all([
    prisma.member.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return { memberCount, activeSubscriptionCount };
}
