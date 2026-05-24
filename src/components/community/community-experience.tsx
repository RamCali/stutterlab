"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  Flag,
  Heart,
  HelpCircle,
  MessageSquare,
  Mic,
  Plus,
  Send,
  Settings,
  ThumbsUp,
  Trophy,
  Users,
} from "lucide-react";
import { AccountabilityBuddy } from "@/components/community/accountability-buddy";
import { CommunityChallenges } from "@/components/community/community-challenge";
import { CommunityPulseFull } from "@/components/community/community-pulse";
import { DailyMicroChallenge } from "@/components/community/daily-micro-challenge";
import { IDidItWall } from "@/components/community/i-did-it-wall";
import { StreakShields } from "@/components/community/streak-shields";
import { SuccessStoriesSection } from "@/components/community/success-stories";
import { VictoryFeed } from "@/components/community/victory-notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CommunityPost = {
  id: string;
  author: string;
  category: string;
  title: string;
  content: string;
  upvotes: number;
  commentCount: number;
  createdAt: string;
  reacted?: boolean;
};

type CommunityComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type CommunityProfile = {
  alias: string;
  bio?: string | null;
  avatarColor: string;
  showRealName: boolean;
};

type PracticeRoom = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  capacity: number;
  participantCount: number;
  status: string;
  joined: boolean;
};

const categories = [
  { id: "wins", label: "Wins & Milestones", icon: Trophy, color: "text-yellow-500" },
  { id: "techniques", label: "Techniques", icon: BookOpen, color: "text-blue-500" },
  { id: "support", label: "Support", icon: Heart, color: "text-pink-500" },
  { id: "questions", label: "Q&A", icon: HelpCircle, color: "text-green-500" },
  { id: "resources", label: "Resources", icon: BookOpen, color: "text-indigo-500" },
];

