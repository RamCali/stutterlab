"use client";

import { useState, useTransition } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinEarlyAccess } from "@/lib/actions/early-access";

interface KlaviyoInlineSignupProps {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  source?: string;
  className?: string;
}

export function KlaviyoInlineSignup({
  heading = "Get speech training tips & early access",
  subtext = "Join our newsletter for stuttering techniques, app updates, and community stories. Unsubscribe anytime.",
  buttonText = "Subscribe",
  source = "inline-signup",
  className = "",
}: KlaviyoInlineSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await joinEarlyAccess(email, source);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  }

  if (submitted) {
    return (
      <div className={`rounded-xl border border-border/60 bg-card p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 shrink-0">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg">You&apos;re subscribed!</p>
            <p className="text-sm text-muted-foreground">
              Check your inbox for a welcome email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border/60 bg-card p-6 ${className}`}>
      {heading && (
        <h3 className="text-lg font-semibold">{heading}</h3>
      )}
      {subtext && (
        <p className="text-sm text-muted-foreground mt-1.5">{subtext}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mt-4"
      >
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 pl-10 bg-background border-border/60 focus-visible:ring-primary"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 px-6 shrink-0 font-semibold"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {buttonText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
