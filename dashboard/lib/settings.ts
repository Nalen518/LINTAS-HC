import { CUSTOMS_ASSUMPTIONS, EFFORT_ASSUMPTIONS } from "@/lib/customs";

// User-adjustable Impact-tab assumptions (ADR-016). Persisted in localStorage
// so the Settings page and the Impact tab stay in sync without a backend.
export type ImpactSettings = {
  manualPrepHours: number;
  staffRatePerHour: number;
  kurs: number;
};

export const DEFAULT_IMPACT_SETTINGS: ImpactSettings = {
  manualPrepHours: EFFORT_ASSUMPTIONS.manualPrepMinutes / 60,
  staffRatePerHour: EFFORT_ASSUMPTIONS.staffRatePerHour,
  kurs: CUSTOMS_ASSUMPTIONS.kurs,
};

const STORAGE_KEY = "lintas.impact-settings";

export function loadImpactSettings(): ImpactSettings {
  if (typeof window === "undefined") return DEFAULT_IMPACT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IMPACT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ImpactSettings>;
    return { ...DEFAULT_IMPACT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_IMPACT_SETTINGS;
  }
}

export function saveImpactSettings(settings: ImpactSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
