"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Crown } from "lucide-react";
import { exercises } from "@/lib/exercises/exercise-data";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-600",
  Intermediate: "bg-amber-500/10 text-amber-600",
  Advanced: "bg-red-500/10 text-red-600",
};

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "free" && !ex.isPremium) ||
      (filter === "premium" && ex.isPremium);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Exercises
        </h1>
        <p className="text-muted-foreground mt-1">
          Evidence-based speech techniques. Practice with recording and Audio Lab overlay.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "free", "premium"] as const).map((f) => (
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
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ex) => (
          <Link key={ex.id} href={`/exercises/${ex.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${ex.bg}`}>
                    <ex.icon className={`h-5 w-5 ${ex.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{ex.title}</h3>
                      {ex.isPremium && (
                        <Badge variant="outline" className="text-[10px]">
                          <Crown className="h-2.5 w-2.5 mr-0.5" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ex.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${difficultyColors[ex.difficulty]}`}
                      >
                        {ex.difficulty}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {ex.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No exercises match your search.</p>
        </div>
      )}
    </div>
  );
}
