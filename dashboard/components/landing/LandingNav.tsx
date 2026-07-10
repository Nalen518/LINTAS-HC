"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Figma: "Landing Page" frame (20:11) → Nav. LANDING_COPY §2.
// Wordmark left, "Open dashboard" primary button right → /dashboard
// (no auth, ADR-009). 80px tall, white with a bottom hairline.
export function LandingNav() {
  const router = useRouter();

  return (
    <nav className="w-full border-b border-border bg-card">
      <div className="mx-auto flex h-20 w-full max-w-page items-center justify-between px-24">
        <a href="/" className="text-xl font-medium text-foreground">
          LINTAS
        </a>
        <Button
          size="default"
          onClick={() => router.push("/dashboard")}
        >
          Open dashboard
        </Button>
      </div>
    </nav>
  );
}
