import { MemberPhoto } from "@/components/media/member-photo";
import { MemberRowActions } from "@/components/members/member-row-actions";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_TIMEZONE } from "@/lib/config";
import type { MemberListItem } from "@/lib/services/member-service";
import { formatClubDate, toIsoDate } from "@/lib/subscriptions/dates";
import { memberStatusLabels, subscriptionMonthsLabel } from "@/lib/validations/member";
import { subscriptionStatusLabels } from "@/lib/validations/subscription";

type MemberListProps = {
  members: MemberListItem[];
};

const statusVariant = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
  ARCHIVED: "outline",
} as const;

function formatJoinedAt(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: DEFAULT_TIMEZONE,
  }).format(value);
}

function subscriptionSummary(member: MemberListItem) {
  if (!member.currentSubscription) {
    return "—";
  }

  const period = `${subscriptionMonthsLabel(member.currentSubscription.durationMonths)} · ${formatClubDate(member.currentSubscription.endDate)}`;

  if (member.currentSubscription.status === "ACTIVE") {
    return period;
  }

  return `${subscriptionStatusLabels[member.currentSubscription.status]} · ${period}`;
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <caption className="sr-only">Liste des membres</caption>
        <thead className="border-b border-border text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Membre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Téléphone
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              E-mail
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Statut
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Souscription
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Adhésion
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-border/70 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium">
                <span className="flex items-center gap-3">
                  <MemberPhoto
                    src={member.photoUrl}
                    name={`${member.firstName} ${member.lastName}`}
                    size="sm"
                  />
                  {member.firstName} {member.lastName}
                </span>
              </th>
              <td className="px-4 py-3 text-muted-foreground">{member.phone ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.email ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[member.status]}>
                  {memberStatusLabels[member.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{subscriptionSummary(member)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatJoinedAt(member.joinedAt)}</td>
              <td className="px-4 py-3">
                <MemberRowActions
                  member={{
                    id: member.id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    phone: member.phone ?? "",
                    email: member.email ?? "",
                    gender: member.gender,
                    dateOfBirth: member.dateOfBirth ? toIsoDate(member.dateOfBirth) : "",
                    photoUrl: member.photoUrl,
                    address: member.address ?? "",
                    notes: member.notes ?? "",
                    joinedAt: toIsoDate(member.joinedAt),
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
