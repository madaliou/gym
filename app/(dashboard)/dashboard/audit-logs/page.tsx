import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function AuditLogsPage() {
  return (
    <WorkspacePage
      title="Journal d'activité"
      description="Historique des actions importantes."
      emptyTitle="Aucune activité enregistrée."
      emptyDescription="Les connexions et les modifications seront tracées ici."
    />
  );
}
