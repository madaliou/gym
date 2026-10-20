import Link from "next/link";
import { CreateSubscriptionDialog } from "@/components/subscriptions/create-subscription-dialog";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listMemberOptions, listSubscriptions } from "@/lib/services/subscription-service";
import {
  subscriptionStatusLabels,
  subscriptionStatuses,
  type SubscriptionStatus,
} from "@/lib/validations/subscription";

type SubscriptionsScreenProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseStatus(value: string): SubscriptionStatus | null {
  return subscriptionStatuses.find((status) => status === value) ?? null;
}

function listHref(page: number, query: string, status: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status) {
    params.set("status", status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/dashboard/subscriptions?${search}` : "/dashboard/subscriptions";
}

export async function SubscriptionsScreen({ searchParams }: SubscriptionsScreenProps) {
  const params = await searchParams;
  const query = firstValue(params.q).trim();
  const statusValue = firstValue(params.status);
  const status = parseStatus(statusValue);
  const page = Number(firstValue(params.page)) || 1;
  let unavailable = false;
  let result: Awaited<ReturnType<typeof listSubscriptions>> | null = null;
  let members: Awaited<ReturnType<typeof listMemberOptions>> = [];

  try {
    [result, members] = await Promise.all([
      listSubscriptions({ query, status, page }),
      listMemberOptions(),
    ]);
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Souscriptions"
        description="Durées, échéances et historique. Une nouvelle période conserve les précédentes."
        actions={<CreateSubscriptionDialog members={members} />}
      />
      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Rechercher un membre"
          aria-label="Rechercher un membre"
          className="h-8 sm:max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Statut"
          className={selectClassName}
        >
          <option value="">Tous les statuts</option>
          {subscriptionStatuses.map((item) => (
            <option key={item} value={item}>
              {subscriptionStatusLabels[item]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
        {query || status ? (
          <Link href="/dashboard/subscriptions" className="text-sm text-muted-foreground hover:text-foreground">
            Réinitialiser
          </Link>
        ) : null}
      </form>
      {unavailable || !result ? (
        <ErrorState
          title="Une erreur est survenue."
          description="La liste des souscriptions est indisponible."
        />
      ) : result.items.length === 0 ? (
        <EmptyState
          title={result.hasAny ? "Aucune souscription ne correspond." : "Aucune souscription."}
          description={
            result.hasAny
              ? "Modifiez la recherche ou le statut."
              : "Enregistrez une période depuis cette page, ou à l'inscription d'un membre."
          }
        />
      ) : (
        <>
          <SubscriptionTable subscriptions={result.items} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {result.total === 1 ? "1 souscription" : `${result.total} souscriptions`}
            </p>
            {result.pageCount > 1 ? (
              <div className="flex items-center gap-3">
                {result.page > 1 ? (
                  <Link href={listHref(result.page - 1, query, status ?? "")}>Précédent</Link>
                ) : (
                  <span>Précédent</span>
                )}
                <span>
                  Page {result.page} sur {result.pageCount}
                </span>
                {result.page < result.pageCount ? (
                  <Link href={listHref(result.page + 1, query, status ?? "")}>Suivant</Link>
                ) : (
                  <span>Suivant</span>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
