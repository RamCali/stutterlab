"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AudioWaveform,
  Flame,
  LineChart,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { PanicButton } from "@/components/panic-button";
import { ProgramProvider, useProgram } from "@/components/navigation/program-context";
import { ProgramSidebar } from "@/components/navigation/program-sidebar";
import { MobileWeekNav } from "@/components/navigation/mobile-week-nav";
import { SLPAuthorityBadge } from "@/components/slp-authority-badge";
import { getProgressData } from "@/lib/actions/progress";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { currentDay, loading } = useProgram();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    getProgressData()
      .then((data) => {
        setStreak(data.stats.currentStreak);
        setXp(data.stats.totalXp);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <AudioWaveform className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">StutterLab</span>
        </div>

        {/* Streak indicator */}
        <div className="flex items-center gap-2 mx-3 mt-3 px-3 py-2.5 rounded-md bg-primary/5 dark:bg-primary/10">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold">{streak} day{streak !== 1 ? "s" : ""}</span>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {xp.toLocaleString()} XP
          </span>
        </div>

        {/* Program Navigation */}
        {loading ? (
          <div className="flex-1 px-3 py-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 rounded-md bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProgramSidebar currentDay={currentDay} />
        )}

        {/* Bottom pinned items */}
        <div className="border-t border-border/60 p-3 space-y-0.5">
          <Link
            href="/progress"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <LineChart className="h-4 w-4 flex-shrink-0" />
            Progress
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            Settings
          </Link>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className="px-3 pt-2">
            <SLPAuthorityBadge />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex md:hidden items-center justify-between border-b border-border/60 px-4 py-3 bg-card">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <AudioWaveform className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              StutterLab
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/5 dark:bg-primary/10 rounded-lg px-2 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-semibold">{streak}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Panic Button */}
        <PanicButton />

        {/* Mobile bottom navigation */}
        <div className="md:hidden">
          {loading ? (
            <div className="border-t border-border/60 bg-card p-3 pb-safe">
              <div className="h-12 rounded-md bg-muted/30 animate-pulse" />
            </div>
          ) : (
            <MobileWeekNav currentDay={currentDay} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <ProgramProvider>
      <AppShell>{children}</AppShell>
    </ProgramProvider>
  );
}
