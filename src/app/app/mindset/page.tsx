"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Plus,
  Brain,
  Target,
  FlaskConical,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  getCBTStore,
  getThoughtRecordStats,
  deleteThoughtRecord,
  deletePrediction,
  type ThoughtRecord,
  type Prediction,
  type CBTStore,
} from "@/lib/cbt/store";
import { getTrapById, type ThinkingTrapId } from "@/lib/cbt/thinking-traps";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MindsetPage() {
  const router = useRouter();
  const [store, setStore] = useState<CBTStore>({
    thoughtRecords: [],
    predictions: [],
  });
  const [tab, setTab] = useState<"journal" | "predictions">("journal");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshStore = useCallback(() => {
    const s = getCBTStore();
    setStore(s);
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const stats = getThoughtRecordStats();
  const pendingPredictions = store.predictions.filter((p) => !p.completed);
  const completedPredictions = store.predictions.filter((p) => p.completed);

  function handleDeleteThought(id: string) {
    deleteThoughtRecord(id);
    refreshStore();
  }

  function handleDeletePrediction(id: string) {
    deletePrediction(id);
    refreshStore();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Mindset
          </h1>
          <p className="text-muted-foreground mt-1">
            Challenge unhelpful thoughts and test your predictions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Brain className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">
              Thoughts Challenged
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Target className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalTraps}</p>
            <p className="text-[10px] text-muted-foreground">Traps Caught</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <FlaskConical className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {store.predictions.filter((p) => p.completed).length}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Predictions Tested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1">
        <Button
          variant={tab === "journal" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("journal")}
        >
          Thought Journal
        </Button>
        <Button
          variant={tab === "predictions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("predictions")}
        >
          Predictions
        </Button>
      </div>

      {/* ── Thought Journal Tab ── */}
      {tab === "journal" && (
        <div className="space-y-3">
          <Link href="/mindset/new-thought">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              New Thought Record
            </Button>
          </Link>

          {store.thoughtRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No thought records yet</p>
              <p className="text-sm mt-1">
                Capture an unhelpful thought to start challenging thinking traps.
              </p>
            </div>
          )}

          {store.thoughtRecords.map((record) => (
            <ThoughtRecordCard
              key={record.id}
              record={record}
              expanded={expandedId === record.id}
              onToggle={() =>
                setExpandedId(expandedId === record.id ? null : record.id)
              }
              onDelete={() => handleDeleteThought(record.id)}
            />
          ))}
        </div>
      )}

      {/* ── Predictions Tab ── */}
      {tab === "predictions" && (
        <div className="space-y-4">
          <Link href="/mindset/new-thought?mode=prediction">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              New Prediction
            </Button>
          </Link>

          {store.predictions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No predictions yet</p>
              <p className="text-sm mt-1">
                Before a scary situation, predict what will happen — then see how
                reality compares.
              </p>
            </div>
          )}

          {/* Pending */}
          {pendingPredictions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Awaiting Outcome
              </p>
              {pendingPredictions.map((p) => (
                <PredictionCard
                  key={p.id}
                  prediction={p}
                  onRecordOutcome={() =>
                    router.push(`/mindset/predictions/${p.id}`)
                  }
                  onDelete={() => handleDeletePrediction(p.id)}
                />
              ))}
            </div>
          )}

          {/* Completed */}
          {completedPredictions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Completed
              </p>
              {completedPredictions.map((p) => (
                <PredictionCard
                  key={p.id}
                  prediction={p}
                  onDelete={() => handleDeletePrediction(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thinking Traps Education */}
      <Link href="/mindset/traps">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Learn About Thinking Traps</p>
                <p className="text-xs text-muted-foreground">
                  Understand the 6 common thought patterns that increase
                  stuttering anxiety
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

// ── Sub-Components ────────────────────────────────────

function ThoughtRecordCard({
  record,
  expanded,
  onToggle,
  onDelete,
}: {
  record: ThoughtRecord;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                {formatDate(record.createdAt)}
              </span>
              {record.emotions.slice(0, 2).map((e) => (
                <Badge
                  key={e.name}
                  variant="secondary"
                  className="text-[10px] bg-amber-500/10 text-amber-600"
                >
                  {e.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm font-medium line-clamp-1">
              {record.situation}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              {record.thinkingTraps.map((trap) => {
                const info = getTrapById(trap);
                return (
                  <Badge
                    key={trap}
                    variant="secondary"
                    className={`text-[9px] ${info?.color ?? ""}`}
                  >
                    {info?.emoji} {info?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          )}
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 text-sm border-t pt-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Automatic Thought
              </p>
              <p className="mt-0.5 italic">
                &ldquo;{record.automaticThought}&rdquo;
              </p>
            </div>
            {record.evidenceFor && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Evidence For
                </p>
                <p className="mt-0.5">{record.evidenceFor}</p>
              </div>
            )}
            {record.evidenceAgainst && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Evidence Against
                </p>
                <p className="mt-0.5">{record.evidenceAgainst}</p>
              </div>
            )}
            {record.balancedThought && (
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-600 mb-0.5">
                  Balanced Thought
                </p>
                <p className="mt-0.5">{record.balancedThought}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PredictionCard({
  prediction,
  onRecordOutcome,
  onDelete,
}: {
  prediction: Prediction;
  onRecordOutcome?: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={`mb-2 ${prediction.completed ? "opacity-80" : ""}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">
            {formatDate(prediction.createdAt)}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] bg-blue-500/10 text-blue-600"
          >
            Anxiety: {prediction.anxietyBefore}/10
          </Badge>
          {prediction.completed && prediction.anxietyAfter !== null && (
            <Badge
              variant="secondary"
              className={`text-[10px] ${
                prediction.anxietyAfter < prediction.anxietyBefore
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              After: {prediction.anxietyAfter}/10
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium">{prediction.situation}</p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          &ldquo;{prediction.prediction}&rdquo;
        </p>

        {prediction.completed && prediction.actualOutcome && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs font-medium text-emerald-600">
              What actually happened:
            </p>
            <p className="text-xs mt-0.5">{prediction.actualOutcome}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          {!prediction.completed && onRecordOutcome && (
            <Button size="sm" variant="outline" onClick={onRecordOutcome}>
              Record Outcome
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
