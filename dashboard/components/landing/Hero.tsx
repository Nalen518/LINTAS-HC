"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/Reveal";

// Figma: "Landing Page" frame (20:11) → Hero content. LANDING_COPY §3, FR-8.2.
// Left: eyebrow, serif H1 (line 2 italic emerald), sub-headline, CTA, caption.
// Right: an illustrative declaration panel (sample content, not live — ADR-002/012).

// Sample SHAP rows for the hero visual only. Bar widths are decorative.
const HERO_SHAP = [
  { label: "Country of origin risk", value: "+38%", raises: true, barClass: "w-[180px]" },
  { label: "HS code mismatch", value: "+26%", raises: true, barClass: "w-[130px]" },
  { label: "Declared value in range", value: "-14%", raises: false, barClass: "w-[90px]" },
] as const;

export function Hero() {
  const router = useRouter();

  return (
    <section className="mx-auto flex w-full max-w-page items-start gap-16 px-24 pb-24 pt-24">
      {/* Copy */}
      <Reveal className="flex w-[640px] shrink-0 flex-col gap-6">
        <span className="text-eyebrow uppercase text-muted-foreground">
          For Cikarang Dryport authorized staff
        </span>
        <h1 className="flex flex-col font-serif text-display">
          <span className="text-foreground">Check every field.</span>
          <span className="italic text-primary">Know why it was flagged.</span>
        </h1>
        <p className="text-base text-muted-foreground">
          LINTAS reads your Commercial Invoice, Packing List, and Bill of Lading
          then checks key fields against Permendag 16/2025 rules. Every risk
          score comes with a clear explanation before you submit to CEISA.
        </p>
        <Button
          size="md"
          animated
          className="w-fit"
          onClick={() => router.push("/dashboard")}
        >
          Open dashboard
        </Button>
        <p className="text-xs text-muted-foreground">

        </p>
      </Reveal>

      {/* Declaration panel — illustrative */}
      <Reveal delay={0.1} className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Declaration PIB-2026-0142
            </span>
            <span className="rounded-pill bg-risk-high px-2.5 py-1 text-badge text-inverse">
              Risk: High
            </span>
          </div>

          <div className="flex flex-col gap-2.5 rounded border border-border p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Why this score
            </span>
            {HERO_SHAP.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 rounded-[3px] ${row.barClass} ${row.raises ? "bg-risk-high" : "bg-risk-low"
                      }`}
                  />
                  <span className="text-body-sm text-muted-foreground">
                    {row.label}
                  </span>
                </div>
                <span
                  className={`font-mono text-mono-sm ${row.raises ? "text-risk-high" : "text-risk-low"
                    }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded bg-elevated p-3">
            <span className="size-2.5 shrink-0 rounded-[2px] bg-warning" />
            <span className="text-body-sm text-foreground">
              Weight mismatch: PL 2500 kg vs BL 2550 kg
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
