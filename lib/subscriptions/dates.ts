import { DEFAULT_TIMEZONE } from "@/lib/config";

export function todayUtcDate(timeZone = DEFAULT_TIMEZONE) {
  const value = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return parseIsoDate(value);
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addUtcDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function addCalendarMonths(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const monthStart = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), Math.min(day, lastDay)),
  );
}

export function subscriptionEndDate(startDate: Date, durationMonths: number) {
  return addUtcDays(addCalendarMonths(startDate, durationMonths), -1);
}

export function formatClubDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(value);
}

export function subscriptionStatusForPeriod(startDate: Date, endDate: Date, today = todayUtcDate()) {
  if (endDate < today) {
    return "EXPIRED" as const;
  }

  if (startDate > today) {
    return "PENDING" as const;
  }

  return "ACTIVE" as const;
}
