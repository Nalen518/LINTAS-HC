import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Font stack per FIGMA_TOKENS §2: Inter (UI), Instrument Serif (display, landing
// hero + section H2s only), JetBrains Mono (code / IDs / SHAP values).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Metadata per LANDING_COPY §1
export const metadata: Metadata = {
  title: "LINTAS — AI Customs Assistant for Cikarang Dryport",
  description:
    "Faster, safer PIB filing for authorized Cikarang Dryport staff. Extract, validate, and explain declarations in seconds instead of hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
