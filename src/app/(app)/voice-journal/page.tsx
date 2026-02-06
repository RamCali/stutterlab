"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Calendar, TrendingUp } from "lucide-react";

export default function VoiceJournalPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Voice Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Record daily voice entries to track your fluency over time
          </p>
        </div>
        <Button asChild>
          <Link href="/voice-journal/new">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Avg Fluency Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Journal Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Record your first voice journal entry</p>
              <p className="text-xs mt-1">Your entries will appear on the calendar with fluency color-coding</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fluency Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fluency Trend from Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <p className="text-sm">Record at least 3 entries to see your trend</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty state for entries */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg">No journal entries yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Voice journaling helps you track your fluency over time. Each entry
              is automatically analyzed for disfluency patterns and emotional state.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/voice-journal/new">
                <Plus className="h-4 w-4 mr-2" />
                Record Your First Entry
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
