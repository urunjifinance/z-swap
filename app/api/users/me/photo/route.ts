import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlobUrl } from "@/lib/photo";

const schema = z.object({ photoUrl: z.string().url().refine(isBlobUrl, "Invalid photo URL") });

// PATCH /api/users/me/photo — lets a logged-in user add or change their profile photo.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { photoUrl } = schema.parse(await req.json());
    await prisma.user.update({ where: { id: userId }, data: { photoUrl } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not save photo" }, { status: 500 });
  }
}
