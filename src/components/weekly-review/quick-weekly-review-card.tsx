"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  getWeeklyReviewStatus,
  saveWeeklyReview,
} from "@/lib/actions/weekly-review";
import type { NextWeekPlan } from "@/lib/weekly-review/plan";

export function QuickWeeklyReviewCard() {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [topWin, setTopWin] = useState("");
  const [topAvoidance, setTopAvoidance] = useState("");
  const [targetSituation, setTargetSituation] = useState("");
  const [plan, setPlan] = useState<NextWeekPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWeeklyReviewStatus()
      .then((s) => {
        setCompleted(s.completed);
        if (s.review?.nextWeekPlan) {
          setPlan(s.review.nextWeekPlan as NextWeekPlan);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!topWin.trim() || !targetSituation.trim()) return;
    setSaving(true);
    try {
      const result = await saveWeeklyReview({
        topWin: topWin.trim(),
        topAvoidance: topAvoidance.trim() || undefined,
        targetSituation: targetSituation.trim(),
      });
      setPlan(result.nextWeekPlan);
      setCompleted(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">30-second weekly review</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shapes your plan for the coming week.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {completed && plan ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-primary">Next week&apos;s focus</p>
            <p>{plan.focusSituation}</p>
            <p className="text-muted-foreground">{plan.dailyMicroChallenge}</p>
            <p className="text-muted-foreground italic">{plan.mindsetPrompt}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {plan.suggestedHrefs.map((href) => (
                <Button key={href} variant="outline" size="sm" asChild>
                  <Link href={href}>Open</Link>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div>
              <Label>Top win this week</Label>
              <Input
                value={topWin}
                onChange={(e) => setTopWin(e.target.value)}
                placeholder="One thing that went well"
                className="mt-1"
              />
            </div>
            <div>
              <Label>What you avoided (optional)</Label>
              <Input
                value={topAvoidance}
                onChange={(e) => setTopAvoidance(e.target.value)}
                placeholder="e.g. speaking in meetings"
                className="mt-1"
              />
            </div>
            <div>
              <Label>One situation to target next week</Label>
              <Input
                value={targetSituation}
                onChange={(e) => setTargetSituation(e.target.value)}
                placeholder="e.g. ask a question in standup"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              disabled={saving || !topWin.trim() || !targetSituation.trim()}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save & build next week"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
