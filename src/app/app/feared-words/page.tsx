"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Plus,
  X,
  CheckCircle2,
  RotateCcw,
  Play,
  Star,
  Crown,
  Loader2,
} from "lucide-react";
import {
  getFearedWordsStore,
  addFearedWord,
  removeFearedWord,
  toggleMastered,
  getCurrentTrainingLevel,
  cacheGeneratedContent,
  type FearedWordEntry,
  type FearedWordsStore,
  type TrainingLevel,
} from "@/lib/feared-words/store";

const diffColors = { easy: "text-green-500", medium: "text-amber-500", hard: "text-red-500" };

const LEVEL_LABELS: Record<TrainingLevel, string> = {
  words: "W",
  phrases: "P",
  sentences: "S",
  paragraphs: "St",
};

const LEVEL_ORDER: TrainingLevel[] = ["words", "phrases", "sentences", "paragraphs"];

export default function FearedWordsPage() {
  const router = useRouter();
  const [store, setStore] = useState<FearedWordsStore>({ words: [], generatedContent: {} });
  const [newWord, setNewWord] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "mastered">("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const refreshStore = useCallback(() => {
    const s = getFearedWordsStore();
    if (s) setStore(s);
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  async function generateContent(entry: FearedWordEntry) {
    setGeneratingId(entry.id);
    try {
      const res = await fetch("/api/feared-words/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: entry.word, difficulty: entry.difficulty }),
      });
      if (res.ok) {
        const data = await res.json();
        cacheGeneratedContent(entry.id, {
          wordId: entry.id,
          word: entry.word,
          ...data.content,
          generatedAt: new Date().toISOString(),
        });
        refreshStore();
      }
    } catch {
      // Content generation failed — fallback content will be used
    }
    setGeneratingId(null);
  }

  function handleAddWord() {
    if (!newWord.trim()) return;
    const entry = addFearedWord(newWord.trim());
    setNewWord("");
    refreshStore();
    generateContent(entry);
  }

  function handleRemove(id: string) {
    removeFearedWord(id);
    refreshStore();
  }

  function handleToggleMastered(id: string) {
    toggleMastered(id);
    refreshStore();
  }

  function handlePractice(wordId: string) {
    router.push(`/feared-words/practice/${wordId}`);
  }

  const words = store.words;
  const filtered = words.filter((w) => {
    if (filter === "active") return !w.mastered;
    if (filter === "mastered") return w.mastered;
    return true;
  });

  const stats = {
    total: words.length,
    mastered: words.filter((w) => w.mastered).length,
    practices: words.reduce((sum, w) => sum + w.practiceCount, 0),
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Feared Words
        </h1>
        <p className="text-muted-foreground mt-1">
          Track words you find difficult and practice them at word, phrase, sentence, and story level
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total Words</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Star className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.mastered}</p>
            <p className="text-[10px] text-muted-foreground">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <RotateCcw className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.practices}</p>
            <p className="text-[10px] text-muted-foreground">Practices</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Word */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a feared word..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
        />
        <Button onClick={handleAddWord} disabled={!newWord.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "active", "mastered"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Word List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {filter === "all"
              ? "No feared words yet. Add one above to start training."
              : `No ${filter} words.`}
          </p>
        )}
        {filtered.map((word) => {
          const currentLevel = getCurrentTrainingLevel(word);
          const hasContent = !!store.generatedContent[word.id];
          const isGenerating = generatingId === word.id;

          return (
            <Card key={word.id} className={word.mastered ? "opacity-60" : ""}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleMastered(word.id)}
                    >
                      {word.mastered ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </Button>
                    <div>
                      <p className={`font-medium text-sm ${word.mastered ? "line-through" : ""}`}>
                        {word.word}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] ${diffColors[word.difficulty]}`}>
                          {word.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {word.practiceCount}x practiced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePractice(word.id)}
                        disabled={word.mastered}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Practice
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(word.id)}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Level Progress */}
                {!word.mastered && (
                  <div className="flex items-center gap-1 mt-2 ml-11">
                    {LEVEL_ORDER.map((level, i) => {
                      const lp = word.levelProgress[level];
                      const isCurrent = level === currentLevel;
                      const isComplete = lp.completed;
                      return (
                        <div key={level} className="flex items-center">
                          <div
                            className={`text-[9px] font-medium w-5 h-5 rounded-full flex items-center justify-center ${
                              isComplete
                                ? "bg-emerald-500 text-white"
                                : isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {LEVEL_LABELS[level]}
                          </div>
                          {i < LEVEL_ORDER.length - 1 && (
                            <div
                              className={`w-3 h-0.5 ${
                                isComplete ? "bg-emerald-500" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                    {!hasContent && !isGenerating && (
                      <button
                        onClick={() => generateContent(word)}
                        className="text-[10px] text-primary ml-2 hover:underline"
                      >
                        Generate content
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Suggestion */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">AI Word Suggestions</p>
              <p className="text-xs text-muted-foreground">
                Get personalized feared word suggestions based on your speech patterns.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
