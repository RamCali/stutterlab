"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Wind,
  Hand,
  Timer,
  Pause,
  RotateCcw,
  ArrowRight,
  Target,
  Phone,
  Search,
  Lock,
  Mic,
} from "lucide-react";

type ExerciseCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  exercises: Exercise[];
};

type Exercise = {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  isPremium: boolean;
  description: string;
};

const categories: ExerciseCategory[] = [
  {
    id: "reading",
    title: "Reading Aloud",
    description: "Practice fluency with graded reading passages",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    exercises: [
      { id: "r1", title: "Single Words", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Read individual words with focus on gentle onset" },
      { id: "r2", title: "Short Phrases", difficulty: "beginner", duration: "5 min", isPremium: false, description: "Practice 2-3 word phrases with smooth transitions" },
      { id: "r3", title: "Simple Sentences", difficulty: "beginner", duration: "5 min", isPremium: false, description: "Read complete sentences at a comfortable pace" },
      { id: "r4", title: "Paragraphs", difficulty: "intermediate", duration: "10 min", isPremium: true, description: "Read full paragraphs with pausing strategies" },
      { id: "r5", title: "News Articles", difficulty: "advanced", duration: "15 min", isPremium: true, description: "Read real news articles for real-world fluency practice" },
    ],
  },
  {
    id: "gentle_onset",
    title: "Gentle Onset",
    description: "Start words softly and smoothly",
    icon: Wind,
    color: "text-green-500",
    bg: "bg-green-500/10",
    exercises: [
      { id: "g1", title: "Vowel Starts", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Practice gentle onset on vowel-starting words" },
      { id: "g2", title: "Consonant Blends", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Gentle onset on challenging consonant combinations" },
      { id: "g3", title: "Conversation Starters", difficulty: "advanced", duration: "7 min", isPremium: true, description: "Practice gentle onset in common greetings and openers" },
    ],
  },
  {
    id: "breathing",
    title: "Breathing Exercises",
    description: "Diaphragmatic breathing for speech control",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    exercises: [
      { id: "b1", title: "4-7-8 Breathing", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Inhale 4s, hold 7s, exhale 8s - calms the nervous system" },
      { id: "b2", title: "Diaphragmatic Breathing", difficulty: "beginner", duration: "5 min", isPremium: false, description: "Deep belly breathing to support speech airflow" },
      { id: "b3", title: "Breath-Speech Coordination", difficulty: "intermediate", duration: "7 min", isPremium: true, description: "Coordinate breathing with speaking phrases" },
    ],
  },
  {
    id: "light_contact",
    title: "Light Articulatory Contact",
    description: "Reduce tension in speech muscles",
    icon: Hand,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    exercises: [
      { id: "l1", title: "Lip Sounds (B, P, M)", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Practice light contact on bilabial sounds" },
      { id: "l2", title: "Tongue Tip Sounds (T, D, N)", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Light contact on alveolar consonants" },
      { id: "l3", title: "Back Sounds (K, G)", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Light contact on velar consonants" },
    ],
  },
  {
    id: "pausing",
    title: "Pausing Strategies",
    description: "Strategic pauses for smoother speech",
    icon: Pause,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    exercises: [
      { id: "p1", title: "Phrase Pausing", difficulty: "beginner", duration: "5 min", isPremium: false, description: "Insert natural pauses between phrases" },
      { id: "p2", title: "Thought Group Pausing", difficulty: "intermediate", duration: "7 min", isPremium: true, description: "Group words by meaning with strategic pauses" },
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation",
    description: "Stop, pause, and restart with modification",
    icon: RotateCcw,
    color: "text-red-500",
    bg: "bg-red-500/10",
    exercises: [
      { id: "c1", title: "Word-Level Cancellation", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Practice stopping mid-stutter and restarting with modification" },
      { id: "c2", title: "Sentence Cancellation", difficulty: "advanced", duration: "7 min", isPremium: true, description: "Cancel and restart entire sentences with improved technique" },
    ],
  },
  {
    id: "pull_out",
    title: "Pull-Out",
    description: "Modify stuttering while it happens",
    icon: ArrowRight,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    exercises: [
      { id: "po1", title: "Prolongation Pull-Outs", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Ease out of prolonged sounds smoothly" },
      { id: "po2", title: "Block Pull-Outs", difficulty: "advanced", duration: "7 min", isPremium: true, description: "Release from blocks with controlled airflow" },
    ],
  },
  {
    id: "preparatory_set",
    title: "Preparatory Set",
    description: "Pre-plan articulatory positions",
    icon: Target,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    exercises: [
      { id: "ps1", title: "Feared Word Practice", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Plan and practice words you typically avoid" },
    ],
  },
  {
    id: "tongue_twister",
    title: "Tongue Twisters",
    description: "Fun articulation challenges",
    icon: Mic,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    exercises: [
      { id: "t1", title: "Easy Twisters", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Simple tongue twisters at slow speed" },
      { id: "t2", title: "Speed Challenge", difficulty: "advanced", duration: "5 min", isPremium: true, description: "Increase speed gradually on challenging phrases" },
    ],
  },
  {
    id: "phone_number",
    title: "Practical Fluency",
    description: "Everyday speaking tasks",
    icon: Phone,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    exercises: [
      { id: "pn1", title: "Phone Numbers", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Practice reading phone numbers fluently" },
      { id: "pn2", title: "Addresses", difficulty: "beginner", duration: "3 min", isPremium: false, description: "Read addresses with smooth transitions between numbers and words" },
      { id: "pn3", title: "Self Introduction", difficulty: "intermediate", duration: "5 min", isPremium: true, description: "Practice introducing yourself fluently" },
    ],
  },
];

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-600",
  intermediate: "bg-yellow-500/10 text-yellow-700",
  advanced: "bg-red-500/10 text-red-600",
};

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      exercises: cat.exercises.filter((ex) => {
        const matchesSearch =
          !searchQuery ||
          ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty =
          selectedDifficulty === "all" || ex.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
      }),
    }))
    .filter((cat) => cat.exercises.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Exercise Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Evidence-based speech exercises. Use with the Audio Lab for maximum benefit.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(level)}
            >
              {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise Categories */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded ${category.bg}`}>
                <category.icon className={`h-4 w-4 ${category.color}`} />
              </div>
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <span className="text-sm text-muted-foreground">
                {category.description}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{exercise.title}</h3>
                      {exercise.isPremium && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {exercise.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${difficultyColors[exercise.difficulty]}`}
                        >
                          {exercise.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Timer className="inline h-3 w-3 mr-0.5" />
                          {exercise.duration}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/exercises/${exercise.id}`}>Start</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
