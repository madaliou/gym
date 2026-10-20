import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function MembershipPlansPage() {
  return (
    <WorkspacePage
      title="Plans"
      description="Formules d'abonnement proposées par le club."
      emptyTitle="Aucun plan configuré."
      emptyDescription="Les formules actives seront listées ici."
    />
  );
}
