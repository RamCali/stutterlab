"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen } from "lucide-react";
import { THINKING_TRAPS, type ThinkingTrapId } from "@/lib/cbt/thinking-traps";
import { getThoughtRecordStats } from "@/lib/cbt/store";

export default function ThinkingTrapsPage() {
  const router = useRouter();
  const [trapCounts, setTrapCounts] = useState<
    Partial<Record<ThinkingTrapId, number>>
  >({});
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const stats = getThoughtRecordStats();
    setTrapCounts(stats.trapCounts);
    setTotalRecords(stats.total);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.push("/app/mindset")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Mindset
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Thinking Traps
        </h1>
        <p className="text-muted-foreground mt-1">
          These are common patterns of distorted thinking that increase
          stuttering anxiety. Learning to spot them is the first step to
          breaking free.
        </p>
      </div>

      {/* Trap Cards */}
      <div className="space-y-4">
        {THINKING_TRAPS.map((trap) => {
          const count = trapCounts[trap.id] ?? 0;
          return (
            <Card key={trap.id}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{trap.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold">{trap.name}</h3>
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${trap.color}`}
                        >
                          {count}x in your records
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trap.description}
                    </p>
                    <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-muted">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Example:
                      </p>
                      <p className="text-sm italic">{trap.example}</p>
                    </div>
                    <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary font-medium mb-0.5">
                        Challenge this trap:
                      </p>
                      <p className="text-sm">{trap.challenge}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Stats */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <h3 className="text-sm font-semibold mb-2">
            Your Most Common Traps
          </h3>
          {totalRecords === 0 ? (
            <p className="text-xs text-muted-foreground">
              Start journaling to see which thinking traps come up most often
              for you.
            </p>
          ) : (
            <div className="space-y-2">
              {THINKING_TRAPS.filter((t) => (trapCounts[t.id] ?? 0) > 0)
                .sort(
                  (a, b) =>
                    (trapCounts[b.id] ?? 0) - (trapCounts[a.id] ?? 0)
                )
                .map((trap) => {
                  const count = trapCounts[trap.id] ?? 0;
                  const pct = Math.round(
                    (count / Math.max(totalRecords, 1)) * 100
                  );
                  return (
                    <div key={trap.id} className="flex items-center gap-2">
                      <span>{trap.emoji}</span>
                      <span className="text-sm flex-1">{trap.name}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {count}x
                      </span>
                    </div>
                  );
                })}
              {THINKING_TRAPS.every((t) => (trapCounts[t.id] ?? 0) === 0) && (
                <p className="text-xs text-muted-foreground">
                  No traps identified yet. Keep journaling!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
