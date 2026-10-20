import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";

type WorkspacePageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function WorkspacePage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: WorkspacePageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title={title} description={description} />
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </div>
  );
}
