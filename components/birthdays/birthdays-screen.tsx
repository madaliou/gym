import { BirthdayList } from "@/components/birthdays/birthday-list";
import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatClubDate, todayUtcDate } from "@/lib/subscriptions/dates";
import { listBirthdayGroups } from "@/lib/services/birthday-service";
import { birthdayWindow } from "@/lib/birthdays/calendar";

type BirthdayGroupView = {
  id: "day" | "week" | "month";
  title: string;
  hint: string;
  empty: string;
  items: Awaited<ReturnType<typeof listBirthdayGroups>>["day"];
  showDate: boolean;
};

export async function BirthdaysScreen() {
  const today = todayUtcDate();
  const week = birthdayWindow("week", today);
  const month = birthdayWindow("month", today);
  let unavailable = false;
  let groups: Awaited<ReturnType<typeof listBirthdayGroups>> = {
    day: [],
    week: [],
    month: [],
  };

  try {
    groups = await listBirthdayGroups(today);
  } catch {
    unavailable = true;
  }

  const sections: BirthdayGroupView[] = [
    {
      id: "day",
      title: "Aujourd'hui",
      hint: formatClubDate(today),
      empty: "Aucun adhérent ne fête son anniversaire aujourd'hui.",
      items: groups.day,
      showDate: false,
    },
    {
      id: "week",
      title: "Cette semaine",
      hint: `${formatClubDate(week.start)} – ${formatClubDate(week.end)}`,
      empty: "Aucun anniversaire cette semaine.",
      items: groups.week,
      showDate: true,
    },
    {
      id: "month",
      title: "Ce mois",
      hint: `${formatClubDate(month.start)} – ${formatClubDate(month.end)}`,
      empty: "Aucun anniversaire ce mois-ci.",
      items: groups.month,
      showDate: true,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Anniversaires"
        description="Listes du jour, de la semaine et du mois, avec message, WhatsApp et e-mail."
      />
      {unavailable ? (
        <ErrorState
          title="Une erreur est survenue."
          description="Les anniversaires n'ont pas pu être chargés."
        />
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`birthdays-${section.id}-title`}
              className="rounded-2xl bg-card px-5 py-5 ring-1 ring-foreground/10"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 id={`birthdays-${section.id}-title`} className="text-lg font-medium">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {section.hint}
                  {" · "}
                  {section.items.length} membre{section.items.length === 1 ? "" : "s"}
                </p>
              </div>
              {section.items.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{section.empty}</p>
              ) : (
                <BirthdayList items={section.items} showDate={section.showDate} />
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
