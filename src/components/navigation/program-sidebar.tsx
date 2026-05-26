"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  Home,
  Library,
  MessageCircleWarning,
  Phone,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramSidebarProps {
  currentDay: number;
}

const MVP_LINKS = [
  { href: "/app/dashboard", label: "Home", icon: Home },
  { href: "/app/practice", label: "Daily Practice", icon: Phone },
  { href: "/app/techniques", label: "Techniques", icon: Library },
  { href: "/app/ai-practice", label: "AI Practice", icon: Brain },
  { href: "/app/feared-words", label: "Feared Words", icon: MessageCircleWarning },
  { href: "/app/speaking-calendar", label: "Speaking Calendar", icon: Calendar },
  { href: "/app/practice-rooms", label: "Practice Rooms", icon: Users },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function ProgramSidebar({ currentDay }: ProgramSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3">
      <div className="space-y-0.5">
        {MVP_LINKS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mx-3 mt-5 rounded-md border border-border/60 bg-muted/20 px-3 py-3">
        <p className="text-sm font-semibold">Daily practice</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentDay > 1
            ? `${currentDay} days of showing up. Today's rep is what counts.`
            : "One focused speaking rep today — build the habit."}
        </p>
      </div>
    </nav>
  );
}
