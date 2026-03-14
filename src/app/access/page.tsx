"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccessPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid passcode. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/StutterLab_Logo.svg"
            alt="StutterLab"
            width={240}
            height={48}
            className="h-12 w-auto dark:hidden"
          />
          <Image
            src="/logo/StutterLab_Logo_white.svg"
            alt="StutterLab"
            width={240}
            height={48}
            className="h-12 w-auto hidden dark:block"
          />
        </div>

        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mx-auto mb-6">
          <Lock className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Early Access</h1>
        <p className="text-muted-foreground mb-8">
          Enter your passcode to access StutterLab.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            autoFocus
            className="h-12 text-center text-lg tracking-widest bg-card border-border/60"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Enter
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-8">
          Don&apos;t have a passcode?{" "}
          <a href="/" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Join the waitlist
          </a>
        </p>
      </div>
    </div>
  );
}
