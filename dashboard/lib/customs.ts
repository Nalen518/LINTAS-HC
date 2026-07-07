// Real duties & taxes calculation for the Impact tab (FR-7.x as amended by
// ADR-016 — a genuine calc, not an invented metric). Statutory rates (PPN,
// PPh 22) are real; KURS and the per-HS import-duty rate are documented
// assumptions the user can adjust (Settings, per ADR-016). Output is labeled
// "estimated, confirmed by CEISA on submission".

export const CUSTOMS_ASSUMPTIONS = {
  // Assumed customs exchange rate (KURS), Rp per USD. The real KURS is set
  // weekly by the Ministry of Finance; the demo uses a fixed value.
  kurs: 16250,
  ppnRate: 0.11, // Value-added tax (PPN) — statutory 11%
  pph22Rate: 0.025, // Income tax (PPh 22) — 2.5% (with NPWP)
};

// Demo import-duty (Bea Masuk) rates by HS heading (first 4 digits). Real BTKI
// rates vary by tariff line; unknown headings default to 0%. Extend as the
// confirmed rate schedule becomes available.
const DUTY_RATES: Record<string, number> = {
  "8471": 0, // Automatic data-processing machines (computers) — duty free
  "7208": 0, // Flat-rolled iron/steel — placeholder, confirm actual BTKI rate
};

export function dutyRateForHs(hsCode: string | null | undefined): number {
  if (!hsCode) return 0;
  const heading = hsCode.replace(/\D/g, "").slice(0, 4);
  return DUTY_RATES[heading] ?? 0;
}

export type ImpactBreakdown = {
  kurs: number;
  customsValueIdr: number;
  dutyRate: number;
  importDuty: number;
  ppn: number;
  pph22: number;
  total: number;
};

// Indonesian import tax base (nilai impor) = customs value (CIF) + import duty.
export function computeImpact(
  totalValueUsd: number,
  hsCode: string | null | undefined,
): ImpactBreakdown {
  const { kurs, ppnRate, pph22Rate } = CUSTOMS_ASSUMPTIONS;
  const customsValueIdr = Math.round(totalValueUsd * kurs);
  const dutyRate = dutyRateForHs(hsCode);
  const importDuty = Math.round(customsValueIdr * dutyRate);
  const taxBase = customsValueIdr + importDuty;
  const ppn = Math.round(taxBase * ppnRate);
  const pph22 = Math.round(taxBase * pph22Rate);
  return {
    kurs,
    customsValueIdr,
    dutyRate,
    importDuty,
    ppn,
    pph22,
    total: importDuty + ppn + pph22,
  };
}

// Effort-saved estimate (ADR-016): honest because its assumptions are shown on
// screen and are user-configurable in Settings. Defaults live here.
export const EFFORT_ASSUMPTIONS = {
  manualPrepMinutes: 180, // ~3 hrs by hand
  withLintasMinutes: 2,
  staffRatePerHour: 50000, // Rp
};

export function computeEffortSaved() {
  const { manualPrepMinutes, withLintasMinutes, staffRatePerHour } =
    EFFORT_ASSUMPTIONS;
  const savedMinutes = manualPrepMinutes - withLintasMinutes;
  const savedHours = savedMinutes / 60;
  return {
    manualPrepMinutes,
    withLintasMinutes,
    savedHours,
    staffRatePerHour,
    costSaved: Math.round(savedHours * staffRatePerHour),
  };
}
