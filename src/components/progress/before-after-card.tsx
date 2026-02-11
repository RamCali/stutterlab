"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Share2,
  Copy,
  Check,
  AudioWaveform,
  Sparkles,
} from "lucide-react";
import { getBeforeAfterData } from "@/lib/actions/report-actions";

interface ReportSnapshot {
  month: string;
  percentSS: number;
  severityRating: string;
  fluencyScore: number;
  speakingRate: number;
}

interface BeforeAfterData {
  first: ReportSnapshot;
  latest: ReportSnapshot;
  totalMonths: number;
  totalSessions: number;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "normal": return "text-[#00E676]";
    case "mild": return "text-[#FFB347]";
    case "moderate": return "text-[#FF8C00]";
    case "severe": return "text-[#FF5252]";
    default: return "text-muted-foreground";
  }
}

/** Full Before/After comparison card */
export function BeforeAfterCard({ data }: { data: BeforeAfterData }) {
  const [shared, setShared] = useState(false);

  const ssChange = data.first.percentSS - data.latest.percentSS;
  const ssImproved = ssChange > 0;
  const fluencyChange = data.latest.fluencyScore - data.first.fluencyScore;
  const fluencyImproved = fluencyChange > 0;

  async function handleShare() {
    const text = [
      `My StutterLab transformation over ${data.totalMonths} months:`,
      ``,
      `%SS Score: ${data.first.percentSS.toFixed(1)}% → ${data.latest.percentSS.toFixed(1)}% ${ssImproved ? "(↓ improved!)" : ""}`,
      `Fluency Score: ${data.first.fluencyScore} → ${data.latest.fluencyScore} ${fluencyImproved ? "(↑ improved!)" : ""}`,
      `Severity: ${data.first.severityRating} → ${data.latest.severityRating}`,
      ``,
      `${data.totalSessions} sessions completed. Evidence-based stuttering training.`,
      `stutterlab.com`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "StutterLab Progress", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
    } catch { /* cancelled */ }
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Dark shareable card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden">
        <CardContent className="relative py-6 px-6">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-[#00E676]/30 blur-3xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-blue-500/30 blur-3xl" />
          </div>

          {/* Header */}
          <div className="relative flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
              <AudioWaveform className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold">StutterLab</span>
            <span className="text-[9px] text-white/40 ml-auto">
              {data.totalMonths}-month transformation
            </span>
          </div>

          {/* Before / After comparison */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            {/* Before */}
            <div className="space-y-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Before</p>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold">{data.first.percentSS.toFixed(1)}%</p>
                <p className="text-[9px] text-white/50">%SS Score</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-lg font-bold">{data.first.fluencyScore}</p>
                <p className="text-[9px] text-white/50">Fluency Score</p>
              </div>
              <Badge className={`text-[9px] ${getSeverityColor(data.first.severityRating)} bg-white/5`}>
                {data.first.severityRating.charAt(0).toUpperCase() + data.first.severityRating.slice(1)}
              </Badge>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="h-5 w-5 text-[#00E676]" />
              <span className="text-[9px] text-[#00E676]">
                {data.totalMonths}mo
              </span>
            </div>

            {/* After */}
            <div className="space-y-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">After</p>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5">
                  <p className="text-2xl font-bold">{data.latest.percentSS.toFixed(1)}%</p>
                  {ssImproved && <TrendingDown className="h-4 w-4 text-[#00E676]" />}
                </div>
                <p className="text-[9px] text-white/50">%SS Score</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-bold">{data.latest.fluencyScore}</p>
                  {fluencyImproved && <TrendingUp className="h-4 w-4 text-[#00E676]" />}
                </div>
                <p className="text-[9px] text-white/50">Fluency Score</p>
              </div>
              <Badge className={`text-[9px] ${getSeverityColor(data.latest.severityRating)} bg-white/5`}>
                {data.latest.severityRating.charAt(0).toUpperCase() + data.latest.severityRating.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="relative mt-4 pt-3 border-t border-white/10 text-center">
            {ssImproved && (
              <p className="text-xs">
                <Sparkles className="h-3 w-3 inline text-[#00E676] mr-1" />
                <span className="text-[#00E676] font-bold">{ssChange.toFixed(1)}% improvement</span>
                <span className="text-white/50"> in stuttered syllables</span>
              </p>
            )}
            <p className="text-[10px] text-white/40 mt-1">
              {data.totalSessions} sessions — stutterlab.com
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share buttons */}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleShare}>
          {shared ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
          {shared ? "Shared!" : "Share Transformation"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const text = `%SS: ${data.first.percentSS.toFixed(1)}% → ${data.latest.percentSS.toFixed(1)}% | Fluency: ${data.first.fluencyScore} → ${data.latest.fluencyScore} | ${data.totalMonths} months on StutterLab | stutterlab.com`;
            await navigator.clipboard.writeText(text);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
          }}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Screenshot the card or tap Share. Your identity is never included.
      </p>
    </div>
  );
}

/** Compact prompt for progress page — shows if user has 2+ reports */
export function BeforeAfterPrompt() {
  const [data, setData] = useState<BeforeAfterData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getBeforeAfterData();
        if (result) setData(result);
      } catch {
        // Not logged in or no reports — hide prompt
      }
    }
    load();
  }, []);

  if (!data) return null;

  const improvement = data.first.percentSS - data.latest.percentSS;

  return (
    <Card className="border-[#00E676]/20 bg-[#00E676]/5">
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-[#00E676] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Your transformation is shareable</p>
            <p className="text-[10px] text-muted-foreground">
              {data.first.percentSS.toFixed(1)}% → {data.latest.percentSS.toFixed(1)}% SS in {data.totalMonths} months
            </p>
          </div>
          {improvement > 0 && (
            <Badge variant="secondary" className="text-[9px] text-[#00E676]">
              {improvement.toFixed(1)}% better
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
