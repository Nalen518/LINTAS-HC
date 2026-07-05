import Link from "next/link";

// Placeholder — replaced by the full landing (6 sections per LANDING_COPY,
// FR-8.x) in build step 3. Kept minimal so the route exists and the token
// system can be smoke-tested.
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="font-serif text-display">LINTAS</p>
      <Link
        href="/dashboard"
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors duration-150 ease-out-expo hover:bg-primary-hover"
      >
        Open dashboard
      </Link>
    </main>
  );
}
