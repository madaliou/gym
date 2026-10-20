import "server-only";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  subscriptionEndDate,
  subscriptionStatusForPeriod,
  todayUtcDate,
} from "@/lib/subscriptions/dates";
import { memberPhotoDisplayUrl } from "@/lib/members/photo-url";
import type { CreateMemberInput, UpdateMemberInput } from "@/lib/validations/member";
import type { SubscriptionStatus } from "@/lib/validations/subscription";

export type MemberListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  gender: CreateMemberInput["gender"];
  dateOfBirth: Date | null;
  photoUrl: string | null;
  address: string | null;
  notes: string | null;
  status: CreateMemberInput["status"];
  joinedAt: Date;
  currentSubscription: {
    durationMonths: number;
    endDate: Date;
    status: SubscriptionStatus;
  } | null;
};

function pickCurrentSubscription(
  subscriptions: {
    durationMonths: number;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
  }[],
  today: Date,
) {
  const covering = subscriptions.find(
    (subscription) =>
      (subscription.status === "ACTIVE" || subscription.status === "SUSPENDED") &&
      subscription.startDate <= today &&
      subscription.endDate >= today,
  );

  if (covering) {
    return covering;
  }

  const upcoming = [...subscriptions]
    .filter((subscription) => subscription.status === "PENDING" && subscription.startDate >= today)
    .sort((left, right) => left.startDate.getTime() - right.startDate.getTime())[0];

  if (upcoming) {
    return upcoming;
  }

  return subscriptions[0] ?? null;
}

export async function listMembers(): Promise<MemberListItem[]> {
  const prisma = getPrismaClient();
  const today = todayUtcDate();
  const members = await prisma.member.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      dateOfBirth: true,
      photoUrl: true,
      address: true,
      notes: true,
      status: true,
      joinedAt: true,
      subscriptions: {
        orderBy: { endDate: "desc" },
        take: 5,
        select: {
          durationMonths: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  });

  return members.map((member) => {
    const current = pickCurrentSubscription(member.subscriptions, today);

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      photoUrl: member.photoUrl,
      address: member.address,
      notes: member.notes,
      status: member.status,
      joinedAt: member.joinedAt,
      currentSubscription: current
        ? {
            durationMonths: current.durationMonths,
            endDate: current.endDate,
            status: current.status,
          }
        : null,
    };
  });
}

export class UniqueMemberFieldError extends Error {
  constructor(
    readonly field: "email" | "phone",
    message: string,
  ) {
    super(message);
    this.name = "UniqueMemberFieldError";
  }
}

const uniqueFieldMessages = {
  email: "Cet e-mail a déjà été utilisé.",
  phone: "Ce téléphone a déjà été utilisé.",
} as const;

async function assertUniqueMemberFields(
  input: { phone: string; email: string | null },
  excludeId?: string,
) {
  const prisma = getPrismaClient();
  const duplicates = await prisma.member.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { phone: input.phone },
        ...(input.email ? [{ email: input.email }] : []),
      ],
    },
    select: { email: true, phone: true },
  });

  if (duplicates.some((member) => member.phone === input.phone)) {
    throw new UniqueMemberFieldError("phone", uniqueFieldMessages.phone);
  }

  if (input.email && duplicates.some((member) => member.email === input.email)) {
    throw new UniqueMemberFieldError("email", uniqueFieldMessages.email);
  }
}

