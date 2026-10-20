import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function PaymentsPage() {
  return (
    <WorkspacePage
      title="Paiements"
      description="Encaissements, soldes et historique."
      emptyTitle="Aucun paiement enregistré."
      emptyDescription="Les règlements saisis seront listés ici."
    />
  );
}
