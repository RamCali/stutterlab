"use client";

import { useState, useTransition } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinEarlyAccess } from "@/lib/actions/early-access";

export function EarlyAccessSignup({ size = "large" }: { size?: "large" | "compact" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await joinEarlyAccess(email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  }

  if (submitted) {
    return (
      <div className={`flex items-center justify-center gap-3 ${size === "large" ? "py-4" : "py-2"}`}>
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-lg">You&apos;re on the list!</p>
          <p className="text-sm text-muted-foreground">We&apos;ll email you when early access opens.</p>
        </div>
      </div>
    );
  }

  if (size === "large") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 pl-11 text-lg bg-card border-border/60 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-14 px-8 text-lg font-semibold shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Get Early Access
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Free to join. No credit card required.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-12 bg-card border-border/60"
      />
      <Button type="submit" disabled={isPending} className="h-12 px-6 shrink-0">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Waitlist"}
      </Button>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </form>
  );
}
