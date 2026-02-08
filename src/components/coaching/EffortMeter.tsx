"use client";

interface EffortMeterProps {
  effort: number; // 0-1
  zone: "relaxed" | "moderate" | "tense";
}

export function EffortMeter({ effort, zone }: EffortMeterProps) {
  const percent = Math.round(effort * 100);

  const zoneConfig = {
    relaxed: { color: "#00E676", label: "Relaxed", textClass: "text-emerald-400" },
    moderate: { color: "#FFB347", label: "Moderate", textClass: "text-orange-400" },
    tense: { color: "#FF5252", label: "Tense", textClass: "text-red-400" },
  };

  const { color, label, textClass } = zoneConfig[zone];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Tension
        </span>
        <span className={`text-[10px] font-medium ${textClass}`}>{label}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
