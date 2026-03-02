"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, Quote } from "lucide-react";
import { SUCCESS_STORIES, type SuccessStory } from "@/lib/content/success-stories";

function StoryCard({ story, defaultExpanded = false }: { story: SuccessStory; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold">{story.title}</p>
              <Badge variant="secondary" className="text-sm bg-amber-500/10 text-amber-600">
                Real Story
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{expanded ? story.quote : story.keyTakeaway}&rdquo;
            </p>
            {expanded && (
              <p className="text-sm text-muted-foreground mt-3">
                &mdash; {story.name} &middot; {story.source}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-sm mt-2 px-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Read full story <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** In-app version for the Community page */
export function SuccessStoriesSection() {
  if (SUCCESS_STORIES.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Real Stories</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Real people who stutter, sharing real wins.
      </p>
      {SUCCESS_STORIES.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}

/** Landing page version — more visual, standalone section */
export function SuccessStoriesLanding() {
  if (SUCCESS_STORIES.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-amber-500/10 text-amber-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Real Stories
          </Badge>
          <h2 className="text-3xl font-bold mb-3">
            From the Stuttering Community
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real stories from people who stutter — proving that your voice is not your limitation.
          </p>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {SUCCESS_STORIES.map((story) => (
            <StoryCard key={story.id} story={story} defaultExpanded />
          ))}
        </div>
      </div>
    </section>
  );
}
