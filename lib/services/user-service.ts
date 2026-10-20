import "server-only";
import { getPrismaClient } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import type { UserRole } from "@/lib/validations/user";

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserServiceError";
  }
}

export type StaffUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

function toStaffUser(user: StaffUser) {
  return user;
}

export async function countUsers() {
  const prisma = getPrismaClient();
  return prisma.user.count();
}

export async function findActiveUserByEmail(email: string) {
  const prisma = getPrismaClient();
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });
}

export async function markUserLoggedIn(id: string) {
  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function listUsers(): Promise<StaffUser[]> {
  const prisma = getPrismaClient();
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return users.map(toStaffUser);
}

export async function getUserById(id: string) {
  const prisma = getPrismaClient();
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

async function assertUniqueEmail(email: string, excludeId?: string) {
  const prisma = getPrismaClient();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing && existing.id !== excludeId) {
    throw new UserServiceError("Cet e-mail a déjà été utilisé.");
  }
}

async function countActiveAdmins(excludeId?: string) {
  const prisma = getPrismaClient();
  return prisma.user.count({
    where: {
      role: "ADMIN",
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createUserRecord(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const email = input.email.toLowerCase();
  await assertUniqueEmail(email);

  const prisma = getPrismaClient();
  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
}

export async function updateUserRecord(
  id: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    password?: string;
  },
) {
  const email = input.email.toLowerCase();
  await assertUniqueEmail(email, id);

  const current = await getUserById(id);
  if (!current) {
    throw new UserServiceError("Cet utilisateur est introuvable.");
  }

  if (current.role === "ADMIN" && current.isActive && (input.role !== "ADMIN" || !input.isActive)) {
    const remaining = await countActiveAdmins(id);
    if (remaining === 0) {
      throw new UserServiceError("Le dernier administrateur actif ne peut pas être retiré.");
    }
  }

  const prisma = getPrismaClient();
  return prisma.user.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      role: input.role,
      isActive: input.isActive,
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}
