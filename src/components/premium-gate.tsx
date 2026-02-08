"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Loader2, Clock } from "lucide-react";

interface PremiumGateProps {
  isPremium: boolean;
  featureName: string;
  description: string;
  trialDaysLeft?: number;
  children: React.ReactNode;
}

export function PremiumGate({
  isPremium,
  featureName,
  description,
  trialDaysLeft,
  children,
}: PremiumGateProps) {
  const [loading, setLoading] = useState(false);

  if (isPremium) {
    return (
      <div className="relative">
        {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
          <div className="mb-3 flex justify-end">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
            </Badge>
          </div>
        )}
        {children}
      </div>
    );
  }

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  const isExpiredTrial = trialDaysLeft === 0;

  return (
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
          <p className="text-sm text-muted-foreground mt-1">
            {isExpiredTrial
              ? "Your free trial has ended. Upgrade to keep using all features."
              : description}
          </p>
        </div>
        <Button onClick={handleUpgrade} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Crown className="h-4 w-4 mr-2" />
          )}
          {isExpiredTrial ? "Upgrade to Pro — $199/year" : "Start 7-Day Free Trial"}
        </Button>
        {!isExpiredTrial && (
          <p className="text-xs text-muted-foreground">
            Full access for 7 days, then $199/year. Cancel anytime.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
