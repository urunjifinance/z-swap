"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Send,
  Paperclip,
  ShieldAlert,
  Flag,
  Ban,
  CheckCheck,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
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
import { SAMPLE_USERS } from "@/lib/data/sample-users";
import { initials } from "@/lib/utils";

interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  read?: boolean;
}

const SEED_MESSAGES: ChatMessage[] = [
  { id: "1", fromMe: false, text: "Hi! I saw your profile — you're at Kabulonga Boys and want to move to Western Province?", time: "09:12", read: true },
  { id: "2", fromMe: true, text: "Yes, that's right. I saw you're at Mongu Girls and interested in Lusaka. Sounds like a great match!", time: "09:14", read: true },
  { id: "3", fromMe: false, text: "Exactly. I've attached my employment letter and payslip for your review.", time: "09:16", read: true },
  { id: "4", fromMe: false, text: "Regarding the incentive — I was thinking around ZMW 4,000 given the distance. Open to discussing.", time: "09:17", read: true },
];

export default function ChatPage() {
  const params = useParams();
  const matchId = String(params.id);
  const match = SAMPLE_USERS.find((u) => u.id === matchId) ?? SAMPLE_USERS[1];

  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      fromMe: true,
      text: input,
      time: new Date().toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, msg]);
    setInput("");

    // Simulate the other party typing + replying (demo only — production
    // wires this to Socket.io / Pusher channels keyed by chat id).
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          fromMe: false,
          text: "Sounds good, let's confirm once we've both paid the request fee.",
          time: new Date().toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 2200);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-border bg-white px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={match.photo} />
              <AvatarFallback>{initials(match.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                {match.name}
                {match.verified && <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>}
              </p>
              <p className="text-xs text-slate-500">{typing ? "typing..." : "Online"}</p>
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
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.fromMe ? "bg-z-gradient text-white rounded-br-sm" : "bg-muted text-ink rounded-bl-sm"
                }`}
              >
                <p>{m.text}</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${m.fromMe ? "text-white/70 justify-end" : "text-slate-400"}`}>
                  {m.time}
                  {m.fromMe && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              </div>
            </div>
          )}
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
            <Button size="icon" onClick={send}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
