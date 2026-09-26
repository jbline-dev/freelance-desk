"use client"

import Link from "next/link"
import {
  Briefcase,
  Wallet,
  TrendingUp,
  AlarmClock,
  Plus,
  ArrowRight,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  amountPaid,
  daysUntil,
  formatDate,
  formatPeso,
  isOverdue,
  isThisMonth,
  projectRevenue,
  remainingBalance,
} from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { KanbanBoard } from "@/components/kanban-board"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"

export default function DashboardPage() {
  const { projects } = useStore()

  const activeProjects = projects.filter(
    (p) => p.status !== "lead" && p.status !== "completed",
  )

  const pendingPayments = projects.reduce(
    (sum, p) => sum + Math.max(0, remainingBalance(p)),
    0,
  )
  const overdueCount = projects.reduce(
    (n, p) => n + p.payments.filter((pay) => isOverdue(pay)).length,
    0,
  )

  const revenueThisMonth = projects.reduce(
    (sum, p) =>
      sum +
      p.payments
        .filter((pay) => pay.status === "paid" && isThisMonth(pay.datePaid))
        .reduce((s, pay) => s + pay.amount, 0),
    0,
  )

  const upcoming = projects
    .filter((p) => {
      if (p.status === "completed") return false
      const d = daysUntil(p.targetDate)
      return d !== null && d <= 14
    })
    .sort(
      (a, b) => (daysUntil(a.targetDate) ?? 0) - (daysUntil(b.targetDate) ?? 0),
    )

  const totalPipeline = activeProjects.reduce(
    (sum, p) => sum + projectRevenue(p),
    0,
  )
  const collected = projects.reduce((sum, p) => sum + amountPaid(p), 0)

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Dashboard"
        description="Overview of your freelance web development business."
      >
        <AddProjectDialog />
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Projects"
            value={String(activeProjects.length)}
            hint={`${formatPeso(totalPipeline)} in pipeline`}
            icon={Briefcase}
          />
          <StatCard
            label="Pending Payments"
            value={formatPeso(pendingPayments)}
            hint={
              overdueCount > 0
                ? `${overdueCount} overdue payment${overdueCount > 1 ? "s" : ""}`
                : "All on schedule"
            }
            icon={Wallet}
          />
          <StatCard
            label="Revenue This Month"
            value={formatPeso(revenueThisMonth)}
            hint={`${formatPeso(collected)} collected all-time`}
            icon={TrendingUp}
          />
          <StatCard
            label="Upcoming Deadlines"
            value={String(upcoming.length)}
            hint="Due within 14 days"
            icon={AlarmClock}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing due in the next two weeks.
                </p>
              ) : (
                upcoming.map((p) => {
                  const d = daysUntil(p.targetDate) ?? 0
                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {p.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.targetDate)}
                        </p>
                      </div>
                      <span
                        className={
                          d < 0
                            ? "shrink-0 text-xs font-medium text-destructive tabular-nums"
                            : "shrink-0 text-xs text-muted-foreground tabular-nums"
                        }
                      >
                        {d < 0
                          ? `${Math.abs(d)}d overdue`
                          : d === 0
                            ? "Today"
                            : `${d}d`}
                      </span>
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/projects" />}
              >
                View all
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.businessName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.projectName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm tabular-nums text-muted-foreground sm:inline">
                      {formatPeso(projectRevenue(p))}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Project Pipeline</h2>
          </div>
          <KanbanBoard />
        </div>
      </div>
    </div>
  )
}
