"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
} from "lucide-react";
import type { CoachingTip, FeedbackRubric } from "@/lib/exercises/exercise-data";

interface CoachingPanelProps {
  tips?: CoachingTip[];
  rubric?: FeedbackRubric;
}

export function CoachingPanel({ tips, rubric }: CoachingPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!tips?.length && !rubric) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4 pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Coaching Tips</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-4">
            {/* Do / Don't Tips */}
            {tips && tips.length > 0 && (
              <div className="space-y-2">
                {tips.map((tip, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">{tip.doThis}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">{tip.notThis}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback Rubric */}
            {rubric && (
              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Am I doing it right?</span>
                </div>
                <ul className="space-y-1 mb-2">
                  {rubric.checkpoints.map((checkpoint, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[10px] text-muted-foreground mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-muted-foreground">{checkpoint}</p>
                    </li>
                  ))}
                </ul>
                <div className="p-2 rounded-md bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400">
                    <span className="font-semibold">Success:</span> {rubric.successSignal}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
