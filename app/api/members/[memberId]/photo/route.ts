import { NextResponse } from "next/server";
import { AuthRequiredError, requireActor } from "@/lib/auth/session";
import { getPrismaClient } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireActor();
  } catch (error) {
    const status = error instanceof AuthRequiredError ? 401 : 403;
    return new NextResponse("Accès refusé.", { status });
  }

  const { memberId } = await context.params;
  const prisma = getPrismaClient();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { photoData: true, photoMime: true },
  });

  if (!member?.photoData || !member.photoMime) {
    return new NextResponse("Photo introuvable.", { status: 404 });
  }

  return new NextResponse(new Uint8Array(member.photoData), {
    headers: {
      "Content-Type": member.photoMime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
