"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconFilePlus,
  IconHistory,
  IconSettings,
  IconHelp,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Figma: Components → Sidebar (68:17). App shell nav per ADR-015 —
// 256px sidebar with wordmark + five destinations, emerald active state.
// No role-aware filtering: roles were removed with auth (ADR-009).
const NAV_ITEMS: { href: string; label: string; icon: Icon; exact?: boolean }[] =
  [
    { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard, exact: true },
    { href: "/dashboard/new", label: "New declaration", icon: IconFilePlus },
    { href: "/dashboard/history", label: "History", icon: IconHistory },
    { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
    { href: "/dashboard/help", label: "Help", icon: IconHelp },
  ];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-card px-5 py-7">
      <Link href="/" className="pb-2 pl-2.5">
        <span className="text-xl font-medium text-foreground">LINTAS</span>
      </Link>
      <nav className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150 ease-out-expo",
                isActive
                  ? "bg-accent-subtle font-medium text-primary"
                  : "font-normal text-muted-foreground hover:bg-elevated hover:text-foreground",
              )}
            >
              <ItemIcon size={20} stroke={2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
