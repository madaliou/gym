import { Badge } from "@/components/ui/badge";
import { SubscriptionRowActions } from "@/components/subscriptions/subscription-row-actions";
import { formatClubDate, parseIsoDate } from "@/lib/subscriptions/dates";
import type { SubscriptionListItem } from "@/lib/subscriptions/types";
import { subscriptionMonthsLabel } from "@/lib/validations/member";
import { subscriptionStatusLabels, type SubscriptionStatus } from "@/lib/validations/subscription";

const statusVariant: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  EXPIRED: "destructive",
  PENDING: "secondary",
  SUSPENDED: "outline",
  CANCELLED: "outline",
};

type SubscriptionTableProps = {
  subscriptions: SubscriptionListItem[];
};

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <caption className="sr-only">Liste des souscriptions</caption>
        <thead className="border-b border-border text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Membre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Durée
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Début
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Fin
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Statut
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="border-b border-border/70 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium">
                <span className="block">{subscription.memberName}</span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {subscription.phone ?? "—"}
                </span>
              </th>
              <td className="px-4 py-3 text-muted-foreground">
                {subscriptionMonthsLabel(subscription.durationMonths)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatClubDate(parseIsoDate(subscription.startDate))}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatClubDate(parseIsoDate(subscription.endDate))}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[subscription.status]}>
                  {subscriptionStatusLabels[subscription.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <SubscriptionRowActions subscription={subscription} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
