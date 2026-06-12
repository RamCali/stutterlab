"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AVOIDANCE_BEHAVIORS,
  AGE_RANGE_OPTIONS,
  BLOCK_EMOTIONS,
  CONFIDENCE_SITUATIONS,
  DAILY_TIME_OPTIONS,
  FEARED_SITUATIONS,
  FAMILY_HISTORY_OPTIONS,
  FAST_OR_UNCLEAR_SPEECH_OPTIONS,
  FLUENCY_PERSISTENCE_OPTIONS,
  ONSET_OPTIONS,
  PHYSICAL_BEHAVIORS,
  PRIMARY_GOAL_OPTIONS,
  SPEECH_CHALLENGES,
  STUTTERING_TYPES,
  TENSION_LOCATIONS,
  THERAPY_HISTORY_OPTIONS,
  USER_TYPE_OPTIONS,
} from "@/lib/onboarding/feared-situations";
import {
  ClipboardCheck,
  Pencil,
  RefreshCw,
  User,
  Brain,
  Heart,
  Target,
  Activity,
} from "lucide-react";

type ProfileData = Record<string, unknown>;

function labelFromOptions<T extends { id: string; label: string }>(
  options: readonly T[],
  id: unknown,
): string | null {
  if (typeof id !== "string") return null;
  return options.find((o) => o.id === id)?.label ?? id;
}

function labelsFromOptions<T extends { id: string; label: string }>(
  options: readonly T[],
  ids: unknown,
): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? String(id))
    .filter(Boolean);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-2 border-b border-border/40 last:border-b-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm">{value || <span className="text-muted-foreground italic">Not set</span>}</div>
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Badge key={it} variant="secondary" className="text-xs">
          {it}
        </Badge>
      ))}
    </div>
  );
}

export default function SpeechProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/onboarding")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-muted-foreground">Loading your speech profile…</p>
      </div>
    );
  }

  if (!data || !data.onboardingCompleted) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Speech profile</h1>
        <p className="text-muted-foreground">
          You haven&apos;t finished onboarding yet. Complete it to build your profile.
        </p>
        <Link href="/onboarding">
          <Button>Start onboarding</Button>
        </Link>
      </div>
    );
  }

  const d = data as Record<string, unknown>;

  const confidenceRatings = (d.confidenceRatings as Record<string, number>) || {};
  const confidenceRows = CONFIDENCE_SITUATIONS.map((s) => ({
    label: s.label,
    rating: confidenceRatings[s.id] ?? 0,
  })).filter((r) => r.rating > 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            Your speech profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            What you told us during onboarding. This shapes your daily plan, AI coaching, and
            exercises.
          </p>
        </div>
        <Link href="/onboarding?edit=1">
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-1" />
            Retake assessment
          </Button>
        </Link>
      </div>

      {/* About you */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            About you
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label="Name" value={(d.name as string) || null} />
          <Row label="Who it's for" value={labelFromOptions(USER_TYPE_OPTIONS, d.userType)} />
          <Row label="Age range" value={labelFromOptions(AGE_RANGE_OPTIONS, d.ageRange)} />
          <Row label="Stuttering began" value={labelFromOptions(ONSET_OPTIONS, d.onsetTiming)} />
          <Row
            label="Family history"
            value={labelFromOptions(FAMILY_HISTORY_OPTIONS, d.familyHistory)}
          />
          <Row
            label="How long fluency has been a focus"
            value={labelFromOptions(FLUENCY_PERSISTENCE_OPTIONS, d.fluencyPersistence)}
          />
          <Row
            label="Previous therapy"
            value={labelFromOptions(THERAPY_HISTORY_OPTIONS, d.therapyHistory)}
          />
        </CardContent>
      </Card>

      {/* Stutter characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Stutter characteristics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label="Severity (derived)" value={(d.severity as string) || null} />
          <Row label="Severity score" value={d.severityScore ? `${d.severityScore} / 100` : null} />
          <Row label="Confidence score" value={d.confidenceScore ? `${d.confidenceScore} / 100` : null} />
          <Row label="Frequency" value={(d.stutterFrequency as string) || null} />
          <Row label="Duration" value={(d.stutterDuration as string) || null} />
          <Row label="Daily impact" value={(d.stutterImpact as string) || null} />
          <Row
            label="Disfluency types"
            value={<Pills items={labelsFromOptions(STUTTERING_TYPES, d.stutteringTypes)} />}
          />
          <Row
            label="Physical behaviors"
            value={<Pills items={labelsFromOptions(PHYSICAL_BEHAVIORS, d.physicalBehaviors)} />}
          />
          <Row
            label="Tension locations"
            value={<Pills items={labelsFromOptions(TENSION_LOCATIONS, d.tensionLocations)} />}
          />
          <Row
            label="Fast or unclear speech"
            value={labelFromOptions(FAST_OR_UNCLEAR_SPEECH_OPTIONS, d.fastOrUnclearSpeech)}
          />
        </CardContent>
      </Card>

      {/* Emotional & situational */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            How blocks feel & where they show up
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row
            label="Feelings during a block"
            value={<Pills items={labelsFromOptions(BLOCK_EMOTIONS, d.blockEmotions)} />}
          />
          <Row
            label="Feared situations"
            value={<Pills items={labelsFromOptions(FEARED_SITUATIONS, d.fearedSituations)} />}
          />
          <Row
            label="Avoidance behaviors"
            value={<Pills items={labelsFromOptions(AVOIDANCE_BEHAVIORS, d.avoidanceBehaviors)} />}
          />
          <Row
            label="Feared words"
            value={<Pills items={(d.fearedWords as string[]) || []} />}
          />
          {(d.wordReflection as string)?.trim() && (
            <Row
              label="Word reflection"
              value={<p className="italic">&ldquo;{d.wordReflection as string}&rdquo;</p>}
            />
          )}
        </CardContent>
      </Card>

      {/* Confidence */}
      {confidenceRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Confidence by situation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {confidenceRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span>{row.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        n <= row.rating
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Goals & plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Goals & plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row
            label="North star goal"
            value={(d.northStarGoal as string)?.trim() ? `“${d.northStarGoal as string}”` : null}
          />
          <Row
            label="Primary goal type"
            value={labelFromOptions(PRIMARY_GOAL_OPTIONS, d.primaryGoalType)}
          />
          <Row
            label="Daily time commitment"
            value={labelFromOptions(DAILY_TIME_OPTIONS, d.dailyTimeCommitment)}
          />
          <Row
            label="Speech challenges"
            value={<Pills items={labelsFromOptions(SPEECH_CHALLENGES, d.speechChallenges)} />}
          />
          <Row label="Practice time" value={(d.preferredPracticeTime as string) || null} />
          <Row label="Practice pace" value={(d.practicePace as string) || null} />
          <Row label="Coaching tone" value={(d.coachingTone as string) || null} />
          {(d.commitmentReason as string)?.trim() && (
            <Row
              label="Why now"
              value={<p className="italic">&ldquo;{d.commitmentReason as string}&rdquo;</p>}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            Back to settings
          </Button>
        </Link>
        <Link href="/onboarding?edit=1">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Update answers
          </Button>
        </Link>
      </div>
    </div>
  );
}
