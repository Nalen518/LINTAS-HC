import { PageHeader } from "@/components/ui/page-header";

// Figma: "Help" frame (100:1551). PRD §5.14 — glossary (CEISA, PIB, PPJK,
// Permendag, HS code… source: docs/GLOSSARY.md) + FAQ. FAQ depth is #2 on
// the R14 cut list (PRD §11).
// TODO(step 6): build to Figma spec.
export default function HelpPage() {
  return <PageHeader title="Help" />;
}