const avatarColors: Record<string, string> = {
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatRoomTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function CommunityExperience() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [rooms, setRooms] = useState<PracticeRoom[]>([]);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [category, setCategory] = useState("wins");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");
  const [avatarColor, setAvatarColor] = useState("teal");

  const [roomTitle, setRoomTitle] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomTime, setRoomTime] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/community/posts").then((res) => (res.ok ? res.json() : { posts: [] })),
      fetch("/api/community/profile").then((res) => (res.ok ? res.json() : { profile: null })),
      fetch("/api/community/rooms").then((res) => (res.ok ? res.json() : { rooms: [] })),
    ])
      .then(([postData, profileData, roomData]) => {
        if (cancelled) return;
        setPosts(postData.posts || []);
        setRooms(roomData.rooms || []);
        if (profileData.profile) {
          setProfile(profileData.profile);
          setAlias(profileData.profile.alias || "");
          setBio(profileData.profile.bio || "");
          setAvatarColor(profileData.profile.avatarColor || "teal");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPosts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      selectedCategory
        ? posts.filter((post) => post.category === selectedCategory)
        : posts,
    [posts, selectedCategory]
  );

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPosting(true);
    setError(null);

    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, title, content }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Unable to publish your post.");
      setPosting(false);
      return;
    }

    const data = await res.json();
    setPosts((prev) => [data.post, ...prev]);
    setTitle("");
    setContent("");
    setCategory("wins");
    setPosting(false);
    setPostDialogOpen(false);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await fetch("/api/community/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias, bio, avatarColor, showRealName: false }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setProfileDialogOpen(false);
    }
  }

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const scheduledAt = new Date(roomTime).toISOString();
    const res = await fetch("/api/community/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: roomTitle,
        description: roomDescription,
        scheduledAt,
        durationMinutes: 30,
        capacity: 6,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRooms((prev) => [data.room, ...prev]);
      setRoomTitle("");
      setRoomDescription("");
      setRoomTime("");
      setRoomDialogOpen(false);
    }
  }

  async function toggleReaction(post: CommunityPost) {
    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id
          ? {
              ...item,
              reacted: !item.reacted,
              upvotes: item.upvotes + (item.reacted ? -1 : 1),
            }
          : item
      )
    );

    const res = await fetch(`/api/community/posts/${post.id}/reaction`, {
      method: "POST",
    });
    if (!res.ok) {
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id
            ? {
                ...item,
                reacted: post.reacted,
                upvotes: post.upvotes,
              }
            : item
        )
      );
    }
  }

  async function toggleComments(postId: string) {
    const next = new Set(openComments);
    if (next.has(postId)) {
      next.delete(postId);
      setOpenComments(next);
      return;
    }

    next.add(postId);
    setOpenComments(next);

    if (!comments[postId]) {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
      }
    }
  }

  async function addComment(postId: string) {
    const draft = commentDrafts[postId]?.trim();
    if (!draft) return;

    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    if (!res.ok) return;

    const data = await res.json();
    setComments((prev) => ({
      ...prev,
      [postId]: [data.comment, ...(prev[postId] || [])],
    }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  async function reportPost(postId: string) {
    await fetch("/api/community/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "post",
        targetId: postId,
        reason: "other",
        details: "Member reported this post from the community feed.",
      }),
    });
  }

  async function joinRoom(room: PracticeRoom) {
    if (room.id.startsWith("default-room")) return;
    const res = await fetch("/api/community/rooms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room.id }),
    });
    if (res.ok) {
      setRooms((prev) =>
        prev.map((item) =>
          item.id === room.id
            ? {
                ...item,
                joined: true,
                participantCount: Math.min(item.capacity, item.participantCount + 1),
              }
            : item
        )
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Community
          </h1>
          <p className="text-lg text-muted-foreground mt-1.5">
            Included with StutterLab Premium for accountability, wins, and support.
          </p>
        </div>
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createPost} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Share with the community</DialogTitle>
                <DialogDescription>
                  Posts use your member alias to keep the space supportive and low-pressure.
                </DialogDescription>
              </DialogHeader>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" maxLength={120} required />
              <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What happened? What helped? What do you need?" minLength={10} maxLength={1500} required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={posting}>{posting ? "Posting..." : "Post"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[profile?.avatarColor || "teal"]}`}>
              {(profile?.alias || "M").slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.alias || "Loading member profile..."}</p>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.bio || "Private alias, optional bio, and low-pressure participation."}
              </p>
            </div>
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={saveProfile} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Member profile</DialogTitle>
                    <DialogDescription>
                      Choose the alias other Premium members see in community spaces.
                    </DialogDescription>
                  </DialogHeader>
                  <Input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Community alias" required />
                  <Textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Optional short bio" maxLength={180} />
                  <Select value={avatarColor} onValueChange={setAvatarColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Avatar color" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(avatarColors).map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button type="submit">Save Profile</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <CommunityPulseFull />
      <IDidItWall />
      <SuccessStoriesSection />
      <CommunityChallenges />
      <DailyMicroChallenge />
      <AccountabilityBuddy />
      <StreakShields />

      <Card>
        <CardContent className="py-4">
          <VictoryFeed />
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-base font-medium">Live Practice Rooms</p>
              <p className="text-sm text-muted-foreground">
                Scheduled small-group audio practice for Premium members.
              </p>
            </div>
            <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  Host
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={createRoom} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Schedule a practice room</DialogTitle>
                    <DialogDescription>
                      Rooms are small, opt-in, and not recorded by default.
                    </DialogDescription>
                  </DialogHeader>
                  <Input value={roomTitle} onChange={(event) => setRoomTitle(event.target.value)} placeholder="Room title" required />
                  <Textarea value={roomDescription} onChange={(event) => setRoomDescription(event.target.value)} placeholder="What will members practice?" required />
                  <Input type="datetime-local" value={roomTime} onChange={(event) => setRoomTime(event.target.value)} required />
                  <DialogFooter>
                    <Button type="submit">Schedule Room</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {rooms.slice(0, 3).map((room) => (
              <div key={room.id} className="rounded-md border bg-background/70 px-3 py-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{room.title}</p>
                    <p className="text-xs text-muted-foreground">{formatRoomTime(room.scheduledAt)} · {room.durationMinutes} min</p>
                    <p className="text-xs text-muted-foreground mt-1">{room.description}</p>
                  </div>
                  <Button size="sm" variant={room.joined ? "secondary" : "outline"} onClick={() => joinRoom(room)} disabled={room.joined || room.id.startsWith("default-room")}>
                    {room.joined ? "Joined" : room.id.startsWith("default-room") ? "Soon" : "Join"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {room.participantCount}/{room.capacity} members
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button variant={selectedCategory === null ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory(null)}>
          All
        </Button>
        {categories.map((cat) => (
          <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory(cat.id)}>
            <cat.icon className={`h-3 w-3 mr-1 ${selectedCategory === cat.id ? "" : cat.color}`} />
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {loadingPosts && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Loading member posts...
            </CardContent>
          </Card>
        )}

        {!loadingPosts && filtered.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No posts here yet. Start the first thread for this category.
            </CardContent>
          </Card>
        )}

        {filtered.map((post) => {
          const cat = categories.find((item) => item.id === post.category);
          const postComments = comments[post.id] || [];
          const commentsOpen = openComments.has(post.id);

          return (
            <Card key={post.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium">{post.author}</span>
                  {cat && <Badge variant="secondary" className="text-xs">{cat.label}</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(post.createdAt)}</span>
                </div>
                <h3 className="font-medium text-base mb-1">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">{post.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" className={`text-xs ${post.reacted ? "text-primary" : ""}`} onClick={() => toggleReaction(post)}>
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {post.upvotes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleComments(post.id)}>
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {post.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => reportPost(post.id)}>
                    <Flag className="h-3 w-3 mr-1" />
                    Report
                  </Button>
                </div>
                {commentsOpen && (
                  <div className="mt-3 border-t pt-3 space-y-3">
                    <div className="flex gap-2">
                      <Input value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))} placeholder="Add supportive comment" />
                      <Button size="icon" onClick={() => addComment(post.id)} aria-label="Post comment">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {postComments.map((comment) => (
                      <div key={comment.id} className="rounded-md bg-muted/40 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
