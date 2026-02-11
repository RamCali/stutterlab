"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useRef, useCallback } from "react";
import type { VoiceState, TurnMetrics } from "@/lib/audio/VoiceConversation";
import { countDisfluencies, estimateSyllables } from "@/lib/audio/speech-metrics";
import { buildSessionConfig } from "@/lib/elevenlabs/build-session-config";

interface UseElevenLabsConversationOptions {
  scenario: string;
  stressLevel?: number;
  onStateChange: (state: VoiceState) => void;
  onUserTranscript: (text: string) => void;
  onAssistantMessage: (text: string) => void;
  onTurnComplete: (turn: TurnMetrics) => void;
  onError: (error: string) => void;
}

interface UseElevenLabsConversationReturn {
  start: () => Promise<boolean>;
  stop: () => TurnMetrics[];
  getAllTurns: () => TurnMetrics[];
  getHistory: () => { role: "user" | "assistant"; content: string }[];
  submitTurn: () => void;
  extendSilence: () => void;
  voiceState: VoiceState;
}

export function useElevenLabsConversation(
  options: UseElevenLabsConversationOptions
): UseElevenLabsConversationReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  const allTurnsRef = useRef<TurnMetrics[]>([]);
  const turnIndexRef = useRef(0);
  const conversationHistoryRef = useRef<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const userTurnStartRef = useRef(0);
  const currentUserTextRef = useRef("");
  const isRunningRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const updateVoiceState = useCallback(
    (state: VoiceState) => {
      setVoiceState(state);
      optionsRef.current.onStateChange(state);
    },
    []
  );

  const conversation = useConversation({
    onMessage: ({ message, role }) => {
      if (role === "user") {
        currentUserTextRef.current = message;
        optionsRef.current.onUserTranscript(message);

        // Record completed user turn
        const elapsed = (Date.now() - userTurnStartRef.current) / 60000;
        const syllables = estimateSyllables(message);
        const speakingRate =
          elapsed > 0.01 ? Math.round(syllables / elapsed) : 0;

        const userTurn: TurnMetrics = {
          turnIndex: turnIndexRef.current++,
          role: "user",
          text: message,
          disfluencyCount: countDisfluencies(message),
          speakingRate,
          timestamp: Date.now(),
          spmZone:
            speakingRate < 140
              ? "slow"
              : speakingRate > 200
                ? "fast"
                : "target",
        };

        allTurnsRef.current.push(userTurn);
        conversationHistoryRef.current.push({
          role: "user",
          content: message,
        });
        optionsRef.current.onTurnComplete(userTurn);
      } else {
        // Agent response
        optionsRef.current.onAssistantMessage(message);

        const assistantTurn: TurnMetrics = {
          turnIndex: turnIndexRef.current++,
          role: "assistant",
          text: message,
          disfluencyCount: 0,
          speakingRate: 0,
          timestamp: Date.now(),
        };

        allTurnsRef.current.push(assistantTurn);
        conversationHistoryRef.current.push({
          role: "assistant",
          content: message,
        });
      }
    },

    onModeChange: ({ mode }) => {
      if (!isRunningRef.current) return;

      if (mode === "listening") {
        userTurnStartRef.current = Date.now();
        currentUserTextRef.current = "";
        updateVoiceState("listening");
      } else if (mode === "speaking") {
        updateVoiceState("speaking");
      }
    },

    onStatusChange: ({ status }) => {
      if (status === "connected") {
        updateVoiceState("listening");
      } else if (status === "disconnected" || status === "disconnecting") {
        if (isRunningRef.current) {
          updateVoiceState("idle");
        }
      }
    },

    onError: (message) => {
      optionsRef.current.onError(message);
    },

    onConnect: () => {
      isRunningRef.current = true;
    },

    onDisconnect: () => {
      isRunningRef.current = false;
      updateVoiceState("idle");
    },
  });

  const start = useCallback(async (): Promise<boolean> => {
    try {
      // Reset state
      allTurnsRef.current = [];
      turnIndexRef.current = 0;
      conversationHistoryRef.current = [];
      currentUserTextRef.current = "";
      userTurnStartRef.current = Date.now();

      // Request mic access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from server
      const sessionRes = await fetch("/api/elevenlabs-session", {
        method: "POST",
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get voice session");
      }

      const { signedUrl } = await sessionRes.json();
      if (!signedUrl) {
        throw new Error("No signed URL received");
      }

      // Build dynamic variables from user profile + scenario
      const config = await buildSessionConfig(
        optionsRef.current.scenario,
        optionsRef.current.stressLevel
      );

      updateVoiceState("processing");

      // Start ElevenLabs conversation
      await conversation.startSession({
        signedUrl,
        dynamicVariables: config.dynamicVariables,
      });

      return true;
    } catch (error) {
      console.warn("ElevenLabs conversation failed:", error);
      updateVoiceState("idle");
      optionsRef.current.onError(
        error instanceof Error ? error.message : "Voice session failed"
      );
      return false;
    }
  }, [conversation, updateVoiceState]);

  const stop = useCallback((): TurnMetrics[] => {
    isRunningRef.current = false;
    conversation.endSession();
    updateVoiceState("idle");
    return [...allTurnsRef.current];
  }, [conversation, updateVoiceState]);

  const getAllTurns = useCallback((): TurnMetrics[] => {
    return [...allTurnsRef.current];
  }, []);

  const getHistory = useCallback((): {
    role: "user" | "assistant";
    content: string;
  }[] => {
    return [...conversationHistoryRef.current];
  }, []);

  const submitTurn = useCallback(() => {
    // For push-to-talk: muting the mic signals to ElevenLabs that the user is done
    conversation.sendUserActivity();
  }, [conversation]);

  const extendSilence = useCallback(() => {
    // Prevents the agent from speaking for ~2 seconds
    conversation.sendUserActivity();
  }, [conversation]);

  return {
    start,
    stop,
    getAllTurns,
    getHistory,
    submitTurn,
    extendSilence,
    voiceState,
  };
}
