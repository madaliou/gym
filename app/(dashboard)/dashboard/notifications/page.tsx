import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function NotificationsPage() {
  return (
    <WorkspacePage
      title="Notifications"
      description="Alertes internes du club."
      emptyTitle="Aucune notification."
      emptyDescription="Les alertes non lues seront regroupées ici."
    />
  );
}
