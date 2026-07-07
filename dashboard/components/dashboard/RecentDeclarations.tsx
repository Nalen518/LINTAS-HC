import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { DeclarationRow } from "@/components/ui/declaration-row";
import { formatDate } from "@/lib/utils";
import { RECENT_DECLARATIONS } from "@/lib/mock-data";

// Figma: "Dashboard — Home" → Recent (100:1071). Section title + "View all"
// link, then a table card (elevated header row + DeclarationRow list).
// Column widths mirror DeclarationRow so header and cells stay aligned.
export function RecentDeclarations() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-foreground">
          Recent declarations
        </h2>
        <Link
          href="/dashboard/history"
          className="flex items-center gap-1.5 text-body-sm text-link hover:underline"
        >
          View all in History
          <IconArrowRight size={16} stroke={1.75} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex gap-4 border-b border-border bg-elevated px-4 py-3 text-xs font-medium text-faint">
          <span className="w-[150px] shrink-0">Declaration</span>
          <span className="min-w-0 flex-1">Importer</span>
          <span className="w-[110px] shrink-0">Submitted</span>
          <span className="w-[100px] shrink-0">Risk</span>
          <span className="w-[120px] shrink-0">Status</span>
        </div>
        {RECENT_DECLARATIONS.map((d) => (
          <DeclarationRow
            key={d.id}
            id={d.id}
            summary={`${d.importer} · ${d.documentCount} documents`}
            date={formatDate(d.date)}
            risk={d.risk}
            status={d.status}
          />
        ))}
      </div>
    </section>
  );
}
