"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useStore, type NewProjectInput } from "@/lib/store"
import { PROJECT_STAGES, type ProjectStatus } from "@/lib/types"
import { formatPeso } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BUSINESS_TYPES = [
  "Restaurant / Cafe",
  "Retail / E-commerce",
  "Healthcare",
  "Services",
  "Fitness",
  "Travel / Tourism",
  "Real Estate",
  "Education",
  "Professional Services",
  "Other",
]

const TYPE_ITEMS = BUSINESS_TYPES.map((t) => ({ label: t, value: t }))
const STAGE_ITEMS = PROJECT_STAGES.filter((s) => s.value !== "lead").map((s) => ({
  label: s.label,
  value: s.value,
}))

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function plusDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function AddProjectDialog({
  trigger,
}: {
  trigger?: React.ReactElement
}) {
  const router = useRouter()
  const { addProject } = useStore()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState<NewProjectInput>({
    businessName: "",
    clientName: "",
    contact: "",
    businessType: "Restaurant / Cafe",
    projectName: "",
    description: "",
    price: 15000,
    depositPercentage: 40,
    startDate: todayISO(),
    targetDate: plusDaysISO(30),
    status: "proposal",
  })

  const set = <K extends keyof NewProjectInput>(
    key: K,
    value: NewProjectInput[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const deposit = Math.round((form.price * form.depositPercentage) / 100)
  const balance = form.price - deposit

  const handleAdd = () => {
    if (!form.businessName.trim()) {
      toast.error("Business name is required.")
      return
    }
    const projectName = form.projectName.trim() || `${form.businessName} Website`
    const id = addProject({ ...form, projectName })
    toast.success("Project created", {
      description: "A task checklist and payment schedule were generated.",
    })
    setOpen(false)
    router.push(`/projects/${id}`)
    
    // Reset form after short delay
    setTimeout(() => {
      setForm({
        businessName: "",
        clientName: "",
        contact: "",
        businessType: "Restaurant / Cafe",
        projectName: "",
        description: "",
        price: 15000,
        depositPercentage: 40,
        startDate: todayISO(),
        targetDate: plusDaysISO(30),
        status: "proposal",
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus data-icon="inline-start" />
              New Project
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Client & Business</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="businessName">Business name</FieldLabel>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                      placeholder="Bloom Cafe"
                      autoFocus
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="clientName">Client name</FieldLabel>
                    <Input
                      id="clientName"
                      value={form.clientName}
                      onChange={(e) => set("clientName", e.target.value)}
                      placeholder="Maria Santos"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="contact">Contact (email or phone)</FieldLabel>
                    <Input
                      id="contact"
                      value={form.contact}
                      onChange={(e) => set("contact", e.target.value)}
                      placeholder="maria@bloomcafe.ph"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Business type</FieldLabel>
                    <Select
                      value={form.businessType}
                      onValueChange={(v) => set("businessType", v as string)}
                      items={TYPE_ITEMS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_ITEMS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Project</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="projectName">Project name</FieldLabel>
                    <Input
                      id="projectName"
                      value={form.projectName}
                      onChange={(e) => set("projectName", e.target.value)}
                      placeholder="Bloom Cafe Website"
                    />
                    <FieldDescription>Leave blank to use business name.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Starting stage</FieldLabel>
                    <Select
                      value={form.status}
                      onValueChange={(v) => set("status", v as ProjectStatus)}
                      items={STAGE_ITEMS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_ITEMS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Scope, pages, and goals for the website..."
                    rows={2}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Pricing & Timeline</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="price">Project price (PHP)</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step={500}
                      value={form.price}
                      onChange={(e) => set("price", Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="deposit">Deposit %</FieldLabel>
                    <Input
                      id="deposit"
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={form.depositPercentage}
                      onChange={(e) =>
                        set(
                          "depositPercentage",
                          Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                        )
                      }
                    />
                    <FieldDescription>
                      Deposit {formatPeso(deposit)} · Balance {formatPeso(balance)}
                    </FieldDescription>
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="targetDate">Target completion</FieldLabel>
                    <Input
                      id="targetDate"
                      type="date"
                      value={form.targetDate}
                      onChange={(e) => set("targetDate", e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleAdd}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
