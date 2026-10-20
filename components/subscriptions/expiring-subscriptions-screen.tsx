import Link from "next/link";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { listExpiringSubscriptions } from "@/lib/services/subscription-service";
import { cn } from "@/lib/utils";

type ExpiringSubscriptionsScreenProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const horizons = [1, 3, 7, 30] as const;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseHorizon(value: string) {
  const horizon = Number(value);
  return horizons.find((item) => item === horizon) ?? 7;
}

export async function ExpiringSubscriptionsScreen({ searchParams }: ExpiringSubscriptionsScreenProps) {
  const params = await searchParams;
  const withinDays = parseHorizon(firstValue(params.within));
  let unavailable = false;
  let subscriptions: Awaited<ReturnType<typeof listExpiringSubscriptions>> = [];

  try {
    subscriptions = await listExpiringSubscriptions(withinDays);
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Abonnements expirants"
        description={`Souscriptions actives qui se terminent dans les ${withinDays} prochain${withinDays > 1 ? "s" : ""} jour${withinDays > 1 ? "s" : ""}.`}
      />
      <div className="flex flex-wrap gap-2">
        {horizons.map((horizon) => (
          <Link
            key={horizon}
            href={`/dashboard/subscriptions/expiring?within=${horizon}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm ring-1 ring-foreground/10",
              horizon === withinDays ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
            )}
            aria-current={horizon === withinDays ? "page" : undefined}
          >
            {horizon === 1 ? "1 jour" : `${horizon} jours`}
          </Link>
        ))}
      </div>
      {unavailable ? (
        <ErrorState
          title="Une erreur est survenue."
          description="Les échéances sont indisponibles."
        />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="Aucune échéance à traiter."
          description="Les abonnements proches de l'expiration apparaîtront ici."
        />
      ) : (
        <SubscriptionTable subscriptions={subscriptions} />
      )}
    </div>
  );
}
