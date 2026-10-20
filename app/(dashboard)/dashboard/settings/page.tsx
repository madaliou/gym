import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function SettingsPage() {
  return (
    <WorkspacePage
      title="Paramètres"
      description="Identité du club, notifications, apparence et sécurité."
      emptyTitle="Paramètres non enregistrés."
      emptyDescription="Le nom du club, la devise et le fuseau horaire se configureront ici."
    />
  );
}