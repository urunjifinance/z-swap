import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// A user may read/send in a chat only if they own one of the two swap
// requests behind the Match that chat belongs to.
async function assertParticipant(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { match: { include: { requestA: true, requestB: true } } },
  });
  if (!chat) return null;
  const isParticipant = chat.match.requestA.userId === userId || chat.match.requestB.userId === userId;
  return isParticipant ? chat : null;
}

// GET /api/chat/[chatId]/messages — polled by the chat UI to pick up new
// messages from the other party (no websocket/Pusher wiring yet).
export async function GET(_req: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await assertParticipant(params.chatId, (session.user as any).id);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { chatId: params.chatId },
    include: { sender: { select: { id: true, fullName: true, photoUrl: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

const sendSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  fileUrl: z.string().url().optional(),
});

// POST /api/chat/[chatId]/messages — sends a real message, persisted for
// both participants (replaces the old client-only setTimeout fake reply).
export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const chat = await assertParticipant(params.chatId, userId);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  try {
    const data = sendSchema.parse(await req.json());
    const message = await prisma.message.create({
      data: {
        chatId: params.chatId,
        senderId: userId,
        content: data.content,
        fileUrl: data.fileUrl,
      },
      include: { sender: { select: { id: true, fullName: true, photoUrl: true } } },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
