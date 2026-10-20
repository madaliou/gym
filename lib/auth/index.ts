import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/password";
import { findActiveUserByEmail, markUserLoggedIn } from "@/lib/services/user-service";
import { writeAuditLog } from "@/lib/services/audit-service";
import { loginFormSchema } from "@/lib/validations/user";
import type { UserRole } from "@/lib/validations/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginFormSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await findActiveUserByEmail(parsed.data.email);
        if (!user || !user.isActive) {
          return null;
        }

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        await markUserLoggedIn(user.id);
        await writeAuditLog({
          userId: user.id,
          action: "LOGIN",
          entity: "Auth",
          entityId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      const role = token.role;
      session.user.id = String(token.id ?? "");
      session.user.email = typeof token.email === "string" ? token.email : "";
      session.user.firstName = String(token.firstName ?? "");
      session.user.lastName = String(token.lastName ?? "");
      session.user.role =
        role === "ADMIN" || role === "MANAGER" || role === "RECEPTIONIST" || role === "COACH"
          ? role
          : "MANAGER";

      return session;
    },
  },
});
