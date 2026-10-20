"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { expirationReminderMessage, whatsAppUrl } from "@/lib/reminders/expiration";
import { formatClubDate, parseIsoDate, subscriptionEndDate } from "@/lib/subscriptions/dates";
import {
  cancelSubscription,
  reactivateSubscription,
  renewSubscription,
  suspendSubscription,
} from "@/lib/subscriptions/actions";
import type { SubscriptionListItem } from "@/lib/subscriptions/types";
import { subscriptionMonthsLabel, subscriptionMonthValues } from "@/lib/validations/member";

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type SubscriptionRowActionsProps = {
  subscription: SubscriptionListItem;
};

export function SubscriptionRowActions({ subscription }: SubscriptionRowActionsProps) {
  const [pending, startTransition] = useTransition();
  const [renewOpen, setRenewOpen] = useState(false);
  const [durationMonths, setDurationMonths] = useState(String(subscription.durationMonths));
  const endLabel = formatClubDate(
    subscriptionEndDate(parseIsoDate(subscription.renewStartDate), Number(durationMonths || "1")),
  );
  const reminderMessage = expirationReminderMessage({
    firstName: subscription.firstName,
    endDateLabel: formatClubDate(parseIsoDate(subscription.endDate)),
    expired: subscription.status === "EXPIRED",
  });
  const whatsAppHref =
    subscription.phone && (subscription.status === "ACTIVE" || subscription.status === "EXPIRED")
      ? whatsAppUrl(subscription.phone, reminderMessage)
      : null;

  function run(
    action: () => Promise<{ ok: true } | { ok: false; message: string }>,
    success: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(success);
    });
  }

  function onRenew(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await renewSubscription(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("La souscription a été renouvelée.");
      setRenewOpen(false);
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setRenewOpen(true)}>
        Renouveler
      </Button>
      {whatsAppHref ? (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
        >
          WhatsApp
        </a>
      ) : null}
      {subscription.status === "ACTIVE" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => suspendSubscription(subscription.id), "La souscription a été suspendue.")}
        >
          Suspendre
        </Button>
      ) : null}
      {subscription.status === "SUSPENDED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(() => reactivateSubscription(subscription.id), "La souscription a été réactivée.")
          }
        >
          Réactiver
        </Button>
      ) : null}
      {subscription.status === "ACTIVE" ||
      subscription.status === "PENDING" ||
      subscription.status === "SUSPENDED" ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Annuler la souscription de ${subscription.memberName} ?`)) {
              return;
            }

            run(() => cancelSubscription(subscription.id), "La souscription a été annulée.");
          }}
        >
          Annuler
        </Button>
      ) : null}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renouveler</DialogTitle>
            <DialogDescription>
              Nouvelle période pour {subscription.memberName}, à partir du{" "}
              {formatClubDate(parseIsoDate(subscription.renewStartDate))}. L&apos;ancienne souscription est
              conservée.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={onRenew}>
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <div className="grid gap-2">
              <Label htmlFor={`renew-${subscription.id}`}>Durée</Label>
              <select
                id={`renew-${subscription.id}`}
                name="durationMonths"
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
            <p className="text-sm text-muted-foreground">Fin de la période : {endLabel}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenewOpen(false)} disabled={pending}>
                Fermer
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Enregistrement..." : "Renouveler"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
