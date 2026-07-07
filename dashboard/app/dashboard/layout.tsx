import { Sidebar } from "@/components/shell/Sidebar";

// App shell per ADR-015: 256px sidebar + slim per-page header (no top
// navbar). Every /dashboard/* screen renders inside this shell — matches
// the Sidebar + Content split on every app frame in Figma.
// Capped at max-w-page (1440, the Figma frame width) and centered so it does
// not stretch edge-to-edge on wide monitors (DESIGN_SYSTEM §4).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
