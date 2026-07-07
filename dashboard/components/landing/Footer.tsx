// Figma: "Footer" frame (48:27). LANDING_COPY §8. Surface/Deep background,
// brand left, team right, hairline divider, copyright row.
export function Footer() {
  return (
    <footer className="w-full bg-deep">
      <div className="mx-auto flex w-full max-w-page flex-col gap-10 px-24 pb-8 pt-20">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-2xl font-medium text-inverse">LINTAS</span>
            <span className="text-body-sm text-faint">
              An AI Open Hackathon 2026 semifinal project
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-eyebrow uppercase text-faint">Team</span>
            <span className="text-body-sm text-inverse">Mendoan</span>
          </div>
        </div>
        <span className="h-px w-full bg-white/[0.14]" />
        <p className="text-xs text-faint">
          © 2026 LINTAS · Built for Cikarang Dryport &amp; Directorate General of
          Customs and Excise · Simulated CEISA integration for demonstration only.
        </p>
      </div>
    </footer>
  );
}
