import {
  Bell,
  Cake,
  ChartColumn,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  ScanLine,
  Repeat,
  ScrollText,
  Settings,
  Timer,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Membres",
    items: [
      { title: "Membres", href: "/dashboard/members", icon: Users },
      {
        title: "Ajouter un membre",
        href: "/dashboard/members/new",
        icon: UserPlus,
      },
      { title: "Présences", href: "/dashboard/check-ins", icon: ScanLine },
    ],
  },
  {
    label: "Abonnements",
    items: [
      { title: "Plans", href: "/dashboard/membership-plans", icon: CreditCard },
      {
        title: "Souscriptions",
        href: "/dashboard/subscriptions",
        icon: Repeat,
      },
      {
        title: "Abonnements expirants",
        href: "/dashboard/subscriptions/expiring",
        icon: Timer,
      },
    ],
  },
  {
    label: "Finances",
    items: [
      { title: "Paiements", href: "/dashboard/payments", icon: Wallet },
      { title: "Revenus", href: "/dashboard/revenue", icon: ChartColumn },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Anniversaires", href: "/dashboard/birthdays", icon: Cake },
      { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Utilisateurs", href: "/dashboard/users", icon: UserCog },
      {
        title: "Journal d'activité",
        href: "/dashboard/audit-logs",
        icon: ScrollText,
      },
      { title: "Paramètres", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  if (href === "/dashboard/members") {
    return (
      pathname === href ||
      (pathname.startsWith(`${href}/`) && pathname !== "/dashboard/members/new")
    );
  }

  if (href === "/dashboard/subscriptions") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
