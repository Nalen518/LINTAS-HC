import type { Config } from "tailwindcss";

/*
 * Every value maps to a token in docs/FIGMA_TOKENS.md (v2, locked per ADR-010)
 * via the CSS variables in app/globals.css. No ad-hoc hex or px values here
 * or in components — extend the token set instead.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
          // Surface/Accent Subtle — emerald-tinted panel bg (Before/After right half)
          subtle: "var(--accent-subtle)",
        },
        background: "var(--background)",
        card: "var(--card)",
        elevated: "var(--elevated)",
        deep: "var(--deep)",
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        faint: "var(--faint)",
        inverse: "var(--inverse)",
        link: "var(--link)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          emphasis: "var(--border-emphasis)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        destructive: "var(--destructive)",
        info: "var(--info)",
        confidence: {
          high: "var(--confidence-high)",
          medium: "var(--confidence-medium)",
          low: "var(--confidence-low)",
        },
        risk: {
          low: "var(--risk-low)",
          medium: "var(--risk-medium)",
          high: "var(--risk-high)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      // Named text styles from FIGMA_TOKENS §2 that Tailwind's default scale
      // doesn't cover. Defaults already match the rest: text-xs 12/16 (Caption,
      // Mono/Default), text-sm 14/20 (Body/Default), text-base 16/24 (Body/Large),
      // text-xl 20/28 (H3), text-2xl 24/32 (H2, Display/Section), text-3xl 30/36 (H1).
      fontSize: {
        // Display/Hero — 48/52 per LANDING_COPY §3 (supersedes the 40/44 draft in FIGMA_TOKENS §2.1)
        display: ["48px", { lineHeight: "52px", fontWeight: "400" }],
        // Display/Section — Instrument Serif 28/36, landing section H2s (FIGMA_TOKENS §2.1)
        section: ["28px", { lineHeight: "36px", fontWeight: "400" }],
        h4: ["18px", { lineHeight: "26px", fontWeight: "500" }],
        "body-sm": ["13px", { lineHeight: "20px" }],
        eyebrow: ["11px", { lineHeight: "16px", letterSpacing: "1.2px", fontWeight: "500" }],
        badge: ["11px", { lineHeight: "14px", fontWeight: "500" }],
        "mono-sm": ["10px", { lineHeight: "14px" }],
        "mono-xs": ["9px", { lineHeight: "12px" }],
      },
      // Radius tokens (FIGMA_TOKENS §6)
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        pill: "999px",
      },
      // Effect styles (FIGMA_TOKENS §3). Cards get border only — no shadow.
      boxShadow: {
        popover: "0 4px 12px rgb(0 0 0 / 0.08)",
        modal: "0 12px 32px rgb(0 0 0 / 0.16)",
      },
      ringColor: {
        DEFAULT: "var(--ring)",
      },
      // Motion (DESIGN_SYSTEM §6): 150 hover / 250 panel / 400 modal
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      // Grid/12 Desktop max-width (FIGMA_TOKENS §4)
      maxWidth: {
        page: "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
