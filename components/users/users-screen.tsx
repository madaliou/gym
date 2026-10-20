import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_TIMEZONE } from "@/lib/config";
import { listUsers } from "@/lib/services/user-service";
import { userRoleLabels } from "@/lib/validations/user";

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Jamais";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DEFAULT_TIMEZONE,
  }).format(value);
}

export async function UsersScreen() {
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let unavailable = false;

  try {
    users = await listUsers();
  } catch {
    unavailable = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Utilisateurs"
        description="Comptes de l'équipe, rôles et derniers accès."
        actions={<CreateUserDialog />}
      />
      {unavailable ? (
        <ErrorState
          title="Une erreur est survenue."
          description="La liste des gestionnaires est indisponible."
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur."
          description="Ajoutez le premier gestionnaire avec le bouton en haut de la page."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <caption className="sr-only">Liste des gestionnaires</caption>
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nom
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  E-mail
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Rôle
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Dernière connexion
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Créé le
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/70 last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {user.firstName} {user.lastName}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">{userRoleLabels[user.role]}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Actif" : "Désactivé"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(user.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <EditUserDialog user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
