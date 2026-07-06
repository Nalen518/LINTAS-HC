import { PageHeader } from "@/components/ui/page-header";

// Read-only declaration detail. NOTE: no dedicated Figma frame — reuses the
// Results layout (ResultsSummary + tabs) in read-only mode, per the History
// row click-through (FR-12.x). Confirm layout with the team before building
// anything beyond the Results reuse.
// TODO(step 6): build after the Results tabs exist.
export default function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PageHeader title={params.id} subtitle="Read-only declaration detail" />;
}
