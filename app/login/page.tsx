"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeftRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect phone/email or password. Please try again.");
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-z-gradient-soft flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-extrabold text-lg mb-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          Z-<span className="text-gradient">Swap</span>
        </Link>

        <Card className="glass">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-ink mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 mb-6">Log in with your phone number or email.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Phone number or email</Label>
                <Input className="mt-1.5" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="0977123456 or you@example.com" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <a href="#" className="text-primary-600 font-semibold hover:underline">Forgot password?</a>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Log in"}
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" size="lg" type="button">
              <ShieldCheck className="h-4 w-4" /> Log in with OTP
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              New to Z-Swap?{" "}
              <Link href="/register" className="font-semibold text-primary-600 hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
