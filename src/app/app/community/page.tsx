"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  MessageSquare,
  Heart,
  Trophy,
  HelpCircle,
  BookOpen,
  Mic,
  Plus,
  ThumbsUp,
  Crown,
} from "lucide-react";
import { CommunityPulseFull } from "@/components/community/community-pulse";
import { IDidItWall } from "@/components/community/i-did-it-wall";
import { AccountabilityBuddy } from "@/components/community/accountability-buddy";
import { CommunityChallenges } from "@/components/community/community-challenge";
import { StreakShields } from "@/components/community/streak-shields";
import { DailyMicroChallenge } from "@/components/community/daily-micro-challenge";
import { VictoryFeed } from "@/components/community/victory-notifications";

const categories = [
  { id: "wins", label: "Wins & Milestones", icon: Trophy, color: "text-yellow-500" },
  { id: "techniques", label: "Techniques", icon: BookOpen, color: "text-blue-500" },
  { id: "support", label: "Support", icon: Heart, color: "text-pink-500" },
  { id: "questions", label: "Q&A", icon: HelpCircle, color: "text-green-500" },
];

const samplePosts = [
  {
    id: "1",
    author: "SpeechWarrior",
    category: "wins",
    title: "Gave a presentation at work today!",
    content: "Used gentle onset and pausing throughout. Got compliments from my manager. This is huge for me.",
    upvotes: 24,
    comments: 8,
    time: "2h ago",
  },
  {
    id: "2",
    author: "FluentJourney",
    category: "techniques",
    title: "DAF at 50ms changed everything",
    content: "I've been using DAF at 70ms but tried 50ms and it feels so much more natural. Anyone else found their sweet spot?",
    upvotes: 15,
    comments: 12,
    time: "5h ago",
  },
  {
    id: "3",
    author: "NewToThis",
    category: "questions",
    title: "How long before you noticed improvement?",
    content: "I'm on day 8 of daily practice. Some days feel better than others. Is this normal?",
    upvotes: 31,
    comments: 19,
    time: "8h ago",
  },
  {
    id: "4",
    author: "CalmSpeaker",
    category: "support",
    title: "Bad day today - need encouragement",
    content: "Had a phone call that went terribly. Couldn't get a word out. Feeling discouraged.",
    upvotes: 42,
    comments: 27,
    time: "1d ago",
  },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  const filtered = selectedCategory
    ? samplePosts.filter((p) => p.category === selectedCategory)
    : samplePosts;

  function toggleUpvote(id: string) {
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with others on the same journey
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>

      {/* Weekly Community Pulse */}
      <CommunityPulseFull />

      {/* I Did It Celebration Wall */}
      <IDidItWall />

      {/* 30-Day Community Challenges */}
      <CommunityChallenges />

      {/* Daily Micro-Challenge */}
      <DailyMicroChallenge />

      {/* Accountability Buddy */}
      <AccountabilityBuddy />

      {/* Streak Shields */}
      <StreakShields />

      {/* Live Victory Feed */}
      <Card>
        <CardContent className="py-4">
          <VictoryFeed />
        </CardContent>
      </Card>

      {/* Practice Rooms */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Live Practice Rooms</p>
              <p className="text-xs text-muted-foreground">
                Join a live audio room to practice speaking with a partner.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            <cat.icon className={`h-3 w-3 mr-1 ${selectedCategory === cat.id ? "" : cat.color}`} />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.map((post) => {
          const cat = categories.find((c) => c.id === post.category);
          const isUpvoted = upvoted.has(post.id);

          return (
            <Card key={post.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium">{post.author}</span>
                  {cat && (
                    <Badge variant="secondary" className="text-[10px]">
                      {cat.label}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {post.time}
                  </span>
                </div>
                <h3 className="font-medium text-sm mb-1">{post.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{post.content}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${isUpvoted ? "text-primary" : ""}`}
                    onClick={() => toggleUpvote(post.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {post.upvotes + (isUpvoted ? 1 : 0)}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {post.comments}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
