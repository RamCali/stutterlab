"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PartyPopper,
  Phone,
  Users,
  ShoppingCart,
  Presentation,
  MessageCircle,
  X,
  HandHeart,
} from "lucide-react";

interface VictoryNotification {
  id: string;
  victoryType: string;
  anonymousName: string;
  createdAt: string;
}

const VICTORY_ICONS: Record<string, typeof Phone> = {
  phone_call: Phone,
  meeting: Users,
  order: ShoppingCart,
  presentation: Presentation,
  conversation: MessageCircle,
  asked_help: PartyPopper,
};

const VICTORY_LABELS: Record<string, string> = {
  phone_call: "made a phone call",
  meeting: "spoke in a meeting",
  order: "ordered at a counter",
  presentation: "gave a presentation",
  conversation: "started a conversation",
  asked_help: "asked for help",
};

/**
 * Victory notification toast that shows real community victories.
 * Fetches from the DB and cycles through recent wins.
 * Falls back to simulated notifications if no DB data.
 */
export function VictoryNotificationToast() {
  const [notification, setNotification] = useState<VictoryNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [victories, setVictories] = useState<VictoryNotification[]>([]);
  const [nextIndex, setNextIndex] = useState(0);

  useEffect(() => {
    async function fetchVictories() {
      try {
        const res = await fetch("/api/community/victories");
        if (res.ok) {
          const data = await res.json();
          if (data.victories?.length > 0) {
            setVictories(data.victories);
          }
        }
      } catch {
        // Will use fallback
      }
    }
    fetchVictories();
  }, []);

  const showNotification = useCallback(() => {
    let notif: VictoryNotification;

    if (victories.length > 0) {
      notif = victories[nextIndex % victories.length];
      setNextIndex((prev) => prev + 1);
    } else {
      const ANONYMOUS_NAMES = [
        "Blue Phoenix", "Silver Fox", "Calm River", "Steady Oak",
        "Bright Star", "Gentle Wave", "Bold Eagle", "Warm Sun",
      ];
      const types = Object.keys(VICTORY_LABELS);
      notif = {
        id: `notif-${Date.now()}`,
        victoryType: types[Math.floor(Math.random() * types.length)],
        anonymousName: ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)],
        createdAt: new Date().toISOString(),
      };
    }

    setNotification(notif);
    setCelebrated(false);
    setVisible(true);

    setTimeout(() => setVisible(false), 6000);
  }, [victories, nextIndex]);

  useEffect(() => {
    const initialTimer = setTimeout(showNotification, 30000);
    const intervalTimer = setInterval(() => {
      const delay = 45000 + Math.random() * 45000;
      setTimeout(showNotification, delay);
    }, 90000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [showNotification]);

  if (!visible || !notification) return null;

  const Icon = VICTORY_ICONS[notification.victoryType] || PartyPopper;
  const label = VICTORY_LABELS[notification.victoryType] || "had a victory";

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="shadow-lg border-primary/20 bg-card">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#00E676]/10 flex-shrink-0">
              <Icon className="h-4 w-4 text-[#00E676]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs">
                <span className="font-medium">{notification.anonymousName}</span>{" "}
                <span className="text-muted-foreground">{label}</span>
              </p>
              <p className="text-[9px] text-muted-foreground">just now</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setCelebrated(true)}
                className={`p-1.5 rounded-full transition-colors ${
                  celebrated
                    ? "bg-pink-500/10 text-pink-500"
                    : "hover:bg-pink-500/10 text-muted-foreground hover:text-pink-500"
                }`}
              >
                <HandHeart className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setVisible(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Static feed of recent victory notifications — fetches from DB */
export function VictoryFeed() {
  const [victories, setVictories] = useState<VictoryNotification[]>([]);

  useEffect(() => {
    async function fetchVictories() {
      try {
        const res = await fetch("/api/community/victories");
        if (res.ok) {
          const data = await res.json();
          setVictories((data.victories || []).slice(0, 5));
        }
      } catch {
        // Show nothing
      }
    }
    fetchVictories();
  }, []);

  if (victories.length === 0) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <PartyPopper className="h-3.5 w-3.5 text-primary" />
          Live Victory Feed
        </p>
        <p className="text-[10px] text-muted-foreground">No victories yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold flex items-center gap-1.5">
        <PartyPopper className="h-3.5 w-3.5 text-primary" />
        Live Victory Feed
      </p>
      {victories.map((notif) => {
        const Icon = VICTORY_ICONS[notif.victoryType] || PartyPopper;
        const label = VICTORY_LABELS[notif.victoryType] || "had a victory";
        const minutesAgo = Math.max(1, Math.round((Date.now() - new Date(notif.createdAt).getTime()) / 60000));

        return (
          <div key={notif.id} className="flex items-center gap-2 py-1">
            <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">{notif.anonymousName}</span>{" "}
              {label}
            </p>
            <span className="text-[9px] text-muted-foreground/60 ml-auto">
              {minutesAgo}m
            </span>
          </div>
        );
      })}
    </div>
  );
}