export async function createMemberRecord(input: CreateMemberInput) {
  const prisma = getPrismaClient();
  await assertUniqueMemberFields(input);

  const today = todayUtcDate();
  const endDate = subscriptionEndDate(input.joinedAt, input.subscriptionMonths);

  const created = await prisma.member.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      photoUrl: input.photoUrl,
      photoData: input.photoData ? Buffer.from(input.photoData) : undefined,
      photoMime: input.photoMime,
      address: input.address,
      city: input.city,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      notes: input.notes,
      status: input.status,
      subscriptionMonths: input.subscriptionMonths,
      joinedAt: input.joinedAt,
      subscriptions: {
        create: {
          durationMonths: input.subscriptionMonths,
          startDate: input.joinedAt,
          endDate,
          status: subscriptionStatusForPeriod(input.joinedAt, endDate, today),
        },
      },
    },
    select: { id: true },
  });

  if (input.photoData && !input.photoUrl) {
    await prisma.member.update({
      where: { id: created.id },
      data: { photoUrl: memberPhotoDisplayUrl({ id: created.id, photoUrl: null, photoMime: input.photoMime }) },
    });
  }

  return created;
}

export async function updateMemberRecord(id: string, input: UpdateMemberInput) {
  const prisma = getPrismaClient();
  const current = await prisma.member.findUnique({
    where: { id },
    select: { id: true, photoUrl: true },
  });

  if (!current) {
    throw new Error("Ce membre est introuvable.");
  }

  await assertUniqueMemberFields(input, id);

  const replacingPhoto = Boolean(input.photoData || input.photoUrl);

  await prisma.member.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      ...(replacingPhoto
        ? {
            photoUrl: input.photoUrl ?? memberPhotoDisplayUrl({ id, photoUrl: null, photoMime: input.photoMime }),
            photoData: input.photoData ? Buffer.from(input.photoData) : null,
            photoMime: input.photoMime ?? null,
          }
        : {}),
      address: input.address,
      notes: input.notes,
      joinedAt: input.joinedAt,
    },
  });

  return { previousPhotoUrl: current.photoUrl };
}

export async function deleteMemberRecord(id: string) {
  const prisma = getPrismaClient();
  const current = await prisma.member.findUnique({
    where: { id },
    select: { id: true, photoUrl: true },
  });

  if (!current) {
    throw new Error("Ce membre est introuvable.");
  }

  await prisma.subscription.deleteMany({ where: { memberId: id } });
  await prisma.member.delete({ where: { id } });

  return { photoUrl: current.photoUrl };
}

function prismaErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }

  return null;
}

function errorText(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause =
    error.cause instanceof Error
      ? error.cause.message
      : typeof error.cause === "object" && error.cause && "message" in error.cause
        ? String(error.cause.message)
        : "";

  return `${error.name} ${error.message} ${cause}`;
}

function mysqlErrno(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("errno" in error) {
    return String(error.errno);
  }

  if ("cause" in error && typeof error.cause === "object" && error.cause && "errno" in error.cause) {
    return String(error.cause.errno);
  }

  return null;
}

export function uniqueMemberFieldFromError(error: unknown): UniqueMemberFieldError | null {
  if (error instanceof UniqueMemberFieldError) {
    return error;
  }

  if (error instanceof Error && error.name === "UniqueMemberFieldError") {
    const field = "field" in error && (error.field === "email" || error.field === "phone") ? error.field : null;
    if (field) {
      return new UniqueMemberFieldError(field, uniqueFieldMessages[field]);
    }
  }

  const text = errorText(error).toLowerCase();
  const duplicate =
    prismaErrorCode(error) === "P2002" ||
    mysqlErrno(error) === "1062" ||
    text.includes("duplicate entry") ||
    text.includes("unique constraint");

  if (!duplicate) {
    return null;
  }

  const target =
    typeof error === "object" && error !== null && "meta" in error
      ? (error.meta as { target?: unknown })?.target
      : undefined;
  const fields = Array.isArray(target) ? target.map(String) : typeof target === "string" ? [target] : [];

  if (fields.some((item) => item.includes("phone")) || text.includes("phone")) {
    return new UniqueMemberFieldError("phone", uniqueFieldMessages.phone);
  }

  if (fields.some((item) => item.includes("email")) || text.includes("email")) {
    return new UniqueMemberFieldError("email", uniqueFieldMessages.email);
  }

  return new UniqueMemberFieldError("phone", uniqueFieldMessages.phone);
}
