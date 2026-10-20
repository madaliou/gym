"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MemberProfileFields } from "@/components/members/member-profile-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateMember } from "@/lib/members/actions";
import type { MemberEditable } from "@/lib/members/types";
import { memberPhotoClientError } from "@/lib/storage/image-rules";
import {
  updateMemberFormSchema,
  type UpdateMemberFormValues,
} from "@/lib/validations/member";

type EditMemberDialogProps = {
  member: MemberEditable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function valuesFromMember(member: MemberEditable): UpdateMemberFormValues {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    email: member.email,
    gender: member.gender,
    dateOfBirth: member.dateOfBirth,
    address: member.address,
    notes: member.notes,
    joinedAt: member.joinedAt,
  };
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(member.photoUrl);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const form = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberFormSchema),
    defaultValues: valuesFromMember(member),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset(valuesFromMember(member));
      setPhoto(null);
      setPhotoError(null);
      setPreviewUrl(member.photoUrl);
      setPhotoInputKey((current) => current + 1);
    }
  }, [member, open, reset]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const message = file ? memberPhotoClientError(file) : null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPhotoError(message);
    setPhoto(message ? null : file);
    if (file && !message) {
      objectUrlRef.current = URL.createObjectURL(file);
      setPreviewUrl(objectUrlRef.current);
      return;
    }

    setPreviewUrl(member.photoUrl);
  }

  async function onSubmit(values: UpdateMemberFormValues) {
    if (photo) {
      const message = memberPhotoClientError(photo);
      if (message) {
        setPhotoError(message);
        return;
      }
    }

    const formData = new FormData();

    for (const [field, value] of Object.entries(values)) {
      formData.set(field, value);
    }

    if (photo) {
      formData.set("photo", photo);
    }

    const result = await updateMember(member.id, formData);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (!message) {
            continue;
          }

          if (field === "photo") {
            setPhotoError(message);
            continue;
          }

          setError(field as keyof UpdateMemberFormValues, { message });
        }
      }

      toast.error(result.message);
      return;
    }

    toast.success("La fiche du membre a été mise à jour.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(92svh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5 pr-12 pb-2">
          <DialogTitle className="text-lg">Modifier le membre</DialogTitle>
          <DialogDescription>
            Mettez à jour la fiche. La durée de souscription se gère dans l&apos;onglet Souscriptions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <MemberProfileFields
              idPrefix={`edit-${member.id}`}
              control={control}
              register={register}
              errors={errors}
              photoError={photoError}
              previewUrl={previewUrl}
              photoInputKey={photoInputKey}
              cameraInputRef={cameraInputRef}
              fileInputRef={fileInputRef}
              onPhotoChange={onPhotoChange}
            />
          </div>
          <DialogFooter className="mx-0 mb-0">
            <Button type="button" variant="outline" className="h-11" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
