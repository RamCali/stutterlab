"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Gauge,
} from "lucide-react";
import type { TurnMetrics } from "@/lib/audio/VoiceConversation";

interface PerformanceReportProps {
  turns: TurnMetrics[];
  scenario: string;
  durationSeconds: number;
  onBack: () => void;
}

export function PerformanceReport({
  turns,
  scenario,
  durationSeconds,
  onBack,
}: PerformanceReportProps) {
  const userTurns = turns.filter((t) => t.role === "user");
  const totalDisfluencies = userTurns.reduce(
    (s, t) => s + t.disfluencyCount,
    0
  );
  const avgRate =
    userTurns.length > 0
      ? Math.round(
          userTurns.reduce((s, t) => s + t.speakingRate, 0) / userTurns.length
        )
      : 0;

  // Overall fluency: 100 minus penalties
  const fluencyScore = Math.max(
    0,
    Math.round(100 - totalDisfluencies * 6)
  );

  // Find hardest moment (turn with most disfluencies)
  const hardestTurn = userTurns.reduce(
    (max, t) => (t.disfluencyCount > (max?.disfluencyCount ?? 0) ? t : max),
    null as TurnMetrics | null
  );

  // Technique breakdown
  const allTechniques = userTurns
    .flatMap((t) => t.techniquesUsed || []);
  const techniqueCounts: Record<string, number> = {};
  for (const tech of allTechniques) {
    techniqueCounts[tech] = (techniqueCounts[tech] || 0) + 1;
  }
  const hasTechniques = allTechniques.length > 0;

  const techniqueLabels: Record<string, string> = {
    gentle_onset: "Gentle Onset",
    pacing: "Pacing",
    rate_compliance: "Rate Compliance",
    prolonged_speech: "Prolonged Speech",
    cancellation: "Cancellation",
    pull_out: "Pull-out",
  };

  // Average vocal effort
  const turnsWithEffort = userTurns.filter((t) => t.vocalEffort != null);
  const avgEffort =
    turnsWithEffort.length > 0
      ? turnsWithEffort.reduce((s, t) => s + (t.vocalEffort ?? 0), 0) /
        turnsWithEffort.length
      : null;

  // Pace zone summary
  const zoneCount = { slow: 0, target: 0, fast: 0 };
  for (const t of userTurns) {
    if (t.spmZone) zoneCount[t.spmZone]++;
  }
  const totalZoned = zoneCount.slow + zoneCount.target + zoneCount.fast;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Scenarios
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Voice Conversation Report
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {scenario} — {formatTime(durationSeconds)} duration
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <p
                className={`text-2xl font-bold ${
                  fluencyScore >= 80
                    ? "text-[#00E676]"
                    : fluencyScore >= 60
                      ? "text-[#FFB347]"
                      : "text-[#FF5252]"
                }`}
              >
                {fluencyScore}
              </p>
              <p className="text-xs text-muted-foreground">Fluency</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <p className="text-2xl font-bold">{userTurns.length}</p>
              <p className="text-xs text-muted-foreground">Your Turns</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <p className="text-2xl font-bold">{avgRate}</p>
              <p className="text-xs text-muted-foreground">Avg syl/min</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <p className="text-2xl font-bold">{totalDisfluencies}</p>
              <p className="text-xs text-muted-foreground">Disfluencies</p>
            </div>
          </div>

          {/* Per-turn fluency timeline */}
          {userTurns.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Fluency per Turn
              </p>
              <div className="flex items-end gap-1 h-16">
                {userTurns.map((turn, i) => {
                  const turnFluency = Math.max(
                    0,
                    100 - turn.disfluencyCount * 15
                  );
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{
                        height: `${turnFluency}%`,
                        backgroundColor:
                          turnFluency >= 80
                            ? "#00E676"
                            : turnFluency >= 60
                              ? "#FFB347"
                              : "#FF5252",
                        opacity: 0.7,
                      }}
                      title={`Turn ${i + 1}: ${turnFluency}% fluency`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Turn 1</span>
                <span>Turn {userTurns.length}</span>
              </div>
            </div>
          )}

          {/* Hardest moment */}
          {hardestTurn && hardestTurn.disfluencyCount > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs font-medium flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                Hardest Moment
              </p>
              <p className="text-sm mt-1 line-clamp-2">
                &ldquo;{hardestTurn.text}&rdquo;
              </p>
              <Badge variant="outline" className="mt-2 text-xs">
                {hardestTurn.disfluencyCount} disfluencies detected
              </Badge>
            </div>
          )}

          {/* Technique breakdown */}
          {hasTechniques && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Techniques Detected
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(techniqueCounts).map(([tech, count]) => (
                  <div
                    key={tech}
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <span className="text-sm">
                      {techniqueLabels[tech] || tech}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                      {count}x
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {allTechniques.length} technique use{allTechniques.length !== 1 ? "s" : ""} detected across {userTurns.length} turn{userTurns.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Vocal effort + pace */}
          {(avgEffort != null || totalZoned > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {/* Vocal effort */}
              {avgEffort != null && (
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Activity className="h-3 w-3" />
                    Avg Vocal Effort
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(avgEffort * 100, 100)}%`,
                        backgroundColor:
                          avgEffort < 0.4
                            ? "#00E676"
                            : avgEffort < 0.7
                              ? "#FFB347"
                              : "#FF5252",
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {Math.round(avgEffort * 100)}%{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {avgEffort < 0.4
                        ? "— Relaxed"
                        : avgEffort < 0.7
                          ? "— Moderate"
                          : "— Tense"}
                    </span>
                  </p>
                </div>
              )}

              {/* Pace distribution */}
              {totalZoned > 0 && (
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Gauge className="h-3 w-3" />
                    Pace Distribution
                  </p>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    {zoneCount.slow > 0 && (
                      <div
                        className="bg-blue-400 h-full"
                        style={{
                          width: `${(zoneCount.slow / totalZoned) * 100}%`,
                        }}
                      />
                    )}
                    {zoneCount.target > 0 && (
                      <div
                        className="bg-[#00E676] h-full"
                        style={{
                          width: `${(zoneCount.target / totalZoned) * 100}%`,
                        }}
                      />
                    )}
                    {zoneCount.fast > 0 && (
                      <div
                        className="bg-[#FF5252] h-full"
                        style={{
                          width: `${(zoneCount.fast / totalZoned) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Slow: {zoneCount.slow}</span>
                    <span className="text-[#00E676]">Target: {zoneCount.target}</span>
                    <span>Fast: {zoneCount.fast}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversation transcript */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Full Conversation
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {turns.map((turn, i) => (
                <div
                  key={i}
                  className={`text-sm p-2 rounded ${
                    turn.role === "user"
                      ? "bg-primary/10 ml-8"
                      : "bg-muted/10 mr-8"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {turn.role === "user" ? "You" : "AI"}
                  </span>
                  <p className="text-sm">{turn.text}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
