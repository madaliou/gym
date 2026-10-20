"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { userRoleLabels, type UserRole } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";

type AccountMenuProps = {
  firstName: string;
  lastName: string;
  role: UserRole;
};

export function AccountMenu({ firstName, lastName, role }: AccountMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium">
          {firstName} {lastName}
        </p>
        <p className="text-xs text-muted-foreground">{userRoleLabels[role]}</p>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="h-11">
          <LogOut aria-hidden="true" />
          Déconnexion
        </Button>
      </form>
    </div>
  );
}
