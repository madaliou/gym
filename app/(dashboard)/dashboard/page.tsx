import Link from "next/link";
import { ExpirationReminders } from "@/components/dashboard/expiration-reminders";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_TIMEZONE } from "@/lib/config";
import { countDashboardFigures, listExpirationReminders } from "@/lib/services/reminder-service";
import { cn } from "@/lib/utils";

const shortcuts = [
  {
    href: "/dashboard/members",
    title: "Membres",
    description: "Consulter et gérer les fiches.",
  },
  {
    href: "/dashboard/check-ins",
    title: "Présences",
    description: "Enregistrer une entrée.",
  },
  {
    href: "/dashboard/payments",
    title: "Paiements",
    description: "Suivre les encaissements.",
  },
  {
    href: "/dashboard/subscriptions/expiring",
    title: "Expirations",
    description: "Voir les abonnements à relancer.",
  },
];

export default async function DashboardPage() {
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: DEFAULT_TIMEZONE,
  }).format(new Date());

  const formattedToday = today.charAt(0).toUpperCase() + today.slice(1);
  const numberFormat = new Intl.NumberFormat("fr-FR");
  let unavailable = false;
  let memberCount = "—";
  let activeSubscriptionCount = "—";
  let reminderGroups: Awaited<ReturnType<typeof listExpirationReminders>> = [];

  try {
    const [figures, groups] = await Promise.all([countDashboardFigures(), listExpirationReminders()]);
    memberCount = numberFormat.format(figures.memberCount);
    activeSubscriptionCount = numberFormat.format(figures.activeSubscriptionCount);
    reminderGroups = groups;
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description={formattedToday}
        actions={
          <Link
            href="/dashboard/members/new"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}
          >
            Ajouter un membre
          </Link>
        }
      />

      <section aria-label="Indicateurs">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Membres" value={memberCount} hint="Hors fiches archivées" />
          <StatCard label="Abonnements actifs" value={activeSubscriptionCount} hint="En cours" />
          <StatCard label="Présences du jour" value="—" hint="Pointages" />
          <StatCard label="Recettes du jour" value="—" hint="Encaissements" />
        </div>
      </section>

      <ExpirationReminders groups={reminderGroups} unavailable={unavailable} />

      <section aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="text-lg font-medium">
          Accès rapides
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="rounded-2xl bg-card px-5 py-4 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <p className="font-medium">{shortcut.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {shortcut.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
