import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UI copy rules (CLAUDE.md): Rupiah renders as "Rp 106,396,875" in the
// interface — the IDR code appears only inside the CEISA JSON payload.
export function formatRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

// UI copy rules (CLAUDE.md): dates are day-first "5 Jul 2026" — never
// US month-first.
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
