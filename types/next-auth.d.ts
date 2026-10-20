import type { UserRole } from "@/lib/validations/user";

declare module "next-auth" {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }
}
