import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ChatRoom } from "@/components/chat/chat-room";
import { computeMatchScore } from "@/lib/matching-engine";
import { dbUserToSampleUser } from "@/lib/user-mapper";

// Server component: no more SAMPLE_USERS fallback. `id` in the URL is the
// other worker's real user id. We locate (or create) the real Match + Chat
// between the two users' active swap requests and load real persisted
// messages — the old page kept its whole conversation in useState with a
// setTimeout-simulated reply, so nothing sent ever reached the other user.
export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const myId = (session.user as any).id as string;

  if (params.id === myId) notFound();

  const [me, otherUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: myId } }),
    prisma.user.findUnique({ where: { id: params.id } }),
  ]);
  if (!me || !otherUser) notFound();

  const [myRequest, theirRequest] = await Promise.all([
    prisma.swapRequest.findFirst({
      where: { userId: me.id, status: { in: ["PENDING", "MATCHED"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.swapRequest.findFirst({
      where: { userId: otherUser.id, status: { in: ["PENDING", "MATCHED"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!myRequest || !theirRequest) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-sm text-slate-500 max-w-sm">
            You can only chat once both you and {otherUser.fullName.split(" ")[0]} have an active swap
            request posted. {!myRequest ? "Post your swap request to continue." : "They haven't posted one yet."}
          </p>
        </div>
      </div>
    );
  }

  let match = await prisma.match.findFirst({
    where: {
      OR: [
        { requestAId: myRequest.id, requestBId: theirRequest.id },
        { requestAId: theirRequest.id, requestBId: myRequest.id },
      ],
    },
    include: { chat: true },
  });

  if (!match) {
    const score = computeMatchScore(dbUserToSampleUser(me), dbUserToSampleUser(otherUser));
    match = await prisma.match.create({
      data: { requestAId: myRequest.id, requestBId: theirRequest.id, matchScore: score },
      include: { chat: true },
    });
  }

  const chat = match.chat ?? (await prisma.chat.create({ data: { matchId: match.id } }));

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    include: { sender: { select: { id: true, fullName: true, photoUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <ChatRoom
        chatId={chat.id}
        currentUserId={myId}
        otherUser={{
          id: otherUser.id,
          name: otherUser.fullName,
          photo: otherUser.photoUrl,
          verified: otherUser.verificationStatus === "VERIFIED",
        }}
        initialMessages={messages.map((m: (typeof messages)[number]) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.fullName,
          content: m.content,
          fileUrl: m.fileUrl,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
