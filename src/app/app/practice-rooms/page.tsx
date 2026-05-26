"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Video } from "lucide-react";
import {
  listUpcomingPracticeRooms,
  createPracticeRoom,
  joinPracticeRoom,
  getPracticeRoomParticipants,
} from "@/lib/actions/practice-rooms";

type Room = Awaited<ReturnType<typeof listUpcomingPracticeRooms>>[number];

export default function PracticeRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [participants, setParticipants] = useState<
    { anonymousName: string; joinedAt: Date }[]
  >([]);

  async function load() {
    setRooms(await listUpcomingPracticeRooms());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;
    await createPracticeRoom({ title: title.trim(), scheduledAt });
    setTitle("");
    setScheduledAt("");
    await load();
  }

  async function handleJoin(roomId: string) {
    await joinPracticeRoom(roomId);
    await load();
  }

  async function showParticipants(roomId: string) {
    setExpanded(roomId);
    setParticipants(await getPracticeRoomParticipants(roomId));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Group practice rooms
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          15-minute peer practice slots. Ground rules: voluntary stutter welcome, no unsolicited advice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Host a room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Evening open practice"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Starts at</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit">Create room</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium">{room.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(room.scheduledAt).toLocaleString()} · {room.durationMinutes} min
                  </p>
                </div>
                <span className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {room.participantCount}/{room.maxParticipants}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleJoin(room.id)}>
                  Join
                </Button>
                <Button size="sm" variant="outline" onClick={() => showParticipants(room.id)}>
                  Who&apos;s in
                </Button>
              </div>
              {expanded === room.id && participants.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  {participants.map((p) => (
                    <li key={p.anonymousName + p.joinedAt.toString()}>
                      {p.anonymousName}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-amber-600/90">
                Voice/video link sharing coming soon — for now, coordinate in Community after joining.
              </p>
            </CardContent>
          </Card>
        ))}
        {rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No upcoming rooms. Create one above.</p>
        )}
      </div>
    </div>
  );
}
