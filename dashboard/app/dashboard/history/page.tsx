import { PageHeader } from "@/components/ui/page-header";

// Figma: "History" frame (100:1261); empty state "History — empty"
// (100:1768). PRD §5.12 FR-12.x — single scope, no role split (ADR-009).
// Table of all declarations (DeclarationRow), newest first; row click →
// /dashboard/history/[id]. Empty state: illustration-free card with
// "Start new declaration" CTA.
// TODO(step 6): build to Figma spec.
export default function HistoryPage() {
  return <PageHeader title="History" />;
}
