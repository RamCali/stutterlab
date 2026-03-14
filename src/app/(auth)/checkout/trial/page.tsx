"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Badge } from "@/components/ui/badge";
import { BillingToggle } from "@/components/billing-toggle";
import { Check, Loader2, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BillingInterval } from "@/lib/stripe";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const benefits = [
  "90-day SLP-designed curriculum",
  "Unlimited AI conversation practice",
  "Audio Lab with DAF, FAF & Metronome",
  "Feared Words Trainer",
  "Clinical progress reports & analytics",
];

export default function CheckoutTrialPage() {
  const { status } = useSession();
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>("month");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
  }, [status, router]);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      throw new Error(data.error || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  }, [interval]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center mb-6">
          <Image
            src="/logo/StutterLab_Logo.svg"
            alt="StutterLab"
            width={320}
            height={80}
            className="h-14 w-auto dark:hidden"
          />
          <Image
            src="/logo/StutterLab_Logo_white.svg"
            alt="StutterLab"
            width={320}
            height={80}
            className="h-14 w-auto hidden dark:block"
          />
        </Link>
        <h1 className="text-2xl font-bold">Start Your 7-Day Free Trial</h1>
        <p className="text-muted-foreground mt-2">
          Full access to everything. Cancel anytime.
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-2 mb-6">
        {benefits.map((b) => (
          <div key={b} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* Billing toggle */}
      <div className="mb-4">
        <BillingToggle interval={interval} onIntervalChange={setInterval} />
      </div>

      <Badge variant="secondary" className="w-full justify-center py-1.5 mb-6">
        7 days free, then {interval === "month" ? "$99/month" : "$999/year"}
      </Badge>

      {/* Stripe Embedded Checkout */}
      <div className="rounded-lg overflow-hidden border border-border">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          key={interval}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      {/* Assurance */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your card won&apos;t be charged for 7 days</span>
      </div>
    </div>
  );
}
