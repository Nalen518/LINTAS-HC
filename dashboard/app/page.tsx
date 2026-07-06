import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { WhatThisDoes } from "@/components/landing/WhatThisDoes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { HowLintasThinks } from "@/components/landing/HowLintasThinks";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Footer } from "@/components/landing/Footer";

// Landing page — six sections in Figma canvas order (ADR-013: autonomy
// levels cut, verdict section cut). Copy source: docs/LANDING_COPY.md.
// Frames: Landing Page (20:11) → What this does (23:4) → How it works (34:9)
// → How LINTAS thinks (37:11) → Before / After (38:13) → Footer (48:27).
export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <WhatThisDoes />
      <HowItWorks />
      <HowLintasThinks />
      <BeforeAfter />
      <Footer />
    </main>
  );
}
