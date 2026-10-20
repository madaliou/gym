import type { ExpirationReminderGroup } from "@/lib/services/reminder-service";

type ExpirationRemindersProps = {
  groups: ExpirationReminderGroup[];
  unavailable?: boolean;
};

export function ExpirationReminders({ groups, unavailable = false }: ExpirationRemindersProps) {
  const visibleGroups = groups.filter((group) => group.reminders.length > 0);
  const total = visibleGroups.reduce((count, group) => count + group.reminders.length, 0);

  return (
    <section aria-labelledby="reminders-title" className="rounded-2xl bg-card px-5 py-5 ring-1 ring-foreground/10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="reminders-title" className="text-lg font-medium">
          Rappels d&apos;échéance
        </h2>
        <p className="text-sm text-muted-foreground">
          {unavailable ? "Indisponibles" : total === 0 ? "Aucun rappel aujourd'hui" : `${total} à traiter`}
        </p>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Les messages se préparent pour WhatsApp. Rien n&apos;est envoyé tant que personne ne les ouvre.
      </p>
      {unavailable ? (
        <p className="mt-4 text-sm text-muted-foreground">Les rappels n&apos;ont pas pu être chargés.</p>
      ) : visibleGroups.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Personne n&apos;expire aujourd&apos;hui, demain, dans 3, 7 ou 30 jours.
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {visibleGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-medium">{group.label}</h3>
              <ul className="mt-2 divide-y divide-border/70">
                {group.reminders.map((reminder) => (
                  <li key={reminder.subscriptionId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{reminder.memberName}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.endDateLabel}
                        {reminder.phone ? ` · ${reminder.phone}` : " · téléphone manquant"}
                      </p>
                    </div>
                    {reminder.whatsAppHref ? (
                      <a
                        href={reminder.whatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                      >
                        Préparer sur WhatsApp
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
