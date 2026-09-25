"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowRightCircle, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { LEAD_STAGES, type Lead, type LeadStatus } from "@/lib/types"
import { daysUntil, formatDate, formatPeso } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STAGE_ITEMS = LEAD_STAGES.map((s) => ({ label: s.label, value: s.value }))

const STATUS_VARIANT: Record<
  LeadStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  new: "default",
  contacted: "outline",
  interested: "outline",
  proposal_sent: "secondary",
  won: "secondary",
  lost: "destructive",
}

function statusLabel(status: LeadStatus) {
  return LEAD_STAGES.find((s) => s.value === status)?.label ?? status
}

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, convertLead } = useStore()
  const router = useRouter()

  const openValue = useMemo(
    () =>
      leads
        .filter((l) => l.status !== "lost" && l.status !== "won")
        .reduce((sum, l) => sum + l.potentialValue, 0),
    [leads],
  )

  const handleConvert = (lead: Lead) => {
    const projectId = convertLead(lead.id)
    toast.success(`Converted ${lead.businessName} to a project`)
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Leads"
        description="Track prospects and follow-ups before they become projects."
      >
        <AddLeadDialog onAdd={addLead} />
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Open leads</p>
              <p className="text-xl font-semibold tabular-nums">
                {leads.filter((l) => l.status !== "lost" && l.status !== "won").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Pipeline value</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatPeso(openValue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Won</p>
              <p className="text-xl font-semibold tabular-nums">
                {leads.filter((l) => l.status === "won").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {leads.length === 0 ? (
          <Empty className="rounded-lg border border-dashed py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserPlus />
              </EmptyMedia>
              <EmptyTitle>No leads yet</EmptyTitle>
              <EmptyDescription>
                Add a prospect to start tracking your sales pipeline.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {leads.map((lead) => {
              const followDays = daysUntil(lead.nextFollowUp)
              const overdue =
                lead.status !== "won" &&
                lead.status !== "lost" &&
                followDays !== null &&
                followDays < 0
              return (
                <Card key={lead.id}>
                  <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{lead.businessName}</h3>
                        <Badge variant="outline">{lead.businessType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lead.contact}
                      </p>
                      {lead.notes && (
                        <p className="text-sm text-muted-foreground">
                          {lead.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-medium tabular-nums">
                          {formatPeso(lead.potentialValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Follow-up
                        </p>
                        <p
                          className={
                            overdue
                              ? "text-sm font-medium text-destructive"
                              : "text-sm font-medium"
                          }
                        >
                          {formatDate(lead.nextFollowUp)}
                        </p>
                      </div>
                      <Select
                        value={lead.status}
                        onValueChange={(v) =>
                          updateLead(lead.id, { status: v as LeadStatus })
                        }
                        items={STAGE_ITEMS}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue>
                            <Badge variant={STATUS_VARIANT[lead.status]}>
                              {statusLabel(lead.status)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_ITEMS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvert(lead)}
                          disabled={lead.status === "won"}
                        >
                          <ArrowRightCircle data-icon="inline-start" />
                          Convert
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteLead(lead.id)}
                          aria-label="Delete lead"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AddLeadDialog({
  onAdd,
}: {
  onAdd: (lead: Omit<Lead, "id">) => void
}) {
  const [open, setOpen] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [contact, setContact] = useState("")
  const [potentialValue, setPotentialValue] = useState(0)
  const [nextFollowUp, setNextFollowUp] = useState("")
  const [notes, setNotes] = useState("")

  const reset = () => {
    setBusinessName("")
    setBusinessType("")
    setContact("")
    setPotentialValue(0)
    setNextFollowUp("")
    setNotes("")
  }

  const handleAdd = () => {
    if (!businessName.trim()) {
      toast.error("Business name is required.")
      return
    }
    onAdd({
      businessName: businessName.trim(),
      businessType: businessType.trim() || "Business",
      contact: contact.trim(),
      potentialValue,
      lastContact: new Date().toISOString().slice(0, 10),
      nextFollowUp: nextFollowUp || new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      status: "new",
    })
    toast.success("Lead added")
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus data-icon="inline-start" />
            Add Lead
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="lead-name">Business name</FieldLabel>
              <Input
                id="lead-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lead-type">Business type</FieldLabel>
              <Input
                id="lead-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Cafe, Salon, Clinic..."
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="lead-contact">Contact</FieldLabel>
            <Input
              id="lead-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Name, phone, or email"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="lead-value">Potential value (PHP)</FieldLabel>
              <Input
                id="lead-value"
                type="number"
                min={0}
                step={1000}
                value={potentialValue}
                onChange={(e) =>
                  setPotentialValue(Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lead-follow">Next follow-up</FieldLabel>
              <Input
                id="lead-follow"
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="lead-notes">Notes</FieldLabel>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleAdd}>Add Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
