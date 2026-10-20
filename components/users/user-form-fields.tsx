"use client";

import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userRoleLabels, userRoles } from "@/lib/validations/user";
import { cn } from "@/lib/utils";

type UserFormFieldsProps = {
  idPrefix: string;
  errors: Partial<Record<string, string>>;
  defaultValues?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive?: boolean;
  };
  passwordRequired?: boolean;
  showStatus?: boolean;
};

export function UserFormFields({
  idPrefix,
  errors,
  defaultValues,
  passwordRequired = false,
  showStatus = false,
}: UserFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-firstName`}>Prénom</Label>
        <Input
          id={`${idPrefix}-firstName`}
          name="firstName"
          className="h-11"
          defaultValue={defaultValues?.firstName}
          aria-invalid={Boolean(errors.firstName)}
          required
        />
        {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-lastName`}>Nom</Label>
        <Input
          id={`${idPrefix}-lastName`}
          name="lastName"
          className="h-11"
          defaultValue={defaultValues?.lastName}
          aria-invalid={Boolean(errors.lastName)}
          required
        />
        {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName}</p> : null}
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-email`}>E-mail</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          className="h-11"
          defaultValue={defaultValues?.email}
          aria-invalid={Boolean(errors.email)}
          required
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-role`}>Rôle</Label>
        <FormSelect
          id={`${idPrefix}-role`}
          name="role"
          defaultValue={defaultValues?.role ?? "MANAGER"}
          invalid={Boolean(errors.role)}
          options={userRoles.map((role) => ({
            value: role,
            label: userRoleLabels[role],
          }))}
        />
        {errors.role ? <p className="text-xs text-destructive">{errors.role}</p> : null}
      </div>
      {showStatus ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-isActive`}>Statut</Label>
          <FormSelect
            id={`${idPrefix}-isActive`}
            name="isActive"
            defaultValue={defaultValues?.isActive === false ? "false" : "true"}
            options={[
              { value: "true", label: "Actif" },
              { value: "false", label: "Désactivé" },
            ]}
          />
        </div>
      ) : null}
      <div className={cn("flex flex-col gap-2", showStatus ? "sm:col-span-2" : "sm:col-span-2")}>
        <Label htmlFor={`${idPrefix}-password`}>
          {passwordRequired ? "Mot de passe" : "Nouveau mot de passe"}
        </Label>
        <Input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          required={passwordRequired}
        />
        <p className="text-xs text-muted-foreground">
          {passwordRequired
            ? "10 caractères minimum, avec une lettre et un chiffre."
            : "Laissez vide pour conserver le mot de passe actuel."}
        </p>
        {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
      </div>
    </div>
  );
}
