import type { RiskTone } from "@/components/ui/badge";
import type { DeclarationStatus } from "@/components/ui/declaration-row";

// Single source of declarations for the demo. The Dashboard home and History
// page both derive from this list (see lib/dashboard.ts), so their numbers,
// chart, recent list, and attention panel are always consistent. When the
// backend exposes a declarations endpoint, replace this array with a fetch —
// nothing else changes. (No dashboard/stats endpoint exists in API_CONTRACT
// yet; that's tracked as future backend work.)

export type Declaration = {
  id: string;
  importer: string;
  documentCount: number;
  /** ISO date; formatted day-first for display via formatDate() */
  date: string;
  risk: RiskTone;
  status: DeclarationStatus;
  /** Aggregate OCR field confidence for the declaration, 0–1. */
  confidence: number;
};

// Kept name for existing imports.
export type RecentDeclaration = Declaration;

// Dates span the week ending Sunday 5 Jul 2026 so the weekly chart varies.
export const DECLARATIONS: Declaration[] = [
  { id: "PIB-2026-0142", importer: "PT Sinar Jaya", documentCount: 3, date: "2026-07-05", risk: "high", status: "submitted", confidence: 0.94 },
  { id: "PIB-2026-0141", importer: "CV Mitra Abadi", documentCount: 3, date: "2026-07-05", risk: "low", status: "submitted", confidence: 0.97 },
  { id: "PIB-2026-0140", importer: "PT Global Trans", documentCount: 3, date: "2026-07-04", risk: "medium", status: "in review", confidence: 0.91 },
  { id: "PIB-2026-0139", importer: "PT Bahari Nusantara", documentCount: 3, date: "2026-07-03", risk: "low", status: "submitted", confidence: 0.95 },
  { id: "PIB-2026-0138", importer: "UD Sumber Rejeki", documentCount: 3, date: "2026-07-03", risk: "high", status: "in review", confidence: 0.88 },
  { id: "PIB-2026-0137", importer: "PT Karya Logam", documentCount: 3, date: "2026-07-02", risk: "medium", status: "submitted", confidence: 0.93 },
  { id: "PIB-2026-0136", importer: "CV Anugerah Baja", documentCount: 3, date: "2026-07-01", risk: "low", status: "submitted", confidence: 0.96 },
  { id: "PIB-2026-0135", importer: "PT Timur Sejahtera", documentCount: 3, date: "2026-06-30", risk: "low", status: "draft", confidence: 0.9 },
];

// History renders the full list; kept as an alias for the single source.
export const HISTORY_DECLARATIONS = DECLARATIONS;

export type AttentionItem = { id: string; importer: string; risk: RiskTone };
