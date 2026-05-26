"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Calendar, Plus, Trash2 } from "lucide-react";
import {
  createSpeakingEvent,
  deleteSpeakingEvent,
  getUpcomingSpeakingEvents,
} from "@/lib/actions/speaking-calendar";
import {
  getActivePlanSteps,
  type EventMicroPlan,
  type SpeakingEventType,
} from "@/lib/speaking-calendar/micro-plan";

type EventRow = Awaited<ReturnType<typeof getUpcomingSpeakingEvents>>[number];

export default function SpeakingCalendarPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<SpeakingEventType>("interview");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const list = await getUpcomingSpeakingEvents();
    setEvents(list);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    try {
      await createSpeakingEvent({ title: title.trim(), eventType, eventDate });
      setTitle("");
      setEventDate("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteSpeakingEvent(id);
    await load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Speaking calendar
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add upcoming speaking events — we build a micro-plan for the days before.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job interview at Acme"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as SpeakingEventType)}
              >
                <option value="interview">Interview</option>
                <option value="presentation">Presentation</option>
                <option value="meeting">Meeting</option>
                <option value="phone">Phone call</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Date & time</Label>
              <Input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create micro-plan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
      ) : (
        events.map((ev) => {
          const plan = ev.microPlan as EventMicroPlan | null;
          const active = plan ? getActivePlanSteps(plan) : [];
          return (
            <Card key={ev.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{ev.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(ev.eventDate).toLocaleString()} · {ev.eventType}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => handleDelete(ev.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              {active.length > 0 && (
                <CardContent className="space-y-2">
                  <p className="text-xs font-medium text-primary">Active prep steps</p>
                  {active.map((step) => (
                    <div
                      key={`${step.dayOffset}-${step.title}`}
                      className="rounded-md border p-3 text-sm"
                    >
                      <p className="font-medium">{step.title}</p>
                      <p className="text-muted-foreground text-xs mt-1">{step.action}</p>
                      {step.href && (
                        <Button variant="link" size="sm" className="px-0 h-auto" asChild>
                          <Link href={step.href}>Start</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
