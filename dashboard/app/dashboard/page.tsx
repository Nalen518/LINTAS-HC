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
import { DASHBOARD_STATS } from "@/lib/mock-data";

// Figma: "Dashboard — Home" (100:1027). PRD §5.11 FR-11.x.
// Header + action, 4 metric cards, recent declarations table, weekly chart +
// needs-attention panel. Data is display mock (see lib/mock-data.ts).
const METRICS: {
  label: string;
  value: string;
  hint: string;
  icon: Icon;
  tone?: "danger";
}[] = [
  {
    label: "Declarations this month",
    value: String(DASHBOARD_STATS.declarationsThisMonth),
    hint: "18 pending review",
    icon: IconFileText,
  },
  {
    label: "Pending review",
    value: String(DASHBOARD_STATS.pendingReview),
    hint: "awaiting your approval",
    icon: IconClock,
  },
  {
    label: "Flagged high risk",
    value: String(DASHBOARD_STATS.flaggedHighRisk),
    hint: "this week",
    icon: IconAlertTriangle,
    tone: "danger",
  },
  {
    label: "Avg field confidence",
    value: `${DASHBOARD_STATS.avgFieldConfidence}%`,
    hint: "across extracted fields",
    icon: IconCircleCheck,
  },
];

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" subtitle="Overview of recent declarations">
        <Link href="/dashboard/new" className={buttonVariants({ size: "md" })}>
          <IconPlus size={18} stroke={1.75} />
          New declaration
        </Link>
      </PageHeader>

      <div className="grid grid-cols-4 gap-5">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <RecentDeclarations />

      <div className="flex items-start gap-5">
        <WeeklyChart />
        <AttentionPanel />
      </div>
    </div>
  );
}
