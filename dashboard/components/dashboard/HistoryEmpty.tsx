import Link from "next/link";
import { IconFiles, IconPlus } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";

// Figma: "History — empty" (100:1772). Centered icon + message + CTA. Used
// both when there are no declarations and when filters match nothing.
export function HistoryEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <span className="flex size-20 items-center justify-center rounded-full bg-elevated">
        <IconFiles size={36} stroke={1.5} className="text-faint" />
      </span>
      <span className="text-xl font-medium text-foreground">{title}</span>
      <p className="w-[420px] max-w-full text-center text-sm text-faint">
        {description}
      </p>
      <Link
        href="/dashboard/new"
        className={buttonVariants({ size: "default", className: "mt-2" })}
      >
        <IconPlus size={16} stroke={1.5} className="mr-1" />
        New declaration
      </Link>
    </div>
  );
}
