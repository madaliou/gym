import { z } from "zod";

export const memberGenders = ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"] as const;
export const memberStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"] as const;

export const subscriptionMonthValues = ["1", "2", "3", "4", "5", "6"] as const;

export function subscriptionMonthsLabel(months: number) {
  return months === 1 ? "1 mois" : `${months} mois`;
}

export const memberGenderLabels: Record<(typeof memberGenders)[number], string> = {
  FEMALE: "Femme",
  MALE: "Homme",
  OTHER: "Autre",
  UNSPECIFIED: "Non précisé",
};

export const memberStatusLabels: Record<(typeof memberStatuses)[number], string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  ARCHIVED: "Archivé",
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string) {
  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const optionalText = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);

const memberProfileFields = {
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est obligatoire.")
    .max(80, "80 caractères maximum."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire.")
    .max(80, "80 caractères maximum."),
  phone: z
    .string()
    .trim()
    .min(1, "Le téléphone est obligatoire.")
    .max(30, "30 caractères maximum.")
    .refine(
      (value) => /^\+?[0-9][0-9\s().-]{5,}$/.test(value),
      "Le numéro de téléphone est invalide.",
    ),
  email: optionalText(190).refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    "L'adresse e-mail est invalide.",
  ),
  gender: z.enum(memberGenders, "Choisissez un genre."),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || isValidDate(value), "La date de naissance est invalide."),
  address: optionalText(191),
  notes: z.string().trim().max(2000, "2 000 caractères maximum."),
  joinedAt: z
    .string()
    .trim()
    .refine(isValidDate, "La date d'adhésion est obligatoire."),
};

function refineBirthDate(value: { dateOfBirth: string }, context: z.core.$RefinementCtx) {
  if (value.dateOfBirth.length === 0) {
    return;
  }

  const today = new Date();
  const birthDate = new Date(`${value.dateOfBirth}T00:00:00.000Z`);
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  if (birthDate > todayUtc) {
    context.addIssue({
      code: "custom",
      path: ["dateOfBirth"],
      message: "La date de naissance ne peut pas être dans le futur.",
    });
  }
}

export const updateMemberFormSchema = z.object(memberProfileFields).superRefine(refineBirthDate);

export const createMemberFormSchema = z
  .object({
    ...memberProfileFields,
    subscriptionMonths: z.string().refine(
      (value) => (subscriptionMonthValues as readonly string[]).includes(value),
      "Choisissez une durée de souscription.",
    ),
  })
  .superRefine(refineBirthDate);

export type UpdateMemberFormValues = z.infer<typeof updateMemberFormSchema>;
export type CreateMemberFormValues = z.infer<typeof createMemberFormSchema>;

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: (typeof memberGenders)[number];
  dateOfBirth: Date | null;
  photoUrl: string | null;
  photoData?: Uint8Array | null;
  photoMime?: string | null;
  address: string | null;
  city: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  status: (typeof memberStatuses)[number];
  subscriptionMonths: number;
  joinedAt: Date;
};

function emptyToNull(value: string) {
  return value.length === 0 ? null : value;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export type UpdateMemberInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: (typeof memberGenders)[number];
  dateOfBirth: Date | null;
  photoUrl?: string | null;
  photoData?: Uint8Array | null;
  photoMime?: string | null;
  address: string | null;
  notes: string | null;
  joinedAt: Date;
};

export function toCreateMemberInput(
  values: CreateMemberFormValues,
  photoUrl: string | null,
): CreateMemberInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    email: emptyToNull(values.email),
    gender: values.gender,
    dateOfBirth: values.dateOfBirth.length === 0 ? null : parseDate(values.dateOfBirth),
    photoUrl,
    address: emptyToNull(values.address),
    city: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    notes: emptyToNull(values.notes),
    status: "ACTIVE",
    subscriptionMonths: Number(values.subscriptionMonths),
    joinedAt: parseDate(values.joinedAt),
  };
}

export function toUpdateMemberInput(
  values: UpdateMemberFormValues,
  photoUrl?: string | null,
): UpdateMemberInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    email: emptyToNull(values.email),
    gender: values.gender,
    dateOfBirth: values.dateOfBirth.length === 0 ? null : parseDate(values.dateOfBirth),
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    address: emptyToNull(values.address),
    notes: emptyToNull(values.notes),
    joinedAt: parseDate(values.joinedAt),
  };
}
