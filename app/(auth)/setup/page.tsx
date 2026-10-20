import { redirect } from "next/navigation";
import { SetupForm } from "@/components/auth/setup-form";
import { auth } from "@/lib/auth";
import { countUsers } from "@/lib/services/user-service";

export default async function SetupPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  if ((await countUsers()) > 0) {
    redirect("/login");
  }

  return <SetupForm />;
}
