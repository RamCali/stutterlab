"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Loader2,
  ArrowLeft,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Lightbulb,
  Share2,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { PremiumGate } from "@/components/premium-gate";
import {
  getWeeklyAuditStatus,
  getAuditHistory,
  saveWeeklyAudit,
} from "@/lib/actions/weekly-audit";

type AuditStep = "prompt" | "recording" | "processing" | "report";

interface AuditReport {
  percentSS: number;
  severityRating: string;
  fluencyScore: number;
  speakingRate: number;
  totalSyllables: number;
  stutteredSyllables: number;
  disfluencyBreakdown: {
    blocks: { count: number; examples: string[] };
    prolongations: { count: number; examples: string[] };
    repetitions: { count: number; examples: string[] };
    interjections: { count: number; examples: string[] };
  };
  techniqueAnalysis: {
    window: string;
    techniques: string[];
    fluencyRating: number;
  }[];
  rateAnalysis: {
    window: string;
    spm: number;
    zone: string;
  }[];
  weekOverWeekChange: {
    percentSSDelta: number;
    fluencyDelta: number;
    rateDelta: number;
    trend: string;
  } | null;
  phonemeHeatmap: { phoneme: string; difficulty: number }[];
  insights: string[];
}

export default function WeeklyAuditPage() {
  const [step, setStep] = useState<AuditStep>("prompt");
  const [prompt, setPrompt] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // Recording state
  const [transcript, setTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Report state
  const [report, setReport] = useState<AuditReport | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  // History
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getAuditHistory>>>([]);

  const MAX_DURATION = 120; // 2 minutes

  useEffect(() => {
    Promise.all([getWeeklyAuditStatus(), getAuditHistory(4)])
      .then(([status, hist]) => {
        setPrompt(status.prompt);
        setWeekNumber(status.weekNumber);
        setAlreadyDone(status.completed);
        setHistory(hist);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecording();
    };
  }, []);

  // Auto-stop at 2 minutes
  useEffect(() => {
    if (elapsedSeconds >= MAX_DURATION && isRecording) {
      stopRecording();
      analyzeAudit();
    }
  }, [elapsedSeconds, isRecording]);

  function startRecording() {
    setTranscript("");
    setElapsedSeconds(0);
    setIsRecording(true);
    setStep("recording");

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Start Web Speech API
    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text + " ";
          } else {
            interim = text;
          }
        }
        setTranscript(finalTranscript + interim);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          try { recognition.start(); } catch {}
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          try { recognition.start(); } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }

  async function analyzeAudit() {
    stopRecording();
    setStep("processing");

    try {
      const res = await fetch("/api/weekly-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          durationSeconds: elapsedSeconds,
          prompt,
          weekNumber,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReport(data.analysis);

      // Save to DB
      const result = await saveWeeklyAudit({
        weekNumber,
        prompt,
        transcription: transcript,
        durationSeconds: elapsedSeconds,
        percentSS: data.analysis.percentSS,
        severityRating: data.analysis.severityRating,
        fluencyScore: data.analysis.fluencyScore,
        speakingRate: data.analysis.speakingRate,
        totalSyllables: data.analysis.totalSyllables,
        stutteredSyllables: data.analysis.stutteredSyllables,
        disfluencyBreakdown: data.analysis.disfluencyBreakdown,
        techniqueAnalysis: data.analysis.techniqueAnalysis,
        rateAnalysis: data.analysis.rateAnalysis,
        weekOverWeekChange: data.analysis.weekOverWeekChange,
        insights: data.analysis.insights,
        phonemeHeatmap: data.analysis.phonemeHeatmap,
      });

      setXpEarned(result.xp);
      setStep("report");
    } catch (err) {
      console.error("Weekly audit analysis failed:", err);
      setStep("prompt");
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const remainingTime = MAX_DURATION - elapsedSeconds;

  const severityColor = (rating: string) => {
    switch (rating) {
      case "very_mild":
      case "mild":
        return "text-[#00E676]";
      case "moderate":
        return "text-[#FFB347]";
      case "severe":
      case "very_severe":
        return "text-[#FF5252]";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PremiumGate
      requiredPlan="pro"
      featureName="Weekly Clinical Audit"
      description="Get SSI-4 grade speech analysis with %SS scoring, disfluency breakdown, and week-over-week trend tracking."
    >
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/progress">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Weekly Clinical Audit
            </h1>
            <p className="text-xs text-muted-foreground">{weekNumber}</p>
          </div>
        </div>

        {/* Step 1: Prompt */}
        {step === "prompt" && (
          <div className="space-y-6">
            {alreadyDone ? (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-semibold">Audit completed this week!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Come back next week for your next audit. Check your history below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">This Week&apos;s Speaking Prompt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-lg font-medium text-center">&ldquo;{prompt}&rdquo;</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Speak for 2 minutes on this topic. Your speech will be transcribed and analyzed by our AI SLP.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 2 min recording
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" /> SSI-4 grade analysis
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={startRecording}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Previous Audits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.map((audit) => (
                      <div
                        key={audit.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">{audit.weekNumber}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {audit.prompt}
                          </p>
                        </div>
                        <div className="text-right">
                          {audit.percentSS != null && (
                            <Badge variant="outline" className="text-xs">
                              {audit.percentSS.toFixed(1)}% SS
                            </Badge>
                          )}
                          {audit.fluencyScore != null && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Fluency: {audit.fluencyScore}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Recording */}
        {step === "recording" && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center space-y-6">
                {/* Countdown timer */}
                <div className="text-center">
                  <p className={`text-5xl font-light font-mono ${
                    remainingTime <= 10 ? "text-red-400" : ""
                  }`}>
                    {formatTime(remainingTime)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">remaining</p>
                </div>

                {/* Recording indicator */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-sm text-red-400 font-medium">Recording</span>
                </div>

                {/* Live transcript */}
                <div className="w-full min-h-[120px] max-h-[200px] overflow-y-auto p-4 rounded-xl bg-muted/30 border">
                  {transcript ? (
                    <p className="text-sm leading-relaxed">{transcript}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Start speaking... your words will appear here.
                    </p>
                  )}
                </div>

                {/* Stop button */}
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={analyzeAudit}
                  disabled={transcript.trim().length < 20}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Analyze
                </Button>

                {transcript.trim().length < 20 && (
                  <p className="text-xs text-muted-foreground">
                    Keep speaking — we need at least a few sentences for accurate analysis.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Analyzing Your Speech...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI SLP is generating your clinical-grade report.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Report */}
        {step === "report" && report && (
          <div className="space-y-4">
            {/* XP Banner */}
            {xpEarned > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-3 flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">+{xpEarned} XP earned</span>
                </CardContent>
              </Card>
            )}

            {/* Overall Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Clinical Audit Report
                </CardTitle>
                <p className="text-xs text-muted-foreground">{weekNumber} — {formatTime(elapsedSeconds)} recording</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Key metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <p className={`text-2xl font-bold ${severityColor(report.severityRating)}`}>
                      {report.percentSS.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">%SS</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <p className={`text-2xl font-bold ${
                      report.fluencyScore >= 80 ? "text-[#00E676]" : report.fluencyScore >= 60 ? "text-[#FFB347]" : "text-[#FF5252]"
                    }`}>
                      {report.fluencyScore}
                    </p>
                    <p className="text-xs text-muted-foreground">Fluency</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <p className="text-2xl font-bold">{Math.round(report.speakingRate)}</p>
                    <p className="text-xs text-muted-foreground">SPM</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <p className={`text-2xl font-bold ${severityColor(report.severityRating)}`}>
                      {report.severityRating.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">Severity</p>
                  </div>
                </div>

                {/* Week-over-week change */}
                {report.weekOverWeekChange && (
                  <div className="p-3 rounded-lg bg-muted/10 border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      {report.weekOverWeekChange.percentSSDelta <= 0 ? (
                        <TrendingDown className="h-3 w-3 text-[#00E676]" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-[#FF5252]" />
                      )}
                      Week-over-Week Change
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className={`text-sm font-bold ${
                          report.weekOverWeekChange.percentSSDelta <= 0 ? "text-[#00E676]" : "text-[#FF5252]"
                        }`}>
                          {report.weekOverWeekChange.percentSSDelta > 0 ? "+" : ""}
                          {report.weekOverWeekChange.percentSSDelta.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">%SS Change</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${
                          report.weekOverWeekChange.fluencyDelta >= 0 ? "text-[#00E676]" : "text-[#FF5252]"
                        }`}>
                          {report.weekOverWeekChange.fluencyDelta > 0 ? "+" : ""}
                          {report.weekOverWeekChange.fluencyDelta}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Fluency Change</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">
                          {report.weekOverWeekChange.rateDelta > 0 ? "+" : ""}
                          {report.weekOverWeekChange.rateDelta.toFixed(0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">SPM Change</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {report.weekOverWeekChange.trend}
                    </p>
                  </div>
                )}

                {/* Disfluency Breakdown */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Disfluency Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(report.disfluencyBreakdown).map(([type, data]) => (
                      <div
                        key={type}
                        className="p-2.5 rounded-lg bg-muted/10 border"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <Badge variant="secondary" className="text-xs">{data.count}</Badge>
                        </div>
                        {data.examples.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            e.g. {data.examples.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Speaking Rate Windows */}
                {report.rateAnalysis.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Speaking Rate (30s windows)</p>
                    <div className="flex items-end gap-1 h-20">
                      {report.rateAnalysis.map((w, i) => {
                        const maxRate = Math.max(...report.rateAnalysis.map((r) => r.spm), 1);
                        const heightPct = (w.spm / maxRate) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-all"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: w.zone === "target" ? "#00E676" : w.zone === "fast" ? "#FF5252" : "#3B82F6",
                              opacity: 0.7,
                            }}
                            title={`${w.window}: ${Math.round(w.spm)} SPM (${w.zone})`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>0:00</span>
                      <span>{formatTime(elapsedSeconds)}</span>
                    </div>
                  </div>
                )}

                {/* Phoneme Heatmap */}
                {report.phonemeHeatmap.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Phoneme Difficulty</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.phonemeHeatmap.map((p) => (
                        <Badge
                          key={p.phoneme}
                          variant="outline"
                          className={`text-xs ${
                            p.difficulty >= 0.7
                              ? "border-red-500/30 text-red-400 bg-red-500/5"
                              : p.difficulty >= 0.4
                                ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
                                : "border-green-500/30 text-green-400 bg-green-500/5"
                          }`}
                        >
                          /{p.phoneme}/
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coaching Insights */}
                {report.insights.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Clinical Insights
                    </p>
                    <div className="space-y-2">
                      {report.insights.map((insight, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Full Transcript</p>
                  <div className="max-h-32 overflow-y-auto p-3 rounded-lg bg-muted/10 border">
                    <p className="text-sm leading-relaxed">{transcript}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/progress" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Progress
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "StutterLab Weekly Audit",
                      text: `Weekly Audit ${weekNumber}: ${report.percentSS.toFixed(1)}% SS, Fluency ${report.fluencyScore}`,
                    }).catch(() => {});
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
