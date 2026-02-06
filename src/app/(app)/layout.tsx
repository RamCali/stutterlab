"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  Flame,
  GraduationCap,
  Heart,
  Home,
  LineChart,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  NotebookPen,
  Settings,
  Stethoscope,
  Sun,
  Target,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/daily-plan", label: "Daily Plan", icon: Calendar },
  { href: "/audio-lab", label: "Audio Lab", icon: AudioWaveform },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/ai-practice", label: "AI Practice", icon: Brain },
  { href: "/feared-words", label: "Feared Words", icon: Target },
  { href: "/challenges", label: "Challenges", icon: MapPin },
  { href: "/voice-journal", label: "Voice Journal", icon: Mic },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/mindfulness", label: "Mindfulness", icon: Heart },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/community", label: "Community", icon: Users },
  { href: "/find-slp", label: "Find SLP", icon: Stethoscope },
  { href: "/techniques", label: "Techniques", icon: NotebookPen },
];

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Restore theme on mount
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
    <div className="flex h-screen bg-background">
      {/* ═══ Sidebar ═══ */}
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
          <span className="text-sm font-semibold">0 day streak</span>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            0 XP
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/60 p-3 space-y-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ═══ Mobile top bar ═══ */}
      <div className="flex flex-1 flex-col">
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
              <span className="text-xs font-semibold">0</span>
            </div>
            <ThemeToggle />
            <Link href="/settings">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* ═══ Mobile bottom navigation ═══ */}
        <nav className="md:hidden border-t border-border/60 bg-card pb-safe">
          <div className="flex justify-around py-1.5">
            {[
              { href: "/dashboard", icon: Home, label: "Home" },
              { href: "/audio-lab", icon: AudioWaveform, label: "Audio Lab" },
              { href: "/exercises", icon: BookOpen, label: "Practice" },
              { href: "/ai-practice", icon: MessageCircle, label: "AI" },
              { href: "/progress", icon: LineChart, label: "Progress" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
