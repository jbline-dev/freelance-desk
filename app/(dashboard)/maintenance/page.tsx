"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Wrench } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import type { Maintenance, MaintenanceStatus } from "@/lib/types"
import { daysUntil, formatDate, formatPeso } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_ITEMS: { label: string; value: MaintenanceStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
]

const STATUS_VARIANT: Record<
  MaintenanceStatus,
  "secondary" | "outline" | "destructive"
> = {
  active: "secondary",
  paused: "outline",
  cancelled: "destructive",
}

export default function MaintenancePage() {
  const { maintenance, addMaintenance, updateMaintenance, deleteMaintenance } =
    useStore()

  const mrr = useMemo(
    () =>
      maintenance
        .filter((m) => m.status === "active")
        .reduce((sum, m) => sum + m.monthlyFee, 0),
    [maintenance],
  )

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Maintenance"
        description="Recurring care plans and monthly retainers."
      >
        <AddMaintenanceDialog onAdd={addMaintenance} />
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Monthly recurring</p>
              <p className="text-xl font-semibold tabular-nums text-primary">
                {formatPeso(mrr)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Active plans</p>
              <p className="text-xl font-semibold tabular-nums">
                {maintenance.filter((m) => m.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Annual run rate</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatPeso(mrr * 12)}
              </p>
            </CardContent>
          </Card>
        </div>

        {maintenance.length === 0 ? (
          <Empty className="rounded-lg border border-dashed py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wrench />
              </EmptyMedia>
              <EmptyTitle>No maintenance plans</EmptyTitle>
              <EmptyDescription>
                Add recurring retainers to track your monthly recurring revenue.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Next billing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map((m) => {
                    const due = daysUntil(m.nextBilling)
                    const soon =
                      m.status === "active" && due !== null && due <= 7
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.client}</span>
                            <span className="text-xs text-muted-foreground">
                              {m.website}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.plan}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              soon
                                ? "font-medium text-primary"
                                : "text-muted-foreground"
                            }
                          >
                            {formatDate(m.nextBilling)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={m.status}
                            onValueChange={(v) =>
                              updateMaintenance(m.id, {
                                status: v as MaintenanceStatus,
                              })
                            }
                            items={STATUS_ITEMS}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue>
                                <Badge variant={STATUS_VARIANT[m.status]}>
                                  {STATUS_ITEMS.find(
                                    (s) => s.value === m.status,
                                  )?.label ?? m.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_ITEMS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPeso(m.monthlyFee)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteMaintenance(m.id)}
                            aria-label="Delete plan"
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function AddMaintenanceDialog({
  onAdd,
}: {
  onAdd: (item: Omit<Maintenance, "id">) => void
}) {
  const [open, setOpen] = useState(false)
  const [client, setClient] = useState("")
  const [website, setWebsite] = useState("")
  const [plan, setPlan] = useState("")
  const [monthlyFee, setMonthlyFee] = useState(0)
  const [nextBilling, setNextBilling] = useState("")

  const reset = () => {
    setClient("")
    setWebsite("")
    setPlan("")
    setMonthlyFee(0)
    setNextBilling("")
  }

  const handleAdd = () => {
    if (!client.trim() || monthlyFee <= 0) {
      toast.error("Client and monthly fee are required.")
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    onAdd({
      client: client.trim(),
      website: website.trim(),
      plan: plan.trim() || "Basic Care",
      monthlyFee,
      nextBilling: nextBilling || today,
      status: "active",
      lastActivity: today,
    })
    toast.success("Maintenance plan added")
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus data-icon="inline-start" />
            Add Plan
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Maintenance Plan</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="m-client">Client</FieldLabel>
              <Input
                id="m-client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="m-website">Website</FieldLabel>
              <Input
                id="m-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="example.ph"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="m-plan">Plan name</FieldLabel>
            <Input
              id="m-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Basic Care, Growth, Premium..."
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="m-fee">Monthly fee (PHP)</FieldLabel>
              <Input
                id="m-fee"
                type="number"
                min={0}
                step={500}
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value) || 0)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="m-billing">Next billing</FieldLabel>
              <Input
                id="m-billing"
                type="date"
                value={nextBilling}
                onChange={(e) => setNextBilling(e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleAdd}>Add Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
