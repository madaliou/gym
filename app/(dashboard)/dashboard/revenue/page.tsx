import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function RevenuePage() {
  return (
    <WorkspacePage
      title="Revenus"
      description="Recettes du jour, de la semaine, du mois et de l'année."
      emptyTitle="Aucun revenu à afficher."
      emptyDescription="Les graphiques suivront les paiements enregistrés."
    />
  );
}
