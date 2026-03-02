"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grid3X3, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { getPhonemeLabel } from "@/lib/analysis/phoneme-mapper";
import type { PhonemeHeatmapData } from "@/lib/analysis/types";

interface PhonemeHeatmapProps {
  data: PhonemeHeatmapData;
  onGeneratePractice?: (phonemes: string[]) => void;
  practicesSentences?: string[];
}

function getDifficultyColor(score: number): string {
  if (score >= 0.6) return "bg-red-500/20 border-red-500/40 text-red-400";
  if (score >= 0.4) return "bg-orange-500/20 border-orange-500/40 text-orange-400";
  if (score >= 0.25) return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
  return "bg-green-500/20 border-green-500/40 text-green-400";
}

function getDifficultyLabel(score: number): string {
  if (score >= 0.6) return "Hard";
  if (score >= 0.4) return "Medium";
  if (score >= 0.25) return "Mild";
  return "Easy";
}

export function PhonemeHeatmap({
  data,
  onGeneratePractice,
  practicesSentences,
}: PhonemeHeatmapProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);

  if (data.phonemes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-primary" />
            Phoneme Difficulty Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more practice sessions to build your phoneme map.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-primary" />
          Phoneme Difficulty Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phoneme grid */}
        <div className="flex flex-wrap gap-2">
          {data.phonemes.map((p) => (
            <button
              key={p.phoneme}
              onClick={() =>
                setExpanded(expanded === p.phoneme ? null : p.phoneme)
              }
              className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all cursor-pointer ${getDifficultyColor(
                p.difficultyScore
              )} ${expanded === p.phoneme ? "ring-2 ring-primary" : ""}`}
            >
              <span className="font-medium">{p.phoneme}</span>
              <span className="text-sm ml-1 opacity-70">
                {p.disfluencyCount}x
              </span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500/30 border border-green-500/40" />
            Easy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500/30 border border-yellow-500/40" />
            Mild
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/30 border border-orange-500/40" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/30 border border-red-500/40" />
            Hard
          </span>
        </div>

        {/* Expanded phoneme details */}
        {expanded && (() => {
          const phoneme = data.phonemes.find((p) => p.phoneme === expanded);
          if (!phoneme) return null;
          return (
            <div className="p-3 rounded-lg border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold">{expanded}</span>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(phoneme.difficultyScore)}
                >
                  {getDifficultyLabel(phoneme.difficultyScore)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                IPA: {getPhonemeLabel(expanded)} — {phoneme.disfluencyCount} disfluencies across {phoneme.totalAttempts} attempts
              </p>
              {phoneme.triggerWords.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Words that triggered difficulty:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {phoneme.triggerWords.map((w) => (
                      <Badge
                        key={w}
                        variant="secondary"
                        className="text-sm"
                      >
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Generate Practice */}
        {data.topDifficult.length > 0 && onGeneratePractice && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                onGeneratePractice(data.topDifficult);
                setShowPractice(true);
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generate Practice for Hard Sounds
              {showPractice ? (
                <ChevronUp className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-auto" />
              )}
            </Button>

            {showPractice && practicesSentences && practicesSentences.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">
                  Practice these sentences — they're loaded with your difficult sounds:
                </p>
                {practicesSentences.map((s, i) => (
                  <p key={i} className="text-sm leading-relaxed">
                    {i + 1}. {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Based on {data.totalAnalyzed} analyzed sessions
        </p>
      </CardContent>
    </Card>
  );
}
