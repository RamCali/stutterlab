"use client";

import type { VoiceState } from "@/lib/audio/VoiceConversation";

interface VoiceOrbProps {
  state: VoiceState;
}

export function VoiceOrb({ state }: VoiceOrbProps) {
  const stateConfig = {
    idle: {
      color: "bg-muted",
      ringColor: "ring-muted/30",
      label: "Ready",
      animate: "",
    },
    listening: {
      color: "bg-[#48C6B3]",
      ringColor: "ring-[#48C6B3]/30",
      label: "Listening...",
      animate: "animate-pulse",
    },
    processing: {
      color: "bg-[#FFB347]",
      ringColor: "ring-[#FFB347]/30",
      label: "Thinking...",
      animate: "animate-spin",
    },
    speaking: {
      color: "bg-[#00E676]",
      ringColor: "ring-[#00E676]/30",
      label: "Speaking...",
      animate: "animate-pulse",
    },
  };

  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer rings */}
      <div className="relative">
        {/* Ripple ring 1 */}
        {state === "listening" && (
          <div
            className="absolute inset-0 rounded-full border-2 border-[#48C6B3]/30 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        )}
        {/* Ripple ring 2 */}
        {state === "listening" && (
          <div
            className="absolute -inset-4 rounded-full border border-[#48C6B3]/15 animate-ping"
            style={{ animationDuration: "3s" }}
          />
        )}

        {/* Spinning dots for processing */}
        {state === "processing" && (
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute w-2 h-2 bg-[#FFB347] rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${deg}deg) translate(72px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Main orb */}
        <div
          className={`relative w-32 h-32 rounded-full ring-8 ${config.ringColor} ${config.animate} flex items-center justify-center transition-colors duration-500`}
        >
          <div
            className={`w-28 h-28 rounded-full ${config.color} transition-colors duration-500 flex items-center justify-center`}
          >
            {/* Waveform bars for speaking state */}
            {state === "speaking" && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-white/80 rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.random() * 24}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.5s",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Mic icon for listening */}
            {state === "listening" && (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}

            {/* Brain icon for processing */}
            {state === "processing" && (
              <div className="w-8 h-8 border-3 border-white/50 border-t-white rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* State label */}
      <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
    </div>
  );
}
