import { UsersScreen } from "@/components/users/users-screen";
import { requirePathAccess } from "@/lib/auth/session";

export default async function UsersPage() {
  await requirePathAccess("/dashboard/users");
  return <UsersScreen />;
}
