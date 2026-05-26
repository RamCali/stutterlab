"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
} from "@/lib/actions/notifications";

export function NotificationPrefsSettings() {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    newExercises: false,
    smartReminders: true,
    reminderHour: 9,
    reminderMinute: 0,
    phoneE164: "",
    smsEnabled: false,
  });

  useEffect(() => {
    getNotificationPrefs()
      .then((p) => {
        setPrefs({
          dailyReminders: p.dailyReminders,
          weeklyProgress: p.weeklyProgress,
          newExercises: p.newExercises,
          smartReminders: p.smartReminders,
          reminderHour: p.reminderHour,
          reminderMinute: p.reminderMinute,
          phoneE164: p.phoneE164 ?? "",
          smsEnabled: p.smsEnabled,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function patch(updates: Partial<typeof prefs>) {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    await updateNotificationPrefs({
      dailyReminders: next.dailyReminders,
      weeklyProgress: next.weeklyProgress,
      newExercises: next.newExercises,
      smartReminders: next.smartReminders,
      reminderHour: next.reminderHour,
      reminderMinute: next.reminderMinute,
      phoneE164: next.phoneE164 || null,
      smsEnabled: next.smsEnabled,
    });
  }

  if (loading) return null;

  const items = [
    {
      key: "dailyReminders" as const,
      label: "Daily practice reminders",
      description: "Email/SMS when enabled (UTC hour below)",
    },
    {
      key: "weeklyProgress" as const,
      label: "Weekly progress summary",
      description: "Weekly email summary",
    },
    {
      key: "newExercises" as const,
      label: "New exercise alerts",
      description: "When new content is added",
    },
    {
      key: "smartReminders" as const,
      label: "Smart reminders",
      description: "Nudges when you skip real-world reps or have an event soon",
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
          <Switch
            checked={prefs[item.key]}
            onCheckedChange={(checked) => patch({ [item.key]: checked })}
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <Label className="text-xs">Reminder hour (UTC)</Label>
          <Input
            type="number"
            min={0}
            max={23}
            value={prefs.reminderHour}
            onChange={(e) => patch({ reminderHour: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Minute</Label>
          <Input
            type="number"
            min={0}
            max={59}
            value={prefs.reminderMinute}
            onChange={(e) => patch({ reminderMinute: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 pt-2 border-t">
        <div>
          <p className="text-sm font-medium">SMS reminders</p>
          <p className="text-xs text-muted-foreground">Uses your MVP SMS number (E.164)</p>
        </div>
        <Switch
          checked={prefs.smsEnabled}
          onCheckedChange={(checked) => patch({ smsEnabled: checked })}
        />
      </div>
      {prefs.smsEnabled && (
        <Input
          placeholder="+15551234567"
          value={prefs.phoneE164}
          onChange={(e) => patch({ phoneE164: e.target.value })}
          onBlur={() => patch({})}
        />
      )}
    </div>
  );
}
