"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayDateInputValue } from "@/lib/members/today";
import { formatClubDate, parseIsoDate, subscriptionEndDate } from "@/lib/subscriptions/dates";
import { toastEmailDelivery } from "@/components/email/delivery-toast";
import { createSubscription } from "@/lib/subscriptions/actions";
import type { MemberOption } from "@/lib/subscriptions/types";
import { subscriptionMonthsLabel, subscriptionMonthValues } from "@/lib/validations/member";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type CreateSubscriptionDialogProps = {
  members: MemberOption[];
};

export function CreateSubscriptionDialog({ members }: CreateSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [durationMonths, setDurationMonths] = useState("1");
  const [startDate, setStartDate] = useState(todayDateInputValue());
  const [pending, setPending] = useState(false);

  const endLabel =
    durationMonths && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      ? formatClubDate(subscriptionEndDate(parseIsoDate(startDate), Number(durationMonths)))
      : null;

  function resetForm() {
    setMemberId("");
    setDurationMonths("1");
    setStartDate(todayDateInputValue());
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    const result = await createSubscription(formData);
    setPending(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("La souscription a été enregistrée.");
    toastEmailDelivery(result.email);
    setOpen(false);
    resetForm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetForm();
          }
        }
      }}
    >
      <DialogTrigger render={<Button type="button" disabled={members.length === 0} />}>
        Nouvelle souscription
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle souscription</DialogTitle>
          <DialogDescription>
            Choisissez le membre, la durée et la date de début. Un e-mail de confirmation part si SMTP est configuré.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="memberId">Membre</Label>
            <select
              id="memberId"
              name="memberId"
              required
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              className={selectClassName}
            >
              <option value="">Choisir</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="durationMonths">Durée</Label>
              <select
                id="durationMonths"
                name="durationMonths"
                required
                value={durationMonths}
                onChange={(event) => setDurationMonths(event.target.value)}
                className={selectClassName}
              >
                {subscriptionMonthValues.map((months) => (
                  <option key={months} value={months}>
                    {subscriptionMonthsLabel(Number(months))}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="h-11"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
          </div>
          <p className={cn("text-sm text-muted-foreground", !endLabel && "invisible")}>
            Fin de la période : {endLabel ?? "—"}
          </p>
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
  );
}
