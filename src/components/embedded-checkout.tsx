"use client";

import { useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import type { BillingInterval } from "@/lib/stripe";
import { trackProductEvent } from "@/lib/analytics/client";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface EmbeddedCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interval: BillingInterval;
}

export function EmbeddedCheckoutDialog({
  open,
  onOpenChange,
  interval,
}: EmbeddedCheckoutDialogProps) {
  useEffect(() => {
    if (open) {
      trackProductEvent("checkout_started", { interval, surface: "dialog" });
    }
  }, [open, interval]);

  const fetchClientSecret = useCallback(async () => {
    trackProductEvent("checkout_session_requested", { interval, surface: "dialog" });
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      trackProductEvent("checkout_session_failed", { interval, surface: "dialog" });
      throw new Error(data.error || "Failed to create checkout session");
    }
    trackProductEvent("checkout_session_created", { interval, surface: "dialog" });
    return data.clientSecret as string;
  }, [interval]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden [&>button]:z-10">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        <div className="border-b border-border bg-muted/20 px-4 py-3">
          <div className="flex items-start gap-2 text-sm">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
            <p className="text-muted-foreground">
              Secure checkout is processed by Stripe for StutterLab only. We do
              not use third-party billing sites.
            </p>
          </div>
        </div>
        <div className="max-h-[85vh] overflow-y-auto">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
