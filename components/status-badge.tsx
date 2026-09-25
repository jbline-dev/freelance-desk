import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  LEAD_STAGES,
  PROJECT_STAGES,
  type ChangeStatus,
  type LeadStatus,
  type MaintenanceStatus,
  type PaymentStatus,
  type ProjectStatus,
} from "@/lib/types"

export function projectStageLabel(status: ProjectStatus): string {
  return PROJECT_STAGES.find((s) => s.value === status)?.label ?? status
}

export function leadStageLabel(status: LeadStatus): string {
  return LEAD_STAGES.find((s) => s.value === status)?.label ?? status
}

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {projectStageLabel(status)}
    </Badge>
  )
}

export function PaymentBadge({
  status,
  overdue,
}: {
  status: PaymentStatus
  overdue?: boolean
}) {
  if (overdue) return <Badge variant="destructive">Overdue</Badge>
  if (status === "paid")
    return (
      <Badge className="bg-foreground text-background hover:bg-foreground">
        Paid
      </Badge>
    )
  return <Badge variant="secondary">Pending</Badge>
}

export function ChangeBadge({ status }: { status: ChangeStatus }) {
  if (status === "approved")
    return (
      <Badge className="bg-foreground text-background hover:bg-foreground">
        Approved
      </Badge>
    )
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

export function LeadBadge({ status }: { status: LeadStatus }) {
  if (status === "won")
    return (
      <Badge className="bg-foreground text-background hover:bg-foreground">
        Won
      </Badge>
    )
  if (status === "lost") return <Badge variant="destructive">Lost</Badge>
  return <Badge variant="secondary">{leadStageLabel(status)}</Badge>
}

export function MaintenanceBadge({ status }: { status: MaintenanceStatus }) {
  if (status === "active")
    return (
      <Badge className="bg-foreground text-background hover:bg-foreground">
        Active
      </Badge>
    )
  if (status === "cancelled")
    return <Badge variant="destructive">Cancelled</Badge>
  return <Badge variant="secondary">Paused</Badge>
}
