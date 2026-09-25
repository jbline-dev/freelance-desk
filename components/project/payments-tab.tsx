"use client"

import { useState } from "react"
import { Plus, Trash2, Check, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import type { Project } from "@/lib/types"
import {
  amountPaid,
  formatDate,
  formatPeso,
  isOverdue,
  projectRevenue,
  remainingBalance,
} from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PaymentsTab({ project }: { project: Project }) {
  const { updatePayment, deletePayment, addPayment } = useStore()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [dueDate, setDueDate] = useState(todayISO())

  const togglePaid = (paymentId: string, currentlyPaid: boolean) => {
    updatePayment(project.id, paymentId, {
      status: currentlyPaid ? "pending" : "paid",
      datePaid: currentlyPaid ? null : todayISO(),
    })
  }

  const handleAdd = () => {
    if (!description.trim() || amount <= 0) {
      toast.error("Enter a description and amount.")
      return
    }
    addPayment(project.id, {
      description: description.trim(),
      amount,
      dueDate,
      datePaid: null,
      status: "pending",
    })
    toast.success("Payment added")
    setDescription("")
    setAmount(0)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Total contract</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatPeso(projectRevenue(project))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-semibold tabular-nums text-primary">
              {formatPeso(amountPaid(project))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-xl font-semibold tabular-nums">
              {formatPeso(remainingBalance(project))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium">Payment Schedule</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm">
                    <Plus data-icon="inline-start" />
                    Add Payment
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="pay-desc">Description</FieldLabel>
                    <Input
                      id="pay-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Milestone payment"
                      autoFocus
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="pay-amount">Amount (PHP)</FieldLabel>
                    <Input
                      id="pay-amount"
                      type="number"
                      min={0}
                      step={500}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="pay-due">Due date</FieldLabel>
                    <Input
                      id="pay-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                  <Button onClick={handleAdd}>Add Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.payments.map((pay) => {
                const paid = pay.status === "paid"
                const overdue = isOverdue(pay)
                return (
                  <TableRow key={pay.id}>
                    <TableCell className="font-medium">
                      {pay.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {paid ? formatDate(pay.datePaid) : formatDate(pay.dueDate)}
                    </TableCell>
                    <TableCell>
                      {paid ? (
                        <Badge variant="secondary">Paid</Badge>
                      ) : overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPeso(pay.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => togglePaid(pay.id, paid)}
                          aria-label={paid ? "Mark unpaid" : "Mark paid"}
                        >
                          {paid ? <Undo2 /> : <Check />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deletePayment(project.id, pay.id)}
                          aria-label="Delete payment"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
