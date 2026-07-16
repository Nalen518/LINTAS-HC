"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { computeImpact } from "@/lib/customs";
import { loadImpactSettings, DEFAULT_IMPACT_SETTINGS } from "@/lib/settings";
import type { ExtractResponse } from "@/lib/api";

// Figma: "Results · Impact" tab content (88:645). FR-7.x. Duties & taxes — a
// real calculation from the declared customs value + HS code (CIF = USD×KURS,
// import duty, PPN 11%, PPh 22 2.5%). No invented metrics.

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

export function ImpactTab({
  documents,
}: {
  documents: ExtractResponse["documents"];
}) {
  // KURS assumption from Settings (ADR-016), read after mount.
  const [settings, setSettings] = useState(DEFAULT_IMPACT_SETTINGS);
  useEffect(() => setSettings(loadImpactSettings()), []);

  const ci = documents.commercial_invoice as CiDoc;
  const totalValue = typeof ci?.total_value === "number" ? ci.total_value : 0;
  const currency = ci?.currency ?? "USD";
  const hsCode = ci?.items?.[0]?.hs_code ?? null;

  const impact = computeImpact(totalValue, hsCode, settings.kurs);

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

      <p className="text-body-sm text-faint">
        Estimated from current rates. Final amounts are confirmed by CEISA on
        submission.
      </p>
    </div>
  );
}
