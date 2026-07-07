"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { IconCircleCheck } from "@tabler/icons-react";
import {
  loadImpactSettings,
  saveImpactSettings,
  DEFAULT_IMPACT_SETTINGS,
  type ImpactSettings,
} from "@/lib/settings";

// Figma: "Settings" (100:1453). §5.13 trimmed by ADR-009 (no profile/roles).
// Impact-estimate assumptions feed the Impact tab (ADR-016); persisted in
// localStorage. Read-only application info below. Theme toggle deferred (R14).
const APP_INFO: { label: string; value: string; badge?: boolean }[] = [
  { label: "Version", value: "0.9.0 · semifinal MVP" },
  { label: "Mode", value: "Demo — CEISA submission simulated", badge: true },
  { label: "Processing", value: "Local · offline (Ollama llama3.2)" },
  {
    label: "Models",
    value: "Docling · PaddleOCR · LayoutLMv3 · TableTransformer",
  },
];

function SettingField({
  title,
  description,
  value,
  suffix,
  step,
  onChange,
}: {
  title: string;
  description: string;
  value: number;
  suffix: string;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-body-sm text-faint">{description}</span>
      </div>
      <div className="flex h-[38px] w-[220px] shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 focus-within:ring-2">
        <input
          type="number"
          value={Number.isNaN(value) ? "" : value}
          step={step}
          min={0}
          aria-label={title}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="min-w-0 flex-1 bg-transparent text-body-sm text-foreground focus:outline-none"
        />
        <span className="shrink-0 text-body-sm text-faint">{suffix}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  // Saved values (from localStorage)
  const [saved, setSaved] = useState<ImpactSettings>(DEFAULT_IMPACT_SETTINGS);
  // Draft values (user edits, not yet saved)
  const [draft, setDraft] = useState<ImpactSettings>(DEFAULT_IMPACT_SETTINGS);
  // Save feedback
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const loaded = loadImpactSettings();
    setSaved(loaded);
    setDraft(loaded);
  }, []);

  const isDirty =
    draft.manualPrepHours !== saved.manualPrepHours ||
    draft.staffRatePerHour !== saved.staffRatePerHour ||
    draft.kurs !== saved.kurs;

  function updateDraft(patch: Partial<ImpactSettings>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  const handleSave = useCallback(() => {
    saveImpactSettings(draft);
    setSaved(draft);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [draft]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        subtitle="Adjust the Impact-tab assumptions and view system information."
      >
        <Button
          size="default"
          animated={isDirty}
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save settings
        </Button>
      </PageHeader>

      <div className="flex w-[760px] max-w-full flex-col gap-6">
        {/* Impact estimate */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-1 px-6 pb-2 pt-6">
            <span className="text-sm font-medium text-foreground">
              Impact estimate
            </span>
            <span className="text-body-sm text-faint">
              Used to estimate effort saved on each declaration&apos;s Impact tab.
            </span>
          </div>
          <SettingField
            title="Manual preparation baseline"
            description="Assumed manual prep time per declaration"
            value={draft.manualPrepHours}
            suffix="hours"
            step={0.5}
            onChange={(v) => updateDraft({ manualPrepHours: v })}
          />
          <span className="mx-6 block h-px bg-border" />
          <SettingField
            title="Staff cost"
            description="Hourly cost used in the saved-cost estimate"
            value={draft.staffRatePerHour}
            suffix="Rp / hr"
            step={1000}
            onChange={(v) => updateDraft({ staffRatePerHour: v })}
          />
          <span className="mx-6 block h-px bg-border" />
          <SettingField
            title="Customs exchange rate (KURS)"
            description="USD → Rp rate used for the duty calculation"
            value={draft.kurs}
            suffix="Rp / USD"
            step={50}
            onChange={(v) => updateDraft({ kurs: v })}
          />
        </div>

        {/* Application info */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-1 px-6 pb-2 pt-6">
            <span className="text-sm font-medium text-foreground">
              Application
            </span>
            <span className="text-body-sm text-faint">
              Read-only system information.
            </span>
          </div>
          {APP_INFO.map((row, i) => (
            <div key={row.label}>
              {i > 0 && <span className="mx-6 block h-px bg-border" />}
              <div className="flex items-center gap-4 px-6 py-3">
                <span className="w-[160px] shrink-0 text-body-sm text-faint">
                  {row.label}
                </span>
                {row.badge ? (
                  <span className="rounded-sm bg-accent-subtle px-2 py-0.5 text-badge text-primary">
                    {row.value}
                  </span>
                ) : (
                  <span className="text-body-sm text-foreground">
                    {row.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 shadow-popover"
          >
            <IconCircleCheck size={18} className="text-success" stroke={2} />
            <span className="text-sm font-medium text-foreground">
              Settings saved successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

