import { Badge } from "@/components/ui/badge";
import type { AttentionItem } from "@/lib/mock-data";

// Figma: "Dashboard — Home" → Attention (100:1124). Card with a header and a
// divided list of declarations pending review, each with a compact risk pill.
// Items are derived from the declarations list (lib/dashboard.ts).
export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  return (
    <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-0.5 px-5 pb-4 pt-5">
        <span className="text-sm font-medium text-foreground">
          Needs your attention
        </span>
        <span className="text-body-sm text-faint">
          Declarations pending your review
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-t border-border px-5 py-3"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-mono-sm text-foreground">
              {item.id}
            </span>
            <span className="text-xs text-faint">{item.importer}</span>
          </div>
          <Badge tone={item.risk} size="sm" />
        </div>
      ))}
    </aside>
  );
}
