"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

// Figma: "Dashboard — Home" → Chart (100:1098). Emerald bar chart of the last
// 7 days' declaration counts (Recharts per TECH_STACK). Data is derived from
// the declarations list (see lib/dashboard.ts) and passed in.
//
// Recharts renders SVG `fill` as an attribute, where CSS var() does not
// resolve — so we read the design tokens at runtime and pass literal values.
// The initial values mirror --primary / --faint for the pre-hydration paint.
const FALLBACK = { bar: "#065f46", axis: "#9ca3af" };

export function WeeklyChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  const [colors, setColors] = useState(FALLBACK);

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    setColors({
      bar: root.getPropertyValue("--primary").trim() || FALLBACK.bar,
      axis: root.getPropertyValue("--faint").trim() || FALLBACK.axis,
    });
  }, []);

  return (
    <div className="flex h-[246px] flex-1 flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          Declarations this week
        </span>
        <span className="text-body-sm text-faint">Last 7 days</span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: colors.axis }}
              dy={4}
            />
            <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
