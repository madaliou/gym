"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMember } from "@/lib/members/actions";
import { todayDateInputValue } from "@/lib/members/today";
import { memberPhotoClientError } from "@/lib/storage/image-rules";
import {
  createMemberFormSchema,
  type CreateMemberFormValues,
} from "@/lib/validations/member";

type CreateMemberDialogProps = {
  defaultOpen?: boolean;
};

function createDefaultValues(): CreateMemberFormValues {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "UNSPECIFIED",
    dateOfBirth: "",
    address: "",
    notes: "",
    subscriptionMonths: "1",
    joinedAt: todayDateInputValue(),
  };
}

export function CreateMemberDialog({ defaultOpen = false }: CreateMemberDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberFormSchema),
    defaultValues: createDefaultValues(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPhoto() {
    setPhoto(null);
    setPhotoError(null);
    setPreviewUrl(null);
    setPhotoInputKey((current) => current + 1);
  }

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setOpen(false);
    reset(createDefaultValues());
    clearPhoto();

    if (pathname === "/dashboard/members/new") {
      router.push("/dashboard/members");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    closeDialog();
  }

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const message = file ? memberPhotoClientError(file) : null;

    setPhotoError(message);
    setPhoto(message ? null : file);
    setPreviewUrl(file && !message ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(values: CreateMemberFormValues) {
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

    const result = await createMember(formData);

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

          setError(field as keyof CreateMemberFormValues, { message });
        }
      }

      toast.error(result.message);
      return;
    }

    toast.success("Le membre a été ajouté avec succès.");
    reset(createDefaultValues());
    clearPhoto();
    setOpen(false);
    router.refresh();

    if (pathname === "/dashboard/members/new") {
      router.push("/dashboard/members");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="h-11 px-4" />}>
        Ajouter un membre
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(92svh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5 pr-12 pb-2">
          <DialogTitle className="text-lg">Nouveau membre</DialogTitle>
          <DialogDescription>
            Complétez la fiche d&apos;adhésion. Les champs marqués d&apos;une étoile sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <MemberProfileFields
              idPrefix="create"
              register={register}
              errors={errors}
              includeSubscription
              photoError={photoError}
              previewUrl={previewUrl}
              photoInputKey={photoInputKey}
              cameraInputRef={cameraInputRef}
              fileInputRef={fileInputRef}
              onPhotoChange={onPhotoChange}
            />
          </div>
          <DialogFooter className="mx-0 mb-0">
            <Button type="button" variant="outline" className="h-11" onClick={closeDialog} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer le membre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
