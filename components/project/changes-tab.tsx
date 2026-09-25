"use client"

import { useState } from "react"
import { Plus, Trash2, Check, X, GitPullRequestArrow } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import type { Project } from "@/lib/types"
import { formatDate, formatPeso } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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

export function ChangesTab({ project }: { project: Project }) {
  const { addChange, updateChange, deleteChange } = useStore()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState(0)
  const [extraDays, setExtraDays] = useState(0)

  const handleAdd = () => {
    if (!description.trim()) {
      toast.error("Describe the requested change.")
      return
    }
    addChange(project.id, {
      description: description.trim(),
      additionalCost: cost,
      additionalDays: extraDays,
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
    })
    toast.success("Change request added")
    setDescription("")
    setCost(0)
    setExtraDays(0)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline">
                <Plus data-icon="inline-start" />
                New Change Request
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Change Request</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="chg-desc">Description</FieldLabel>
                <Textarea
                  id="chg-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add an online booking form to the contact page"
                  rows={3}
                  autoFocus
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="chg-cost">Additional cost (PHP)</FieldLabel>
                  <Input
                    id="chg-cost"
                    type="number"
                    min={0}
                    step={500}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value) || 0)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="chg-days">Extra days</FieldLabel>
                  <Input
                    id="chg-days"
                    type="number"
                    min={0}
                    value={extraDays}
                    onChange={(e) => setExtraDays(Number(e.target.value) || 0)}
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost">Cancel</Button>} />
              <Button onClick={handleAdd}>Add Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {project.changes.length === 0 ? (
        <Empty className="rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GitPullRequestArrow />
            </EmptyMedia>
            <EmptyTitle>No change requests</EmptyTitle>
            <EmptyDescription>
              Track scope changes and their impact on cost and timeline here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {project.changes.map((change) => (
            <Card key={change.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {change.status === "approved" ? (
                      <Badge variant="secondary">Approved</Badge>
                    ) : change.status === "rejected" ? (
                      <Badge variant="outline">Rejected</Badge>
                    ) : (
                      <Badge variant="default">Pending</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(change.date)}
                    </span>
                  </div>
                  <p className="text-sm">{change.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>+{formatPeso(change.additionalCost)}</span>
                    <span>
                      +{change.additionalDays} day
                      {change.additionalDays === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {change.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateChange(project.id, change.id, {
                            status: "approved",
                          })
                        }
                        aria-label="Approve"
                      >
                        <Check />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateChange(project.id, change.id, {
                            status: "rejected",
                          })
                        }
                        aria-label="Reject"
                      >
                        <X />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteChange(project.id, change.id)}
                    aria-label="Delete change request"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
