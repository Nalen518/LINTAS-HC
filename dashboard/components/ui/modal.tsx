"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Dialog primitive per DESIGN_SYSTEM §7: dark scrim + centered card with the
// modal shadow. Closes on overlay click and Escape; locks body scroll; enter
// animation via tailwindcss-animate (~200ms). Overlay is a fixed layer so it
// covers the viewport regardless of where it renders in the tree.
export function Modal({
  open,
  onClose,
  children,
  className,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    contentRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] overflow-y-auto rounded-lg bg-card shadow-modal focus:outline-none animate-in fade-in-0 zoom-in-95 duration-200 ease-out-expo",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
