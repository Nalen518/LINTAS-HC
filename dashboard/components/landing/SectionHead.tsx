import { cn } from "@/lib/utils";

// Shared eyebrow + serif heading used by the What this does / How it works /
// How LINTAS thinks / Before-After sections. Eyebrow is the documented
// all-caps Label/Eyebrow exception (uppercase applied via CSS so the source
// string stays sentence case). Heading is Display/Section (Instrument Serif).
export function SectionHead({
  eyebrow,
  heading,
  className,
}: {
  eyebrow: string;
  heading: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <span className="text-eyebrow uppercase text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="font-serif text-section text-foreground">{heading}</h2>
    </div>
  );
}
