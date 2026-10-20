"use client";

import { Camera, FolderOpen } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEMBER_PHOTO_ACCEPT } from "@/lib/storage/image-rules";
import { cn } from "@/lib/utils";
import {
  memberGenderLabels,
  memberGenders,
  subscriptionMonthValues,
  subscriptionMonthsLabel,
  type CreateMemberFormValues,
  type UpdateMemberFormValues,
} from "@/lib/validations/member";

export const memberSelectClassName =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

type MemberFormValues = CreateMemberFormValues | UpdateMemberFormValues;

type MemberProfileFieldsProps = {
  idPrefix: string;
  register: UseFormRegister<CreateMemberFormValues> | UseFormRegister<UpdateMemberFormValues>;
  errors: FieldErrors<MemberFormValues>;
  includeSubscription?: boolean;
  photoError: string | null;
  previewUrl: string | null;
  photoInputKey: number;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function MemberProfileFields({
  idPrefix,
  register,
  errors,
  includeSubscription = false,
  photoError,
  previewUrl,
  photoInputKey,
  cameraInputRef,
  fileInputRef,
  onPhotoChange,
}: MemberProfileFieldsProps) {
  const createRegister = register as UseFormRegister<CreateMemberFormValues>;
  const fields = register as UseFormRegister<UpdateMemberFormValues>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={`${idPrefix}-firstName`} label="Prénom" required error={errors.firstName?.message}>
        <Input
          id={`${idPrefix}-firstName`}
          className="h-11"
          autoComplete="given-name"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? `${idPrefix}-firstName-error` : undefined}
          {...fields("firstName")}
        />
      </Field>
      <Field id={`${idPrefix}-lastName`} label="Nom" required error={errors.lastName?.message}>
        <Input
          id={`${idPrefix}-lastName`}
          className="h-11"
          autoComplete="family-name"
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? `${idPrefix}-lastName-error` : undefined}
          {...fields("lastName")}
        />
      </Field>
      <Field id={`${idPrefix}-phone`} label="Téléphone" required error={errors.phone?.message}>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          className="h-11"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${idPrefix}-phone-error` : undefined}
          {...fields("phone")}
        />
      </Field>
      <Field id={`${idPrefix}-email`} label="E-mail" error={errors.email?.message}>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          className="h-11"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          {...fields("email")}
        />
      </Field>
      <Field id={`${idPrefix}-gender`} label="Genre" error={errors.gender?.message}>
        <select
          id={`${idPrefix}-gender`}
          className={cn(memberSelectClassName, errors.gender && "border-destructive")}
          aria-invalid={Boolean(errors.gender)}
          aria-describedby={errors.gender ? `${idPrefix}-gender-error` : undefined}
          {...fields("gender")}
        >
          {memberGenders.map((gender) => (
            <option key={gender} value={gender}>
              {memberGenderLabels[gender]}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${idPrefix}-dateOfBirth`} label="Date de naissance" error={errors.dateOfBirth?.message}>
        <Input
          id={`${idPrefix}-dateOfBirth`}
          type="date"
          className="h-11"
          aria-invalid={Boolean(errors.dateOfBirth)}
          aria-describedby={errors.dateOfBirth ? `${idPrefix}-dateOfBirth-error` : undefined}
          {...fields("dateOfBirth")}
        />
      </Field>
      <Field
        id={`${idPrefix}-photo`}
        label="Photo"
        error={photoError ?? undefined}
        className="sm:col-span-2"
        hint="JPG, PNG ou WebP. 5 Mo maximum. Le fichier est enregistré dans le dossier du club."
      >
        <div className="flex flex-wrap items-center gap-3">
          {previewUrl ? (
            <div
              role="img"
              aria-label="Aperçu de la photo"
              className="size-16 shrink-0 rounded-xl bg-cover bg-center ring-1 ring-foreground/10"
              style={{ backgroundImage: `url("${previewUrl}")` }}
            />
          ) : null}
          <input
            ref={cameraInputRef}
            key={`camera-${photoInputKey}`}
            id={`${idPrefix}-photo-camera`}
            type="file"
            accept={MEMBER_PHOTO_ACCEPT}
            capture="environment"
            className="sr-only"
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? `${idPrefix}-photo-error` : `${idPrefix}-photo-hint`}
            onChange={onPhotoChange}
          />
          <input
            ref={fileInputRef}
            key={`file-${photoInputKey}`}
            id={`${idPrefix}-photo-file`}
            type="file"
            accept={MEMBER_PHOTO_ACCEPT}
            className="sr-only"
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? `${idPrefix}-photo-error` : `${idPrefix}-photo-hint`}
            onChange={onPhotoChange}
          />
          <Button type="button" variant="outline" className="h-11" onClick={() => cameraInputRef.current?.click()}>
            <Camera aria-hidden="true" />
            {previewUrl ? "Reprendre la photo" : "Prendre une photo"}
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen aria-hidden="true" />
            Choisir un fichier
          </Button>
        </div>
      </Field>
      <Field
        id={`${idPrefix}-address`}
        label="Adresse"
        error={errors.address?.message}
        className="sm:col-span-2"
      >
        <Input
          id={`${idPrefix}-address`}
          className="h-11"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.address)}
          aria-describedby={errors.address ? `${idPrefix}-address-error` : undefined}
          {...fields("address")}
        />
      </Field>
      {includeSubscription ? (
        <Field
          id={`${idPrefix}-subscriptionMonths`}
          label="Durée de souscription"
          required
          error={"subscriptionMonths" in errors ? errors.subscriptionMonths?.message : undefined}
        >
          <select
            id={`${idPrefix}-subscriptionMonths`}
            className={cn(
              memberSelectClassName,
              "subscriptionMonths" in errors && errors.subscriptionMonths && "border-destructive",
            )}
            aria-invalid={Boolean("subscriptionMonths" in errors && errors.subscriptionMonths)}
            aria-describedby={
              "subscriptionMonths" in errors && errors.subscriptionMonths
                ? `${idPrefix}-subscriptionMonths-error`
                : undefined
            }
            {...createRegister("subscriptionMonths")}
          >
            {subscriptionMonthValues.map((months) => (
              <option key={months} value={months}>
                {subscriptionMonthsLabel(Number(months))}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field
        id={`${idPrefix}-joinedAt`}
        label="Date d'adhésion"
        required
        error={errors.joinedAt?.message}
        className={includeSubscription ? undefined : "sm:col-span-2"}
      >
        <Input
          id={`${idPrefix}-joinedAt`}
          type="date"
          className="h-11"
          aria-invalid={Boolean(errors.joinedAt)}
          aria-describedby={errors.joinedAt ? `${idPrefix}-joinedAt-error` : undefined}
          {...fields("joinedAt")}
        />
      </Field>
      <Field id={`${idPrefix}-notes`} label="Notes" error={errors.notes?.message} className="sm:col-span-2">
        <Textarea
          id={`${idPrefix}-notes`}
          rows={4}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? `${idPrefix}-notes-error` : undefined}
          {...fields("notes")}
        />
      </Field>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, required = false, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
