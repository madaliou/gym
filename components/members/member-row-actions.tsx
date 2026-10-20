"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditMemberDialog } from "@/components/members/edit-member-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMember } from "@/lib/members/actions";
import type { MemberEditable } from "@/lib/members/types";

type MemberRowActionsProps = {
  member: MemberEditable;
};

export function MemberRowActions({ member }: MemberRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    const result = await deleteMember(member.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Le membre a été supprimé.");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Modifier ${member.firstName} ${member.lastName}`}
          onClick={() => setEditOpen(true)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          aria-label={`Supprimer ${member.firstName} ${member.lastName}`}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      <EditMemberDialog member={member} open={editOpen} onOpenChange={setEditOpen} />
      <Dialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce membre ?</DialogTitle>
            <DialogDescription>
              {member.firstName} {member.lastName} et ses souscriptions seront définitivement retirés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
