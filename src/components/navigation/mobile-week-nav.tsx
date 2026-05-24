"use client";

import Link from "next/link";
import { Brain, Home, LineChart, MicVocal, Play, Settings } from "lucide-react";

interface MobileWeekNavProps {
  currentDay: number;
}

export function MobileWeekNav(_props: MobileWeekNavProps) {
  void _props;

  return (
    <div className="border-t border-border/60 bg-card pb-safe">
      <div className="flex justify-around px-3 py-2">
        <Link
          href="/app/dashboard"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/app/practice"
          className="flex flex-col items-center gap-0.5 text-primary"
        >
          <Play className="h-5 w-5 stroke-[2.5]" />
          <span className="text-xs font-medium">Today</span>
        </Link>
        <Link
          href="/app/progress"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <LineChart className="h-5 w-5" />
          <span className="text-xs font-medium">Progress</span>
        </Link>
        <Link
          href="/app/ai-practice"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs font-medium">AI</span>
        </Link>
        <Link
          href="/app/feared-words"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <MicVocal className="h-5 w-5" />
          <span className="text-xs font-medium">Words</span>
        </Link>
        <Link
          href="/app/settings"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}
