"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Scroll-triggered fade-up used across landing sections. Motion values follow
// DESIGN_SYSTEM §6: expo ease, ~400ms, subtle — never entertaining. Honors
// prefers-reduced-motion by rendering a plain div.
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
