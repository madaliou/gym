import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPath } from "@/lib/auth/permissions";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  if (!session && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/setup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && pathname.startsWith("/dashboard") && !canAccessPath(session.user.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/setup"],
};
