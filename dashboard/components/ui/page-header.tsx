import { cn } from "@/lib/utils";

// Figma: Components → Page header (68:18). Slim in-page header per ADR-015:
// title + subtitle left, primary action right (rendered via children).
export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium text-foreground">{title}</h1>
        {subtitle ? <p className="text-body-sm text-faint">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
