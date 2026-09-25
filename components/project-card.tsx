"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreVertical, CalendarDays } from "lucide-react"
import type { Project } from "@/lib/types"
import { PROJECT_STAGES } from "@/lib/types"
import {
  daysUntil,
  formatDate,
  formatPeso,
  isOverdue,
  projectRevenue,
  remainingBalance,
  taskProgress,
} from "@/lib/format"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PaymentBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function paymentState(project: Project) {
  const remaining = remainingBalance(project)
  const overdue = project.payments.some((p) => isOverdue(p))
  if (remaining <= 0) return { status: "paid" as const, overdue: false }
  return { status: "pending" as const, overdue }
}

export function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const { moveProject, deleteProject } = useStore()
  const progress = taskProgress(project)
  const pay = paymentState(project)
  const days = daysUntil(project.targetDate)

  return (
    <Card className="group gap-0 p-3 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <p className="text-sm font-semibold leading-tight text-balance">
            {project.businessName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {project.businessType}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground"
                aria-label="Project actions"
              >
                <MoreVertical />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              Open project
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to stage</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {PROJECT_STAGES.map((stage) => (
                  <DropdownMenuItem
                    key={stage.value}
                    onClick={() => moveProject(project.id, stage.value)}
                    className={cn(
                      stage.value === project.status &&
                        "font-medium text-foreground",
                    )}
                  >
                    {stage.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteProject(project.id)}
            >
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/projects/${project.id}`} className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium tabular-nums">
            {formatPeso(projectRevenue(project))}
          </span>
          <PaymentBadge status={pay.status} overdue={pay.overdue} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>{formatDate(project.targetDate)}</span>
          {days !== null && project.status !== "completed" ? (
            <span
              className={cn(
                "ml-auto tabular-nums",
                days < 0 && "text-destructive",
              )}
            >
              {days < 0
                ? `${Math.abs(days)}d overdue`
                : days === 0
                  ? "Due today"
                  : `${days}d left`}
            </span>
          ) : null}
        </div>
      </Link>
    </Card>
  )
}
