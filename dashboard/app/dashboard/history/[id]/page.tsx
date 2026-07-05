// Read-only declaration detail view.
// TODO: not yet in Figma (ADR-008).
export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  return <p>Declaration {params.id} — pending Figma design (ADR-008).</p>;
}
