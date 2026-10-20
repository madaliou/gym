import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateMemberDialog } from "@/components/members/create-member-dialog";
import { MemberList } from "@/components/members/member-list";
import { listMembers } from "@/lib/services/member-service";

type MembersScreenProps = {
  createOpen?: boolean;
};

export async function MembersScreen({ createOpen = false }: MembersScreenProps) {
  let members: Awaited<ReturnType<typeof listMembers>> = [];
  let unavailable = false;

  try {
    members = await listMembers();
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Membres"
        description="Fiches, statuts et historique des adhérents."
        actions={<CreateMemberDialog defaultOpen={createOpen} />}
      />
      {unavailable ? (
        <ErrorState
          title="Une erreur est survenue."
          description="La liste des membres est indisponible. Vous pouvez tout de même ouvrir la fiche de création."
        />
      ) : members.length === 0 ? (
        <EmptyState
          title="Aucun membre trouvé."
          description="Ajoutez le premier adhérent avec le bouton en haut de la page."
        />
      ) : (
        <MemberList members={members} />
      )}
    </div>
  );
}
