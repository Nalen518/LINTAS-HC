import { PageHeader } from "@/components/ui/page-header";

// Figma: "Settings" frame (100:1453). §5.13 trimmed by ADR-009 (no
// profile/roles) — app info + the impact-estimate assumptions from ADR-016:
// manual-baseline minutes and staff rate, editable, feeding ImpactTab.
// Theme toggle is #1 on the R14 cut list — do not build it before the core
// workflow is done.
// TODO(step 6): build to Figma spec.
export default function SettingsPage() {
  return <PageHeader title="Settings" />;
}
