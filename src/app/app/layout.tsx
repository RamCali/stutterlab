"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Flame,
  Moon,
  Sun,
} from "lucide-react";
import { PanicButton } from "@/components/panic-button";
import { OfflineBundleProvider } from "@/components/offline/offline-bundle-provider";
import { ProgramProvider, useProgram } from "@/components/navigation/program-context";
import { ProgramSidebar } from "@/components/navigation/program-sidebar";
import { MobileWeekNav } from "@/components/navigation/mobile-week-nav";
import { SLPAuthorityBadge } from "@/components/slp-authority-badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getProgressData } from "@/lib/actions/progress";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
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
        <div className="px-5 py-4 border-b border-border/60">
          <Link href="/app/dashboard">
            <Image src="/logo/StutterLab_Logo.svg" alt="StutterLab" width={240} height={48} className="h-12 w-auto dark:hidden" />
            <Image src="/logo/StutterLab_Logo_white.svg" alt="StutterLab" width={240} height={48} className="h-12 w-auto hidden dark:block" />
          </Link>
          {firstName && (
            <p className="text-sm text-muted-foreground mt-1">Welcome, {firstName}</p>
          )}
        </div>

        {/* Streak indicator */}
        <div className="flex items-center gap-2 mx-3 mt-3 px-3 py-2.5 rounded-md bg-primary/5 dark:bg-primary/10">
          <Flame className="h-4 w-4 text-orange-500" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">{streak} day{streak !== 1 ? "s" : ""}</span>
            <span className="text-xs text-muted-foreground/60 leading-tight">3 of 5 days to keep</span>
          </div>
          <span className="ml-auto text-sm text-muted-foreground font-medium">
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
          <SignOutButton variant="sidebar" />
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-sm text-muted-foreground">Theme</span>
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
        <header className="flex md:hidden items-center justify-between border-b border-border/60 px-4 py-2.5 bg-card">
          <Link href="/app/dashboard" className="flex items-center">
            <Image src="/logo/StutterLab_Logo.svg" alt="StutterLab" width={160} height={32} className="h-8 w-auto dark:hidden" />
            <Image src="/logo/StutterLab_Logo_white.svg" alt="StutterLab" width={160} height={32} className="h-8 w-auto hidden dark:block" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/5 dark:bg-primary/10 rounded-full px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-semibold">{streak}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>

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
      <OfflineBundleProvider />
      <AppShell>{children}</AppShell>
    </ProgramProvider>
  );
}
