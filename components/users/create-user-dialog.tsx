"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createUser } from "@/lib/users/actions";

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await createUser(formData);
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      return;
    }

    toast.success("Le gestionnaire a été créé.");
    setErrors({});
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setErrors({});
        }
      }}
    >
      <DialogTrigger render={<Button className="h-11 px-4" />}>Ajouter un gestionnaire</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau gestionnaire</DialogTitle>
          <DialogDescription>Ce compte pourra se connecter à GYMORA selon son rôle.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <UserFormFields idPrefix="create-user" errors={errors} passwordRequired />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
