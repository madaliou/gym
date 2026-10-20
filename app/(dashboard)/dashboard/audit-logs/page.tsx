import { AuditLogsScreen } from "@/components/audit/audit-logs-screen";
import { requirePathAccess } from "@/lib/auth/session";

export default async function AuditLogsPage() {
  await requirePathAccess("/dashboard/audit-logs");
  return <AuditLogsScreen />;
}
