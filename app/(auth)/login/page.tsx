import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { countUsers } from "@/lib/services/user-service";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const userCount = await countUsers();

  return <LoginForm canSetup={userCount === 0} />;
}
