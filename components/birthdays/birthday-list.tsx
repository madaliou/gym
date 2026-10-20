import { BirthdayActions } from "@/components/birthdays/birthday-actions";
import { MemberPhoto } from "@/components/media/member-photo";
import type { BirthdayListItem } from "@/lib/services/birthday-service";

type BirthdayListProps = {
  items: BirthdayListItem[];
  showDate?: boolean;
};

export function BirthdayList({ items, showDate = true }: BirthdayListProps) {
  return (
    <ul className="divide-y divide-border/70">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <MemberPhoto
              src={item.photoUrl}
              name={`${item.firstName} ${item.lastName}`}
              size="md"
            />
            <div className="min-w-0">
              <p className="font-medium">
                {item.firstName} {item.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.age} an{item.age > 1 ? "s" : ""}
                {showDate ? ` · ${item.occurrenceLabel}` : null}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {item.phone ?? "Téléphone manquant"}
                {" · "}
                {item.email ?? "E-mail manquant"}
              </p>
            </div>
          </div>
          <BirthdayActions
            message={item.message}
            whatsAppHref={item.whatsAppHref}
            mailtoHref={item.mailtoHref}
          />
        </li>
      ))}
    </ul>
  );
}
