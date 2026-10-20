import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function CheckInsPage() {
  return (
    <WorkspacePage
      title="Présences"
      description="Pointage du jour et historique des visites."
      emptyTitle="Aucune présence aujourd'hui."
      emptyDescription="Les entrées enregistrées s'afficheront ici."
    />
  );
}
