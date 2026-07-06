import { Sidebar } from "@/components/shell/Sidebar";

// App shell per ADR-015: 256px sidebar + slim per-page header (no top
// navbar). Every /dashboard/* screen renders inside this shell — matches
// the Sidebar + Content split on every app frame in Figma.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
