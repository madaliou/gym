import Image from "next/image";
import { BirthdayActions } from "@/components/birthdays/birthday-actions";
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
            {item.photoUrl ? (
              <Image
                src={item.photoUrl}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="size-11 rounded-full object-cover ring-1 ring-foreground/10"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground"
              >
                {item.firstName.charAt(0)}
                {item.lastName.charAt(0)}
              </span>
            )}
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
