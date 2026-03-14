"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Mail, ArrowRight, Check, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinEarlyAccess } from "@/lib/actions/early-access";

const DISMISS_KEY = "klaviyo-popup-dismissed";
const POPUP_DELAY_MS = 8000; // Show after 8 seconds

export function KlaviyoPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Don't show if already dismissed or submitted
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await joinEarlyAccess(email, "popup");
      if (result.success) {
        setSubmitted(true);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setTimeout(() => setVisible(false), 3000);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-300">
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {submitted ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">You&apos;re on the list!</h3>
                <p className="text-muted-foreground mt-2">
                  We&apos;ll email you when early access opens.
                </p>
              </div>
            ) : (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                    <Mic className="h-7 w-7 text-primary" />
                  </div>
                </div>

                {/* Copy */}
                <h3 className="text-2xl font-bold text-center">
                  Train your speech.
                  <br />
                  <span className="text-primary">10 minutes a day.</span>
                </h3>
                <p className="text-muted-foreground text-center mt-3">
                  Join the waitlist for StutterLab — AI-powered speech training
                  designed by an SLP for people who stutter.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="h-12 pl-11 bg-background border-border/60 focus-visible:ring-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Get Early Access
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free to join. No credit card required. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
