import type { RiskTone } from "@/components/ui/badge";
import type { DeclarationStatus } from "@/components/ui/declaration-row";

// Display mock data for the dashboard home. There is no dashboard aggregate
// endpoint in docs/API_CONTRACT.md, so these are illustrative values for the
// demo UI — matched to the Figma "Dashboard — Home" frame (100:1027).
// Swap for real data once a stats endpoint exists (would need an ADR + contract entry).

export const DASHBOARD_STATS = {
  declarationsThisMonth: 128,
  pendingReview: 18,
  flaggedHighRisk: 6,
  avgFieldConfidence: 94,
};

export type RecentDeclaration = {
  id: string;
  importer: string;
  documentCount: number;
  /** ISO date; formatted day-first for display via formatDate() */
  date: string;
  risk: RiskTone;
  status: DeclarationStatus;
};

export const RECENT_DECLARATIONS: RecentDeclaration[] = [
  { id: "PIB-2026-0142", importer: "PT Sinar Jaya", documentCount: 3, date: "2026-07-05", risk: "high", status: "submitted" },
  { id: "PIB-2026-0141", importer: "CV Mitra Abadi", documentCount: 3, date: "2026-07-05", risk: "low", status: "submitted" },
  { id: "PIB-2026-0140", importer: "PT Global Trans", documentCount: 3, date: "2026-07-04", risk: "medium", status: "in review" },
  { id: "PIB-2026-0139", importer: "PT Bahari Nusantara", documentCount: 3, date: "2026-07-04", risk: "low", status: "submitted" },
  { id: "PIB-2026-0138", importer: "UD Sumber Rejeki", documentCount: 3, date: "2026-07-03", risk: "high", status: "in review" },
];

export const WEEKLY_COUNTS: { day: string; count: number }[] = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 6 },
  { day: "Thu", count: 15 },
  { day: "Fri", count: 10 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 2 },
];

export type AttentionItem = { id: string; importer: string; risk: RiskTone };

export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: "PIB-2026-0142", importer: "PT Sinar Jaya", risk: "high" },
  { id: "PIB-2026-0138", importer: "UD Sumber Rejeki", risk: "high" },
  { id: "PIB-2026-0140", importer: "PT Global Trans", risk: "medium" },
];
