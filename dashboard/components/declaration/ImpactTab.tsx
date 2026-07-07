"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";
import { computeImpact, computeEffortSaved } from "@/lib/customs";
import {
  loadImpactSettings,
  DEFAULT_IMPACT_SETTINGS,
} from "@/lib/settings";
import type { ExtractResponse } from "@/lib/api";

// Figma: "Results · Impact" tab content (88:645). FR-7.x as amended by ADR-016.
// (1) Duties & taxes — a real calculation from the declared customs value +
//     HS code. (2) Estimated effort saved — labeled "Estimate", assumptions on
//     screen and adjustable in Settings. No invented metrics.

type CiDoc = {
  total_value?: number;
  currency?: string;
  items?: { hs_code?: string }[];
};

function CalcRow({
  label,
  meta,
  amount,
}: {
  label: string;
  meta?: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5">
      <span className="text-body-sm text-foreground">
        {label}
        {meta && <span className="ml-2 text-faint">{meta}</span>}
      </span>
      <span className="font-mono text-mono-sm text-foreground">{amount}</span>
    </div>
  );
}

function EffortStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-faint">{label}</span>
      <span
        className={cn(
          "text-2xl font-medium",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ImpactTab({
  documents,
}: {
  documents: ExtractResponse["documents"];
}) {
  // Read the user's Impact assumptions (Settings, ADR-016) after mount.
  const [settings, setSettings] = useState(DEFAULT_IMPACT_SETTINGS);
  useEffect(() => setSettings(loadImpactSettings()), []);

  const ci = documents.commercial_invoice as CiDoc;
  const totalValue = typeof ci?.total_value === "number" ? ci.total_value : 0;
  const currency = ci?.currency ?? "USD";
  const hsCode = ci?.items?.[0]?.hs_code ?? null;

  const impact = computeImpact(totalValue, hsCode, settings.kurs);
  const effort = computeEffortSaved({
    manualPrepHours: settings.manualPrepHours,
    staffRatePerHour: settings.staffRatePerHour,
  });
  const savedHrs = (Math.floor(effort.savedHours * 10) / 10).toString();
  const manualLabel = `~${settings.manualPrepHours} hrs`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Duties &amp; taxes</h3>
        <p className="text-body-sm text-faint">
          Estimated fiscal impact from the declared customs value and HS code.
        </p>
      </div>

      {/* Duties & taxes — real calc */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 p-6">
          <span className="text-xs text-faint">Customs value (CIF)</span>
          <span className="font-mono text-2xl text-foreground">
            {formatRupiah(impact.customsValueIdr)}
          </span>
          <span className="text-body-sm text-faint">
            {currency} {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
            × customs rate (KURS) {impact.kurs.toLocaleString("en-US")}
          </span>
        </div>
        <span className="mx-6 block h-px bg-border" />
        <div className="py-2">
          <CalcRow
            label="Import duty (Bea Masuk)"
            meta={`HS ${hsCode ?? "—"} · ${Math.round(impact.dutyRate * 100)}%`}
            amount={formatRupiah(impact.importDuty)}
          />
          <CalcRow
            label="Value-added tax (PPN)"
            meta="11%"
            amount={formatRupiah(impact.ppn)}
          />
          <CalcRow
            label="Income tax (PPh 22)"
            meta="2.5%"
            amount={formatRupiah(impact.pph22)}
          />
        </div>
        <span className="mx-6 block h-px bg-border" />
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-foreground">
            Total duties &amp; taxes payable
          </span>
          <span className="font-mono text-base font-medium text-foreground">
            {formatRupiah(impact.total)}
          </span>
        </div>
      </div>

      {/* Estimated effort saved — labeled Estimate */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Estimated effort saved
          </span>
          <span className="rounded-sm border border-border bg-elevated px-2 py-0.5 text-badge text-muted-foreground">
            Estimate
          </span>
        </div>
        <div className="flex gap-10">
          <EffortStat label="Manual prep (assumed)" value={manualLabel} />
          <EffortStat label="With LINTAS" value="~2 min" />
          <EffortStat label="Time saved" value={`~${savedHrs} hrs`} accent />
        </div>
        <span className="text-body-sm text-muted-foreground">
          ≈ {formatRupiah(effort.costSaved)} per declaration, at an assumed{" "}
          {formatRupiah(effort.staffRatePerHour)} / hour staff cost.
        </span>
        <span className="text-xs text-faint">
          Estimate based on the assumptions shown — set your own manual baseline
          and staff rate in Settings.
        </span>
      </div>

      <p className="text-body-sm text-faint">
        Estimated from current rates — final amounts are confirmed by CEISA on
        submission.
      </p>
    </div>
  );
}
