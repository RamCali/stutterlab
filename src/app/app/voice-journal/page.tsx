"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Calendar,
  TrendingUp,
  Mic,
  Crown,
} from "lucide-react";

const emotionColors: Record<string, string> = {
  confident: "bg-emerald-500/10 text-emerald-600",
  proud: "bg-blue-500/10 text-blue-600",
  hopeful: "bg-sky-500/10 text-sky-600",
  neutral: "bg-gray-500/10 text-gray-600",
  anxious: "bg-amber-500/10 text-amber-600",
  frustrated: "bg-red-500/10 text-red-600",
  discouraged: "bg-purple-500/10 text-purple-600",
};

const sampleEntries = [
  {
    id: "1",
    date: "Today",
    emotion: "hopeful",
    note: "Practiced phone call scenario. Felt more confident than last week.",
    duration: "1:24",
  },
  {
    id: "2",
    date: "Yesterday",
    emotion: "anxious",
    note: "Had a tough day at work. Meeting was stressful but I used my techniques.",
    duration: "2:10",
  },
  {
    id: "3",
    date: "Feb 4",
    emotion: "proud",
    note: "Ordered coffee without any blocks! Small win but it felt amazing.",
    duration: "0:58",
  },
];

export default function VoiceJournalPage() {
  const [entries] = useState(sampleEntries);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Voice Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Record daily voice entries and track your fluency over time
          </p>
        </div>
        <Link href="/voice-journal/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Mic className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{entries.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">2</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">--</p>
            <p className="text-[10px] text-muted-foreground">Avg Fluency</p>
          </CardContent>
        </Card>
      </div>

      {/* AI analysis upsell */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Fluency Analysis</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro for AI-powered fluency scoring on every journal entry.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${emotionColors[entry.emotion]}`}
                  >
                    {entry.emotion}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {entry.duration}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-muted-foreground">{entry.note}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Mic className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No journal entries yet</p>
          <p className="text-sm mt-1">
            Record your first voice journal entry to start tracking your fluency.
          </p>
        </div>
      )}
    </div>
  );
}
