// Dashboard shell: navbar + sidebar per PRD §5.10 (FR-10.x). Role-aware nav (FR-10.5).
// TODO: not yet in Figma (ADR-008) — swap in components/shell/Navbar + Sidebar once designed.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
