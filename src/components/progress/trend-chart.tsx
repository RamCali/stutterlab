"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TrendDataPoint {
  month: string; // e.g., "Jan 2026"
  percentSS: number;
  fluencyScore: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  metric?: "percentSS" | "fluencyScore";
}

export function TrendChart({ data, metric = "percentSS" }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No data yet. Complete your first monthly assessment to see trends.
      </div>
    );
  }

  const isPercentSS = metric === "percentSS";

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            domain={isPercentSS ? [0, "auto"] : [0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) =>
              isPercentSS
                ? [`${Number(value).toFixed(1)}%`, "%SS"]
                : [value, "Fluency"]
            }
          />
          {/* Clinical threshold lines for %SS */}
          {isPercentSS && (
            <>
              <ReferenceLine
                y={3}
                stroke="#00E676"
                strokeDasharray="3 3"
                label={{ value: "Normal (<3%)", fontSize: 9, fill: "#00E676", position: "right" }}
              />
              <ReferenceLine
                y={8}
                stroke="#FF5252"
                strokeDasharray="3 3"
                label={{ value: "Severe (>8%)", fontSize: 9, fill: "#FF5252", position: "right" }}
              />
            </>
          )}
          <Line
            type="monotone"
            dataKey={metric}
            stroke="#48C6B3"
            strokeWidth={2}
            dot={{ fill: "#48C6B3", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
