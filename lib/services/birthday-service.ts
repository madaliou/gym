import "server-only";
import {
  birthdayInWindow,
  birthdayWindow,
  turningAge,
  type BirthdayPeriod,
} from "@/lib/birthdays/calendar";
import { birthdayMailto, birthdayMessage, birthdayEmailSubject } from "@/lib/birthdays/message";
import { getPrismaClient } from "@/lib/db/prisma";
import { whatsAppUrl } from "@/lib/reminders/expiration";
import { formatClubDate, todayUtcDate } from "@/lib/subscriptions/dates";

export type BirthdayListItem = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  age: number;
  occurrence: Date;
  occurrenceLabel: string;
  message: string;
  whatsAppHref: string | null;
  mailtoHref: string | null;
};

export async function listBirthdays(
  period: BirthdayPeriod,
  today = todayUtcDate(),
): Promise<BirthdayListItem[]> {
  const prisma = getPrismaClient();
  const window = birthdayWindow(period, today);
  const members = await prisma.member.findMany({
    where: {
      dateOfBirth: { not: null },
      status: { not: "ARCHIVED" },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      phone: true,
      email: true,
      dateOfBirth: true,
    },
  });

  return members
    .flatMap((member) => {
      if (!member.dateOfBirth) {
        return [];
      }

      const occurrence = birthdayInWindow(member.dateOfBirth, window);

      if (!occurrence) {
        return [];
      }

      const age = turningAge(member.dateOfBirth, occurrence);

      if (age < 0) {
        return [];
      }

      const message = birthdayMessage({
        firstName: member.firstName,
        lastName: member.lastName,
        age,
      });

      return [
        {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          photoUrl: member.photoUrl,
          phone: member.phone,
          email: member.email,
          age,
          occurrence,
          occurrenceLabel: formatClubDate(occurrence),
          message,
          whatsAppHref: member.phone ? whatsAppUrl(member.phone, message) : null,
          mailtoHref: member.email
            ? birthdayMailto(member.email, birthdayEmailSubject(member.firstName), message)
            : null,
        },
      ];
    })
    .sort((left, right) => {
      const byDate = left.occurrence.getTime() - right.occurrence.getTime();

      if (byDate !== 0) {
        return byDate;
      }

      return `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, "fr");
    });
}

export async function listBirthdayGroups(today = todayUtcDate()) {
  const [day, week, month] = await Promise.all([
    listBirthdays("day", today),
    listBirthdays("week", today),
    listBirthdays("month", today),
  ]);

  return { day, week, month };
}
