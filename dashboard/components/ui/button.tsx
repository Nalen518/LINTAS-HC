import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Figma: Components → Button (5:19), variants Type × Size.
// Sizes: default 36px (results actions), md 40px (page-header action,
// per Page header 68:18), lg 44px (hero CTA only — DESIGN_SYSTEM §7).
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-border disabled:text-faint",
        secondary:
          "border border-border bg-card text-foreground hover:border-border-strong disabled:bg-card disabled:text-faint disabled:border-border/60",
        ghost:
          "text-muted-foreground hover:bg-elevated hover:text-foreground disabled:text-faint",
        destructive:
          "bg-destructive text-inverse hover:opacity-90 disabled:bg-border disabled:text-faint",
      },
      size: {
        default: "h-9 px-4 py-2",
        md: "h-10 px-4 py-2.5",
        lg: "h-11 px-5 py-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
