"use client";

interface SpeedGaugeProps {
  currentSPM: number;
  target: { min: number; max: number };
  zone: "slow" | "target" | "fast";
}

export function SpeedGauge({ currentSPM, target, zone }: SpeedGaugeProps) {
  // Map SPM to a 0-100 position on the bar
  // Range: 0 SPM → 0, target.min → 25, target.max → 75, 2x target.max → 100
  const rangeMax = target.max * 1.5;
  const position = Math.min(100, Math.max(0, (currentSPM / rangeMax) * 100));
  const targetMinPos = (target.min / rangeMax) * 100;
  const targetMaxPos = (target.max / rangeMax) * 100;

  const zoneColors = {
    slow: "text-blue-400",
    target: "text-emerald-400",
    fast: "text-red-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Speed
        </span>
        <span className={`text-xs font-mono font-semibold ${zoneColors[zone]}`}>
          {currentSPM > 0 ? `${currentSPM} syl/min` : "—"}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        {/* Target zone highlight */}
        <div
          className="absolute h-full bg-emerald-500/30"
          style={{
            left: `${targetMinPos}%`,
            width: `${targetMaxPos - targetMinPos}%`,
          }}
        />
        {/* Slow zone */}
        <div
          className="absolute h-full bg-blue-500/20"
          style={{ left: 0, width: `${targetMinPos}%` }}
        />
        {/* Fast zone */}
        <div
          className="absolute h-full bg-red-500/20"
          style={{
            left: `${targetMaxPos}%`,
            width: `${100 - targetMaxPos}%`,
          }}
        />
        {/* Current position marker */}
        {currentSPM > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background shadow-sm transition-all duration-300"
            style={{
              left: `${position}%`,
              backgroundColor:
                zone === "target"
                  ? "#00E676"
                  : zone === "slow"
                  ? "#64B5F6"
                  : "#FF5252",
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[8px] text-muted-foreground">{target.min}</span>
        <span className="text-[8px] text-muted-foreground">{target.max}</span>
      </div>
    </div>
  );
}
