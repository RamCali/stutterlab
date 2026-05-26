"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, TrendingDown, ChevronRight } from "lucide-react";
import { getCBTStore } from "@/lib/cbt/store";
import {
  getBehavioralExperimentStats,
  type BehavioralExperimentStats,
} from "@/lib/actions/outcomes";

const EMPTY_STATS: BehavioralExperimentStats = {
  total: 0,
  completed: 0,
  pending: 0,
  anxietyImprovedCount: 0,
};

export function BehavioralExperimentsCard() {
  const [stats, setStats] = useState<BehavioralExperimentStats>(EMPTY_STATS);

  useEffect(() => {
    const store = getCBTStore();
    const fallback: BehavioralExperimentStats = {
      total: store.predictions.length,
      completed: store.predictions.filter((p) => p.completed).length,
      pending: store.predictions.filter((p) => !p.completed).length,
      anxietyImprovedCount: store.predictions.filter(
        (p) =>
          p.completed &&
          p.anxietyAfter != null &&
          p.anxietyAfter < p.anxietyBefore,
      ).length,
    };

    getBehavioralExperimentStats().then(setStats).catch(() => setStats(fallback));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          Behavioral experiments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test catastrophic predictions against reality — a core CBT practice for
          speech anxiety.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Logged</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.completed}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
        {stats.anxietyImprovedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-muted/30">
            <TrendingDown className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              {stats.anxietyImprovedCount} experiment
              {stats.anxietyImprovedCount === 1 ? "" : "s"} where anxiety was
              lower after than before
            </span>
          </div>
        )}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/app/mindset">
            Log or complete an experiment
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
