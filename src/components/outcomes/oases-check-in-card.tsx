"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  OASES_S_ITEMS,
  computeImpactScore,
  getOasesCheckIns,
  isOasesCheckInDue,
  saveOasesCheckIn,
  type OasesSCheckIn,
} from "@/lib/outcomes/oases-s";
import {
  getOasesCheckInsFromDb,
  saveOasesCheckInToDb,
} from "@/lib/actions/outcomes";
import { Activity } from "lucide-react";

function getInitialLastCheckIn(): OasesSCheckIn | null {
  const local = getOasesCheckIns();
  return local[local.length - 1] ?? null;
}

export function OasesCheckInCard() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<OasesSCheckIn | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<OasesSCheckIn | null>(
    getInitialLastCheckIn,
  );
  const [due, setDue] = useState(isOasesCheckInDue);

  useEffect(() => {
    getOasesCheckInsFromDb()
      .then((rows) => {
        if (rows.length === 0) return;
        const latest = rows[0];
        const fromDb: OasesSCheckIn = {
          date: latest.checkInDate,
          scores: latest.scores as Record<string, number>,
          impactScore: latest.impactScore,
        };
        saveOasesCheckIn(fromDb);
        setLastCheckIn(fromDb);
        const lastDate = new Date(fromDb.date);
        const days = Math.floor(
          (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        setDue(days >= 30);
      })
      .catch(() => {});
  }, []);

  if (!due && lastCheckIn && !saved) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Speaking impact (self-check)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last check-in: impact score {lastCheckIn.impactScore}/5 (lower is
            better). Next check-in in about 30 days.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function handleSave() {
    const complete = OASES_S_ITEMS.every(
      (item) => scores[item.id] >= 1 && scores[item.id] <= 5,
    );
    if (!complete) return;
    const checkIn: OasesSCheckIn = {
      date: new Date().toISOString().split("T")[0],
      scores: { ...scores },
      impactScore: computeImpactScore(scores),
    };
    saveOasesCheckIn(checkIn);
    setSaved(checkIn);
    setLastCheckIn(checkIn);
    setDue(false);
    try {
      await saveOasesCheckInToDb({
        checkInDate: checkIn.date,
        scores: checkIn.scores,
        impactScore: checkIn.impactScore,
      });
    } catch {
      // local save still works offline / logged out
    }
  }

  if (saved) {
    return (
      <Card className="border-primary/30">
        <CardContent className="pt-5">
          <p className="text-sm font-medium">Check-in saved</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your impact score today: {saved.impactScore}/5. Track trends over
            time — this is for self-monitoring, not a clinical diagnosis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Monthly impact check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rate how much stuttering affects you (1 = minimal, 5 = severe). Inspired
          by OASES impact domains — for your progress only.
        </p>
        {OASES_S_ITEMS.map((item) => (
          <div key={item.id} className="space-y-2">
            <Label className="text-sm">{item.label}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setScores((s) => ({ ...s, [item.id]: n }))
                  }
                  className={`h-9 w-9 rounded-md text-sm font-medium border transition-colors ${
                    scores[item.id] === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={() => void handleSave()} className="w-full">
          Save check-in
        </Button>
      </CardContent>
    </Card>
  );
}
