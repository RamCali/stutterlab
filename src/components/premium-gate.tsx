"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Clock } from "lucide-react";
import { EmbeddedCheckoutDialog } from "@/components/embedded-checkout";
import { BillingToggle } from "@/components/billing-toggle";
import type { PlanTier } from "@/lib/auth/premium";

interface PremiumGateProps {
  requiredPlan: PlanTier;
  currentPlan?: PlanTier;
  featureName: string;
  description: string;
  trialDaysLeft?: number;
  children: React.ReactNode;
}

export function PremiumGate({
  currentPlan = "free",
  featureName,
  description,
  trialDaysLeft,
  children,
}: PremiumGateProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [interval, setInterval] = useState<"month" | "year">("year");

  // All paid plans are equivalent now
  const hasAccess = currentPlan !== "free";

  if (hasAccess) {
    return (
      <div className="relative">
        {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
          <div className="mb-3 flex justify-end">
            <Badge variant="outline" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
            </Badge>
          </div>
        )}
        {children}
      </div>
    );
  }

  const isExpiredTrial = trialDaysLeft === 0;

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {featureName}
            </h3>
            <p className="text-base text-muted-foreground mt-1">
              {isExpiredTrial
                ? "Your trial has ended. Reactivate your subscription to keep using this feature."
                : description}
            </p>
          </div>

          {/* Billing interval toggle */}
          <BillingToggle interval={interval} onIntervalChange={setInterval} />

          <Button onClick={() => setCheckoutOpen(true)} className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            {isExpiredTrial
              ? `Reactivate — ${interval === "month" ? "$99/mo" : "$999/yr"}`
              : "Start 7-Day Free Trial"}
          </Button>
          {!isExpiredTrial && (
            <p className="text-sm text-muted-foreground">
              7 days free, then {interval === "month" ? "$99/month" : "$999/year"}. Cancel anytime.
            </p>
          )}
        </CardContent>
      </Card>

      <EmbeddedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        interval={interval}
      />
    </>
  );
}
