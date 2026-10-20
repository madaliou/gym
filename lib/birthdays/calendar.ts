import { addUtcDays, todayUtcDate } from "@/lib/subscriptions/dates";

export const birthdayPeriods = ["day", "week", "month"] as const;

export type BirthdayPeriod = (typeof birthdayPeriods)[number];

export type DateWindow = {
  start: Date;
  end: Date;
};

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function startOfUtcWeek(date: Date) {
  const weekday = date.getUTCDay();
  const offset = weekday === 0 ? 6 : weekday - 1;
  return addUtcDays(date, -offset);
}

export function endOfUtcWeek(date: Date) {
  return addUtcDays(startOfUtcWeek(date), 6);
}

export function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function birthdayWindow(period: BirthdayPeriod, today = todayUtcDate()): DateWindow {
  if (period === "day") {
    return { start: today, end: today };
  }

  if (period === "week") {
    return { start: startOfUtcWeek(today), end: endOfUtcWeek(today) };
  }

  return { start: startOfUtcMonth(today), end: endOfUtcMonth(today) };
}

export function birthdayOccurrenceInYear(dateOfBirth: Date, year: number) {
  const month = dateOfBirth.getUTCMonth();
  const day = dateOfBirth.getUTCDate();

  if (month === 1 && day === 29 && !isLeapYear(year)) {
    return new Date(Date.UTC(year, 1, 28));
  }

  return new Date(Date.UTC(year, month, day));
}

export function birthdayInWindow(dateOfBirth: Date, window: DateWindow) {
  const years = new Set([window.start.getUTCFullYear(), window.end.getUTCFullYear()]);

  for (const year of years) {
    const occurrence = birthdayOccurrenceInYear(dateOfBirth, year);

    if (occurrence >= window.start && occurrence <= window.end && occurrence >= dateOfBirth) {
      return occurrence;
    }
  }

  return null;
}

export function turningAge(dateOfBirth: Date, occurrence: Date) {
  return occurrence.getUTCFullYear() - dateOfBirth.getUTCFullYear();
}
