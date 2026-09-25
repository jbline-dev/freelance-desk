import type { Project } from "@/lib/types"

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function formatPeso(amount: number): string {
  return `\u20B1${Math.round(amount).toLocaleString("en-PH")}`
}

export function formatDate(date: string | null): string {
  if (!date) return "\u2014"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "\u2014"
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

export function isOverdue(payment: { status: string; dueDate: string }): boolean {
  if (payment.status === "paid") return false
  const days = daysUntil(payment.dueDate)
  return days !== null && days < 0
}

export function isThisMonth(date: string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

/** Total contract value including approved change requests. */
export function projectRevenue(project: Project): number {
  const changes = project.changes
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.additionalCost, 0)
  return project.price + changes
}

export function amountPaid(project: Project): number {
  return project.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)
}

export function remainingBalance(project: Project): number {
  return projectRevenue(project) - amountPaid(project)
}

export function paymentProgress(project: Project): number {
  const revenue = projectRevenue(project)
  if (revenue <= 0) return 0
  return Math.min(100, Math.round((amountPaid(project) / revenue) * 100))
}

export function taskProgress(project: Project): number {
  if (project.tasks.length === 0) return 0
  const done = project.tasks.filter((t) => t.done).length
  return Math.round((done / project.tasks.length) * 100)
}

export const ACTIVE_STATUSES = [
  "proposal",
  "deposit_paid",
  "building",
  "client_review",
  "final_payment",
  "deployment",
  "warranty",
] as const
