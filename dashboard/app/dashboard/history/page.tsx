"use client";

import { useState } from "react";
import Link from "next/link";
import { IconPlus, IconSearch, IconChevronDown } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { DeclarationRow } from "@/components/ui/declaration-row";
import { HistoryEmpty } from "@/components/dashboard/HistoryEmpty";
import { formatDate } from "@/lib/utils";
import { HISTORY_DECLARATIONS } from "@/lib/mock-data";

// Figma: "History" (100:1261) + empty state (100:1768). PRD §5.12 FR-12.x.
// Single scope, no role split (ADR-009). Search + status/risk filters run
// client-side over the declarations; rows link to the read-only detail.
const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "submitted", label: "Submitted" },
  { value: "in review", label: "In review" },
  { value: "draft", label: "Draft" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All risk" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 appearance-none rounded-md border border-border bg-card pl-3.5 pr-9 text-body-sm text-foreground focus-visible:outline-none focus-visible:ring-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        size={16}
        stroke={1.75}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");

  const query = search.trim().toLowerCase();
  const filtered = HISTORY_DECLARATIONS.filter((d) => {
    const matchesSearch =
      !query ||
      d.id.toLowerCase().includes(query) ||
      d.importer.toLowerCase().includes(query);
    const matchesStatus = status === "all" || d.status === status;
    const matchesRisk = risk === "all" || d.risk === risk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const noneAtAll = HISTORY_DECLARATIONS.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="History" subtitle="All declarations you've processed">
        <Link href="/dashboard/new" className={buttonVariants({ size: "default" })}>
          <IconPlus size={16} stroke={1.5} className="mr-1" />
          New declaration
        </Link>
      </PageHeader>

      {!noneAtAll && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <IconSearch
              size={18}
              stroke={1.75}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PIB number or importer"
              aria-label="Search declarations"
              className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3.5 text-body-sm text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2"
            />
          </div>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            label="Filter by status"
          />
          <Select
            value={risk}
            onChange={setRisk}
            options={RISK_OPTIONS}
            label="Filter by risk"
          />
        </div>
      )}

      {noneAtAll ? (
        <HistoryEmpty
          title="No declarations yet"
          description="Your processed declarations will show up here. Start by uploading a Commercial Invoice, Packing List, and Bill of Lading."
        />
      ) : filtered.length === 0 ? (
        <HistoryEmpty
          title="No matching declarations"
          description="No declarations match your search or filters. Try a different query, or clear the filters."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex gap-4 border-b border-border bg-elevated px-4 py-3 text-xs font-medium text-faint">
            <span className="w-[150px] shrink-0">Declaration</span>
            <span className="min-w-0 flex-1">Importer</span>
            <span className="w-[110px] shrink-0">Submitted</span>
            <span className="w-[100px] shrink-0">Risk</span>
            <span className="w-[120px] shrink-0">Status</span>
          </div>
          {filtered.map((d) => (
            <DeclarationRow
              key={d.id}
              id={d.id}
              summary={`${d.importer} · ${d.documentCount} documents`}
              date={formatDate(d.date)}
              risk={d.risk}
              status={d.status}
              href={`/dashboard/history/${d.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
