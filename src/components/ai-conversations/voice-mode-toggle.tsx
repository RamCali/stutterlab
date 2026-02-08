"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MessageSquare, Crown } from "lucide-react";

interface VoiceModeToggleProps {
  isVoiceMode: boolean;
  onToggle: (voiceMode: boolean) => void;
  isPremium: boolean;
  disabled?: boolean;
}

export function VoiceModeToggle({
  isVoiceMode,
  onToggle,
  isPremium,
  disabled,
}: VoiceModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
      <Button
        variant={!isVoiceMode ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle(false)}
        disabled={disabled}
        className="h-7 px-3 text-xs"
      >
        <MessageSquare className="h-3.5 w-3.5 mr-1" />
        Text
      </Button>
      <Button
        variant={isVoiceMode ? "default" : "ghost"}
        size="sm"
        onClick={() => {
          if (!isPremium) return;
          onToggle(true);
        }}
        disabled={disabled || !isPremium}
        className="h-7 px-3 text-xs relative"
      >
        <Mic className="h-3.5 w-3.5 mr-1" />
        Voice
        {!isPremium && (
          <Badge
            variant="outline"
            className="absolute -top-2 -right-2 text-[8px] px-1 py-0 h-auto"
          >
            <Crown className="h-2 w-2 mr-0.5" />
            PRO
          </Badge>
        )}
      </Button>
    </div>
  );
}
