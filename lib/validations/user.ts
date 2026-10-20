import { z } from "zod";

export const userRoles = ["ADMIN", "MANAGER", "RECEPTIONIST", "COACH"] as const;

export const userRoleLabels: Record<(typeof userRoles)[number], string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  RECEPTIONIST: "Réceptionniste",
  COACH: "Coach",
};

const optionalText = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);

const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(72, "72 caractères maximum.")
  .refine((value) => /[A-Za-z]/.test(value) && /[0-9]/.test(value), {
    message: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
  });

const profileFields = {
  firstName: z.string().trim().min(1, "Le prénom est obligatoire.").max(80, "80 caractères maximum."),
  lastName: z.string().trim().min(1, "Le nom est obligatoire.").max(80, "80 caractères maximum."),
  email: z
    .string()
    .trim()
    .min(1, "L'e-mail est obligatoire.")
    .max(190, "190 caractères maximum.")
    .refine((value) => z.email().safeParse(value).success, "L'adresse e-mail est invalide."),
  role: z.enum(userRoles, "Choisissez un rôle."),
};

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, "L'e-mail est obligatoire."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const setupAdminFormSchema = z.object({
  ...profileFields,
  password: passwordSchema,
});

export const createUserFormSchema = z.object({
  ...profileFields,
  password: passwordSchema,
});

export const updateUserFormSchema = z.object({
  ...profileFields,
  isActive: z.enum(["true", "false"]),
  password: optionalText(72).refine(
    (value) => value.length === 0 || passwordSchema.safeParse(value).success,
    "Le mot de passe doit contenir au moins 10 caractères, une lettre et un chiffre.",
  ),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SetupAdminFormValues = z.infer<typeof setupAdminFormSchema>;
export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
export type UserRole = (typeof userRoles)[number];
