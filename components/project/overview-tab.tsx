"use client"

import { Mail, User, Tag, CalendarDays, Clock } from "lucide-react"
import type { Project } from "@/lib/types"
import {
  daysUntil,
  formatDate,
  formatPeso,
  paymentProgress,
  projectRevenue,
  taskProgress,
} from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || "\u2014"}</p>
      </div>
    </div>
  )
}

export function OverviewTab({ project }: { project: Project }) {
  const days = daysUntil(project.targetDate)
  const approvedChanges = project.changes.filter((c) => c.status === "approved")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            {project.description || "No description provided."}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={User} label="Client" value={project.clientName} />
            <InfoRow icon={Mail} label="Contact" value={project.contact} />
            <InfoRow icon={Tag} label="Business type" value={project.businessType} />
            <InfoRow
              icon={CalendarDays}
              label="Timeline"
              value={`${formatDate(project.startDate)} \u2192 ${formatDate(project.targetDate)}`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payments</span>
                <span className="font-medium tabular-nums">
                  {paymentProgress(project)}%
                </span>
              </div>
              <Progress value={paymentProgress(project)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-medium tabular-nums">
                  {taskProgress(project)}%
                </span>
              </div>
              <Progress value={taskProgress(project)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target completion</p>
              <p className="text-sm font-medium">
                {days === null
                  ? "\u2014"
                  : days < 0
                    ? `${Math.abs(days)} days overdue`
                    : days === 0
                      ? "Due today"
                      : `${days} days remaining`}
              </p>
            </div>
          </CardContent>
        </Card>

        {approvedChanges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approved Changes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price</span>
                <span className="tabular-nums">{formatPeso(project.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  + {approvedChanges.length} change
                  {approvedChanges.length > 1 ? "s" : ""}
                </span>
                <span className="tabular-nums">
                  {formatPeso(projectRevenue(project) - project.price)}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatPeso(projectRevenue(project))}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
