import Link from "next/link";
import {
  IconPlus,
  IconFileText,
  IconClock,
  IconAlertTriangle,
  IconCircleCheck,
  type Icon,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { RecentDeclarations } from "@/components/dashboard/RecentDeclarations";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { AttentionPanel } from "@/components/dashboard/AttentionPanel";
import { DECLARATIONS } from "@/lib/mock-data";
import { computeDashboardData } from "@/lib/dashboard";

// Figma: "Dashboard — Home" (100:1027). PRD §5.11 FR-11.x. Every figure is
// derived from the declarations list (lib/dashboard.ts) so the cards, table,
// chart, and attention panel stay consistent — and swap to real data by
// replacing DECLARATIONS with a backend fetch.
export default function DashboardHomePage() {
  const { stats, recent, attention, weekly } =
    computeDashboardData(DECLARATIONS);

  const metrics: {
    label: string;
    value: string;
    hint: string;
    icon: Icon;
    tone?: "danger";
  }[] = [
    {
      label: "Declarations this month",
      value: String(stats.declarationsThisMonth),
      hint: `${stats.pendingReview} pending review`,
      icon: IconFileText,
    },
    {
      label: "Pending review",
      value: String(stats.pendingReview),
      hint: "awaiting your approval",
      icon: IconClock,
    },
    {
      label: "Flagged high risk",
      value: String(stats.flaggedHighRisk),
      hint: "this week",
      icon: IconAlertTriangle,
      tone: "danger",
    },
    {
      label: "Avg field confidence",
      value: `${stats.avgFieldConfidence}%`,
      hint: "across extracted fields",
      icon: IconCircleCheck,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" subtitle="Overview of recent declarations">
        <Link href="/dashboard/new" className={buttonVariants({ size: "default" })}>
          <IconPlus size={16} stroke={1.75} className="mr-1" />
          New declaration
        </Link>
      </PageHeader>

      <div className="grid grid-cols-4 gap-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <RecentDeclarations declarations={recent} />

      <div className="flex items-start gap-5">
        <WeeklyChart data={weekly} />
        <AttentionPanel items={attention} />
      </div>
    </div>
  );
}
