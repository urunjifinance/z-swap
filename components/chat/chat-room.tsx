"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  ShieldAlert,
  Flag,
  Ban,
  CheckCheck,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initials } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 4000;

// Real chat, backed by /api/chat/[chatId]/messages. Messages are persisted
// server-side; this component seeds from the server-rendered history and
// polls for anything the other party sent since (no websocket wiring yet,
// tracked as a follow-up — polling keeps this correct in the meantime).
export function ChatRoom({
  chatId,
  currentUserId,
  otherUser,
  initialMessages,
}: {
  chatId: string;
  currentUserId: string;
  otherUser: { id: string; name: string; photo?: string | null; verified: boolean };
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const knownIds = useRef(new Set(initialMessages.map((m) => m.id)));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}/messages`, { cache: "no-store" });
        if (!res.ok) return;
        const data: Array<{ id: string; senderId: string; sender: { fullName: string }; content: string; fileUrl?: string | null; createdAt: string }> = await res.json();
        const fresh = data.filter((m) => !knownIds.current.has(m.id));
        if (fresh.length === 0) return;
        fresh.forEach((m) => knownIds.current.add(m.id));
        setMessages((prev) => [
          ...prev,
          ...fresh.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender.fullName,
            content: m.content,
            fileUrl: m.fileUrl,
            createdAt: m.createdAt,
          })),
        ]);
      } catch {
        // Silent — next poll tries again.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [chatId]);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        setInput(content); // give it back so nothing is lost
        return;
      }
      const m = await res.json();
      knownIds.current.add(m.id);
      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.fullName,
          content: m.content,
          fileUrl: m.fileUrl,
          createdAt: m.createdAt,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between border-b border-border bg-white px-4 lg:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar>
            {otherUser.photo && <AvatarImage src={otherUser.photo} />}
            <AvatarFallback>{initials(otherUser.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-ink flex items-center gap-1.5">
              {otherUser.name}
              {otherUser.verified && <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>}
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chat options</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                <Flag className="h-4 w-4" /> Report this user
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold text-destructive hover:bg-red-50">
                <Ban className="h-4 w-4" /> Block this user
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 px-4 lg:px-6 py-2 flex items-center gap-2">
        <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">
          Safety tip: never send money outside the platform&apos;s request fee. Incentive
          arrangements are private and must comply with regulations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No messages yet. Say hello to {otherUser.name.split(" ")[0]}.
          </p>
        )}
        {messages.map((m) => {
          const fromMe = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  fromMe ? "bg-z-gradient text-white rounded-br-sm" : "bg-muted text-ink rounded-bl-sm"
                }`}
              >
                <p>{m.content}</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${fromMe ? "text-white/70 justify-end" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}
                  {fromMe && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-white p-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button size="icon" onClick={send} disabled={sending}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
