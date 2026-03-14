"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingToggle } from "@/components/billing-toggle";
import type { BillingInterval } from "@/lib/stripe";

const features = [
  "Full Audio Lab (DAF + FAF + Choral + Metronome)",
  "90-day SLP-designed curriculum",
  "Unlimited AI conversations & phone simulator",
  "Feared Words Trainer",
  "CBT & Mindfulness module",
  "Real-world challenges with XP & streaks",
  "Voice Journal with AI fluency scoring",
  "Clinical progress reports",
];

export function PricingCard() {
  const [interval, setInterval] = useState<BillingInterval>("year");

  return (
    <div className="max-w-md mx-auto space-y-6">
      <BillingToggle interval={interval} onIntervalChange={setInterval} />

      <Card className="border-primary border-2 shadow-lg relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            7-Day Free Trial
          </Badge>
        </div>
        <CardContent className="pt-8 pb-6">
          <h3 className="font-semibold text-xl">StutterLab</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-5xl font-bold">
              {interval === "month" ? "$99" : "$999"}
            </span>
            <span className="text-muted-foreground text-base">
              /{interval === "month" ? "month" : "year"}
            </span>
          </div>
          {interval === "year" && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              $83/mo — save $189 vs monthly
            </p>
          )}
          <p className="text-base text-muted-foreground mt-2">
            Full access to everything. 7 days free.
          </p>
          <Button className="w-full mt-6" size="lg" asChild>
            <Link href="/signup">Start 7-Day Free Trial</Link>
          </Button>
          <ul className="mt-6 space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-base">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
