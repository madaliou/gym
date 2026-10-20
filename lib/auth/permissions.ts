import type { UserRole } from "@/lib/validations/user";

const staffRoles: UserRole[] = ["ADMIN", "MANAGER", "RECEPTIONIST", "COACH"];
const operationsRoles: UserRole[] = ["ADMIN", "MANAGER", "RECEPTIONIST"];

export const routeAccess: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/dashboard/users", roles: ["ADMIN"] },
  { prefix: "/dashboard/audit-logs", roles: ["ADMIN"] },
  { prefix: "/dashboard/settings", roles: ["ADMIN"] },
  { prefix: "/dashboard/payments", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/dashboard/revenue", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/dashboard/membership-plans", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/dashboard/messages", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/dashboard/notifications", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/dashboard/birthdays", roles: ["ADMIN", "MANAGER", "COACH"] },
  { prefix: "/dashboard/subscriptions", roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
  { prefix: "/dashboard/members", roles: staffRoles },
  { prefix: "/dashboard/check-ins", roles: staffRoles },
  { prefix: "/dashboard", roles: staffRoles },
];

export function canAccessPath(role: UserRole, pathname: string) {
  const match = routeAccess.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (!match) {
    return true;
  }

  return match.roles.includes(role);
}

export function canMutateMembers(role: UserRole) {
  return operationsRoles.includes(role);
}

export function canMutateSubscriptions(role: UserRole) {
  return operationsRoles.includes(role);
}

export function canManageUsers(role: UserRole) {
  return role === "ADMIN";
}

export function canViewAuditLogs(role: UserRole) {
  return role === "ADMIN";
}

export function navigationRolesForHref(href: string): UserRole[] {
  const match = routeAccess.find((entry) => href === entry.prefix || href.startsWith(`${entry.prefix}/`));
  return match?.roles ?? staffRoles;
}
