import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
