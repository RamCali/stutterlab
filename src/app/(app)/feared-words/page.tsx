"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronRight,
  Mic,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
  Volume2,
  X,
} from "lucide-react";

/* ─── Sample feared words data ─── */
const sampleFearedWords = [
  {
    id: 1,
    word: "specifically",
    phoneme: "/sp/",
    difficulty: "hard" as const,
    practiceCount: 0,
    lastPracticed: null,
    mastered: false,
  },
  {
    id: 2,
    word: "schedule",
    phoneme: "/sk/",
    difficulty: "hard" as const,
    practiceCount: 3,
    lastPracticed: "2 days ago",
    mastered: false,
  },
  {
    id: 3,
    word: "presentation",
    phoneme: "/pr/",
    difficulty: "medium" as const,
    practiceCount: 7,
    lastPracticed: "yesterday",
    mastered: false,
  },
  {
    id: 4,
    word: "telephone",
    phoneme: "/t/",
    difficulty: "medium" as const,
    practiceCount: 12,
    lastPracticed: "today",
    mastered: false,
  },
  {
    id: 5,
    word: "hello",
    phoneme: "/h/",
    difficulty: "easy" as const,
    practiceCount: 20,
    lastPracticed: "today",
    mastered: true,
  },
];

const commonTriggerPhonemes = [
  { phoneme: "/s/", words: ["specifically", "sometimes", "situation"] },
  { phoneme: "/p/", words: ["presentation", "probably", "people"] },
  { phoneme: "/t/", words: ["telephone", "together", "tomorrow"] },
  { phoneme: "/k/", words: ["communication", "completely", "coffee"] },
  { phoneme: "/b/", words: ["because", "before", "beautiful"] },
  { phoneme: "/m/", words: ["my name is", "meeting", "management"] },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "hard":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function FearedWordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newWord, setNewWord] = useState("");

  const filteredWords = sampleFearedWords.filter((w) =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Feared Words Trainer
          </h1>
          <p className="text-muted-foreground mt-1">
            Identify, practice, and conquer the words that challenge you most.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-0"
        >
          {sampleFearedWords.filter((w) => w.mastered).length}/
          {sampleFearedWords.length} mastered
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">
              {sampleFearedWords.length}
            </p>
            <p className="text-xs text-muted-foreground">Tracked Words</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">
              {sampleFearedWords.filter((w) => w.mastered).length}
            </p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {sampleFearedWords.reduce((sum, w) => sum + w.practiceCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Practices</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion Banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-500/5 to-primary/5 dark:from-violet-500/10 dark:to-primary/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                AI-Detected Trigger Pattern
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your recent sessions, words starting with{" "}
                <strong>/sp/</strong> and <strong>/pr/</strong> seem to be your
                biggest triggers. Try the targeted drills below.
              </p>
              <Button
                size="sm"
                className="mt-2"
                variant="outline"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Start /sp/ Drill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Word */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add a Feared Word</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='Type a word you struggle with (e.g., "specifically")'
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="flex-1"
            />
            <Button disabled={!newWord.trim()}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Feared Words List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Feared Words</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-40 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-muted/60 ${
                word.mastered ? "opacity-60" : ""
              }`}
            >
              {/* Mastery indicator */}
              <div className="flex-shrink-0">
                {word.mastered ? (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      word.difficulty === "hard"
                        ? "text-rose-500"
                        : word.difficulty === "medium"
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  />
                )}
              </div>

              {/* Word info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold text-sm ${
                      word.mastered ? "line-through" : ""
                    }`}
                  >
                    {word.word}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${getDifficultyColor(
                      word.difficulty
                    )}`}
                  >
                    {word.difficulty}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {word.phoneme}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {word.practiceCount} practices
                  {word.lastPracticed && ` - last ${word.lastPracticed}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Mic className="h-4 w-4" />
                </Button>
                {!word.mastered && (
                  <Button size="sm" className="h-8 px-3 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Practice
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredWords.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No feared words found.</p>
              <p className="text-xs mt-1">
                Add words above or let AI detect them from your sessions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Trigger Phonemes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Common Trigger Phonemes — Quick Drills
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Tap a phoneme group to start a targeted practice drill
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonTriggerPhonemes.map((group) => (
              <button
                key={group.phoneme}
                className="p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold text-primary">
                    {group.phoneme}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {group.words.join(", ")}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desensitization Techniques */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-warm-50 to-warm-100 dark:from-warm-500/10 dark:to-warm-600/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-warm-200 dark:bg-warm-500/15 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="h-5 w-5 text-warm-600 dark:text-warm-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                Desensitization Protocol
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                For each feared word, practice: (1) Say it silently, (2) Whisper
                it, (3) Say at normal volume with gentle onset, (4) Use it in a
                sentence, (5) Use it in conversation with AI. Repeat until
                anxiety drops.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-warm-600 hover:bg-warm-500 text-white"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Start Desensitization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
