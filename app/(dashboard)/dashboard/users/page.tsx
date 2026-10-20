import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function UsersPage() {
  return (
    <WorkspacePage
      title="Utilisateurs"
      description="Comptes de l'équipe, rôles et derniers accès."
      emptyTitle="Aucun utilisateur."
      emptyDescription="Les comptes administratifs apparaîtront dans cette liste."
    />
  );
}
