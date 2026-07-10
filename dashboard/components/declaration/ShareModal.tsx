"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

// Figma: "New declaration — Share" modal (100:2031). PRD §5.15 FR-15.x.
// Copy-link dialog. The link is illustrative (demo only) — Share polish is #3
// on the R14 cut list, so this stays minimal.
export function ShareModal({
  open,
  pibNumber,
  onClose,
}: {
  open: boolean;
  pibNumber: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = `app.cikarangdryport.id/d/${pibNumber}?t=8f3a`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — leave the link visible for manual copy
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-[460px] max-w-full"
      labelledBy="share-title"
    >
      <div className="flex flex-col gap-4 px-7 pb-6 pt-7">
        <h2 id="share-title" className="text-2xl font-medium text-foreground">
          Share declaration
        </h2>
        <p className="text-sm text-muted-foreground">
          Anyone with this link can view declaration {pibNumber} in read-only
          mode.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex h-9 min-w-0 flex-1 items-center rounded-md border border-border bg-elevated px-3">
            <span className="truncate font-mono text-mono-sm text-muted-foreground">
              {link}
            </span>
          </div>
          <Button variant="secondary" onClick={copyLink} className="shrink-0">
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <p className="text-xs text-faint">
          Link expires in 7 days · demo only. The link is illustrative.
        </p>

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
