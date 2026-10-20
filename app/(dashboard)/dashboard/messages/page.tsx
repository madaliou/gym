import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function MessagesPage() {
  return (
    <WorkspacePage
      title="Messages"
      description="Modèles pour les anniversaires, les expirations et les paiements."
      emptyTitle="Aucun modèle de message."
      emptyDescription="Les textes réutilisables seront gérés depuis cet écran."
    />
  );
}
