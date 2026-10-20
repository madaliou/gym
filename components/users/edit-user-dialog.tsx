"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { UserFormFields } from "@/components/users/user-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUser } from "@/lib/users/actions";
import type { UserRole } from "@/lib/validations/user";

type EditUserDialogProps = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
};

export function EditUserDialog({ user }: EditUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await updateUser(user.id, formData);
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      return;
    }

    toast.success("Le compte a été mis à jour.");
    setErrors({});
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Modifier ${user.firstName} ${user.lastName}`}
        onClick={() => setOpen(true)}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le gestionnaire</DialogTitle>
            <DialogDescription>Mettez à jour le rôle, le statut ou le mot de passe.</DialogDescription>
          </DialogHeader>
          <form action={onSubmit} className="flex flex-col gap-4">
            <UserFormFields
              idPrefix={`edit-user-${user.id}`}
              errors={errors}
              showStatus
              defaultValues={user}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
