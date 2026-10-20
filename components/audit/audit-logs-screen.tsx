import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { DEFAULT_TIMEZONE } from "@/lib/config";
import {
  auditActionLabels,
  auditEntityLabels,
  listAuditLogs,
  type AuditAction,
} from "@/lib/services/audit-service";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DEFAULT_TIMEZONE,
  }).format(value);
}

function actionLabel(action: string) {
  return auditActionLabels[action as AuditAction] ?? action;
}

function entityLabel(entity: string) {
  return auditEntityLabels[entity] ?? entity;
}

export async function AuditLogsScreen() {
  let logs: Awaited<ReturnType<typeof listAuditLogs>> = [];
  let unavailable = false;

  try {
    logs = await listAuditLogs();
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Journal d'activité"
        description="Historique horodaté des actions, avec l'auteur de chaque opération."
      />
      {unavailable ? (
        <ErrorState
          title="Une erreur est survenue."
          description="Le journal d'activité est indisponible."
        />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Aucune activité enregistrée."
          description="Les connexions et les modifications seront tracées ici."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <caption className="sr-only">Journal d&apos;activité</caption>
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Auteur
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Action
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Cible
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Adresse IP
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <th scope="row" className="px-4 py-3 font-medium">
                    {log.user ? (
                      <span>
                        {log.user.firstName} {log.user.lastName}
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {log.user.email}
                        </span>
                      </span>
                    ) : (
                      "Compte retiré"
                    )}
                  </th>
                  <td className="px-4 py-3">{actionLabel(log.action)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entityLabel(log.entity)}
                    {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
