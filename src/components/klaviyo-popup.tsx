"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { X, Mail, ArrowRight, Check, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinEarlyAccess } from "@/lib/actions/early-access";

const DISMISS_KEY = "klaviyo-popup-dismissed";
const MOBILE_DELAY_MS = 15000; // Mobile fallback: show after 15s
const MIN_TIME_ON_PAGE_MS = 5000; // Don't trigger exit intent in first 5s

export function KlaviyoPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const show = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const pageLoadTime = Date.now();
    let triggered = false;

    // Exit intent: mouse leaves viewport at the top (desktop only)
    function handleMouseLeave(e: MouseEvent) {
      if (triggered) return;
      if (e.clientY > 0) return; // Only trigger when cursor goes above viewport
      if (Date.now() - pageLoadTime < MIN_TIME_ON_PAGE_MS) return;
      triggered = true;
      show();
    }

    // Mobile fallback: show after delay since there's no mouse exit intent
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    let mobileTimer: ReturnType<typeof setTimeout> | undefined;

    if (isMobile) {
      mobileTimer = setTimeout(() => {
        if (!triggered) {
          triggered = true;
          show();
        }
      }, MOBILE_DELAY_MS);
    } else {
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, [show]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await joinEarlyAccess(email, "exit-intent-popup");
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
                  Wait — before you go.
                </h3>
                <p className="text-lg text-primary font-semibold text-center mt-1">
                  Get free speech training tips in your inbox.
                </p>
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
