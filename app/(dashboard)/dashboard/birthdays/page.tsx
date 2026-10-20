import { WorkspacePage } from "@/components/dashboard/workspace-page";

export default function BirthdaysPage() {
  return (
    <WorkspacePage
      title="Anniversaires"
      description="Adhérents qui fêtent leur anniversaire aujourd'hui."
      emptyTitle="Aucun anniversaire aujourd'hui."
      emptyDescription="Les membres concernés apparaîtront ici le jour venu."
    />
  );
}
