"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { TechniqueStep } from "@/components/practice/technique-step";
import { getTodaysTechnique } from "@/lib/practice/daily-session";
import {
  getFearedWordsStore,
  getTrainingItems,
  getCurrentTrainingLevel,
  recordPractice,
  type FearedWordEntry,
  type TrainingLevel,
} from "@/lib/feared-words/store";

const LEVEL_NAMES: Record<TrainingLevel, string> = {
  words: "Word Level",
  phrases: "Phrase Level",
  sentences: "Sentence Level",
  paragraphs: "Story Level",
};

export default function FearedWordPracticePage() {
  const params = useParams();
  const router = useRouter();
  const wordId = params.wordId as string;

  const [wordEntry, setWordEntry] = useState<FearedWordEntry | null>(null);
  const [currentLevel, setCurrentLevel] = useState<TrainingLevel>("words");
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const store = getFearedWordsStore();
    const entry = store?.words.find((w) => w.id === wordId);
    if (entry) {
      setWordEntry(entry);
      const level = getCurrentTrainingLevel(entry);
      setCurrentLevel(level);
      setItems(getTrainingItems(wordId, level));
    }
  }, [wordId]);

  const technique = getTodaysTechnique(1);

  function handleComplete() {
    if (wordEntry) {
      recordPractice(wordId, currentLevel);
    }
    router.push("/feared-words");
  }

  if (!wordEntry) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Word not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/feared-words")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize">
              {wordEntry.word}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {LEVEL_NAMES[currentLevel]}
            </Badge>
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Practice Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <TechniqueStep
          technique={technique}
          contentLevel={currentLevel}
          items={items}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
