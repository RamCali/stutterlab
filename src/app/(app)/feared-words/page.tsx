"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Plus,
  Trash2,
  Star,
  Volume2,
  Brain,
  Sparkles,
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";

type FearedWord = {
  id: string;
  word: string;
  phoneme: string;
  difficulty: "easy" | "medium" | "hard";
  practiceCount: number;
  mastered: boolean;
};

const sampleWords: FearedWord[] = [
  { id: "1", word: "specifically", phoneme: "/sp/", difficulty: "hard", practiceCount: 0, mastered: false },
  { id: "2", word: "situation", phoneme: "/s/", difficulty: "medium", practiceCount: 3, mastered: false },
  { id: "3", word: "presentation", phoneme: "/pr/", difficulty: "hard", practiceCount: 1, mastered: false },
  { id: "4", word: "telephone", phoneme: "/t/", difficulty: "medium", practiceCount: 5, mastered: false },
  { id: "5", word: "basically", phoneme: "/b/", difficulty: "easy", practiceCount: 8, mastered: true },
  { id: "6", word: "probably", phoneme: "/pr/", difficulty: "medium", practiceCount: 2, mastered: false },
];

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function FearedWordsPage() {
  const [words, setWords] = useState<FearedWord[]>(sampleWords);
  const [newWord, setNewWord] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "mastered">("all");

  function addWord() {
    if (!newWord.trim()) return;
    const word: FearedWord = {
      id: crypto.randomUUID(),
      word: newWord.trim().toLowerCase(),
      phoneme: "",
      difficulty: "medium",
      practiceCount: 0,
      mastered: false,
    };
    setWords((prev) => [...prev, word]);
    setNewWord("");
  }

  function removeWord(id: string) {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  function toggleMastered(id: string) {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w))
    );
  }

  function practiceWord(id: string) {
    setWords((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, practiceCount: w.practiceCount + 1 } : w
      )
    );
  }

  const filtered = words.filter((w) => {
    if (filter === "active") return !w.mastered;
    if (filter === "mastered") return w.mastered;
    return true;
  });

  const masteredCount = words.filter((w) => w.mastered).length;
  const totalPractice = words.reduce((sum, w) => sum + w.practiceCount, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Feared Words
        </h1>
        <p className="text-muted-foreground mt-1">
          Track, practice, and conquer the words that trigger your stuttering
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{words.length}</p>
                <p className="text-xs text-muted-foreground">Total Words</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masteredCount}</p>
                <p className="text-xs text-muted-foreground">Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPractice}</p>
                <p className="text-xs text-muted-foreground">Practices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion Banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-500/10 dark:from-violet-500/10 dark:to-violet-500/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-violet-500/10">
              <Brain className="h-5 w-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                AI Word Suggestion
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your speech patterns, the AI will suggest words you may
                find challenging. Practice these for maximum improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Word + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex gap-2">
          <Input
            placeholder="Add a feared word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
          />
          <Button onClick={addWord} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex gap-2">
          {(["all", "active", "mastered"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Word List */}
      <div className="space-y-2">
        {filtered.map((word) => (
          <Card
            key={word.id}
            className={`border-0 shadow-sm ${word.mastered ? "opacity-60" : ""}`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMastered(word.id)}
                  className="flex-shrink-0"
                >
                  {word.mastered ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${word.mastered ? "line-through text-muted-foreground" : ""}`}>
                      {word.word}
                    </p>
                    {word.phoneme && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {word.phoneme}
                      </span>
                    )}
                    <Badge variant="secondary" className={`text-[10px] ${difficultyColors[word.difficulty]}`}>
                      {word.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Practiced {word.practiceCount} times
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => practiceWord(word.id)} disabled={word.mastered}>
                    <Volume2 className="h-4 w-4 mr-1" />
                    Practice
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleMastered(word.id)}>
                    <Star className={`h-4 w-4 ${word.mastered ? "text-yellow-500 fill-yellow-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWord(word.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {filter === "mastered"
                  ? "No mastered words yet. Keep practicing!"
                  : "No feared words yet. Add words that trigger your stuttering."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Phoneme Drill */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Quick Phoneme Drill
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Practice challenging starting sounds with these common phonemes
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {["/b/", "/d/", "/g/", "/k/", "/p/", "/s/", "/st/", "/sp/", "/pr/", "/str/", "/th/", "/w/", "/f/", "/v/", "/ch/", "/sh/"].map(
              (phoneme) => (
                <Button key={phoneme} variant="outline" size="sm" className="font-mono text-xs">
                  {phoneme}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
