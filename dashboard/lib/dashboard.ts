import type { Declaration, AttentionItem } from "@/lib/mock-data";

// Derive every Dashboard-home figure from the declarations list, so the metric
// cards, recent table, weekly chart, and attention panel are always consistent
// with each other (and, once wired, with the real declarations produced by the
// upload → extract → validate flow). Swap the input array for a backend fetch
// and this all keeps working.

const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type DashboardStats = {
  declarationsThisMonth: number;
  pendingReview: number;
  flaggedHighRisk: number;
  /** Mean OCR confidence across declarations, as a percentage (0–100). */
  avgFieldConfidence: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recent: Declaration[];
  attention: AttentionItem[];
  weekly: { day: string; count: number }[];
};

function weekdayOf(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  // Build from components to avoid timezone shifting the day.
  return WEEKDAY_LABEL[new Date(year, month - 1, day).getDay()];
}

export function computeDashboardData(
  declarations: Declaration[],
): DashboardData {
  const pendingReview = declarations.filter(
    (d) => d.status === "in review" || d.status === "draft",
  ).length;
  const flaggedHighRisk = declarations.filter((d) => d.risk === "high").length;
  const avgFieldConfidence = declarations.length
    ? Math.round(
        (declarations.reduce((sum, d) => sum + d.confidence, 0) /
          declarations.length) *
          100,
      )
    : 0;

  const counts: Record<string, number> = {};
  for (const d of declarations) {
    const day = weekdayOf(d.date);
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return {
    stats: {
      declarationsThisMonth: declarations.length,
      pendingReview,
      flaggedHighRisk,
      avgFieldConfidence,
    },
    recent: declarations.slice(0, 5),
    attention: declarations
      .filter((d) => d.status === "in review" || d.risk === "high")
      .slice(0, 3)
      .map((d) => ({ id: d.id, importer: d.importer, risk: d.risk })),
    weekly: WEEK_ORDER.map((day) => ({ day, count: counts[day] ?? 0 })),
  };
}
