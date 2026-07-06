import { PageHeader } from "@/components/ui/page-header";

// Figma: "Dashboard — Home" frame (100:1027). PRD §5.11 FR-11.x.
// (69:58 "Home Template" is an early draft — 100:1027 is the source of truth.)
// Sections, top to bottom:
//   1. PageHeader — "Dashboard" / "Overview of recent declarations" +
//      "New declaration" primary action (IconPlus 18px, size md)
//   2. Metric cards row — MetricCard × 4
//   3. Recent declarations table — header row + DeclarationRow list
//   4. Weekly chart + needs-attention panel (Recharts)
// Mock data until backend is ready; shapes per docs/API_CONTRACT.md.
// TODO(step 4): build to Figma spec.
export default function DashboardHomePage() {
  return (
    <PageHeader title="Dashboard" subtitle="Overview of recent declarations" />
  );
}
