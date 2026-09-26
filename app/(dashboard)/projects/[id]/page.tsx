"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2, FileQuestion } from "lucide-react"
import { toast } from "sonner"
import { useProject, useStore } from "@/lib/store"
import { PROJECT_STAGES, type ProjectStatus } from "@/lib/types"
import {
  amountPaid,
  formatPeso,
  projectRevenue,
  remainingBalance,
  taskProgress,
} from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OverviewTab } from "@/components/project/overview-tab"
import { TasksTab } from "@/components/project/tasks-tab"
import { PaymentsTab } from "@/components/project/payments-tab"
import { ChangesTab } from "@/components/project/changes-tab"
import { TechnicalTab } from "@/components/project/technical-tab"
import { NotesTab } from "@/components/project/notes-tab"

const STAGE_ITEMS = PROJECT_STAGES.map((s) => ({ label: s.label, value: s.value }))

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const project = useProject(params.id)
  const { moveProject, deleteProject } = useStore()

  const summary = project
    ? [
        { label: "Contract", value: formatPeso(projectRevenue(project)) },
        { label: "Paid", value: formatPeso(amountPaid(project)) },
        { label: "Remaining", value: formatPeso(remainingBalance(project)) },
        { label: "Tasks", value: `${taskProgress(project)}%` },
      ]
    : []

  if (!project) {
    return (
      <div className="p-6">
        <Empty className="rounded-lg border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Project not found</EmptyTitle>
            <EmptyDescription>
              This project may have been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/projects" />}>Back to Projects</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const handleDelete = () => {
    deleteProject(project.id)
    toast.success("Project deleted")
    router.push("/projects")
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={project.businessName} description={project.projectName}>
        <Button variant="outline" size="icon" render={<Link href="/projects" />} aria-label="Back">
          <ArrowLeft />
        </Button>
        <Select
          value={project.status}
          onValueChange={(v) => moveProject(project.id, v as ProjectStatus)}
          items={STAGE_ITEMS}
        >
          <SelectTrigger className="w-44">
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
        <DeleteDialog onConfirm={handleDelete} name={project.businessName} />
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summary.map((s) => (
            <Card key={s.label}>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold tabular-nums">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full overflow-x-auto sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <OverviewTab project={project} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-4">
            <TasksTab project={project} />
          </TabsContent>
          <TabsContent value="payments" className="mt-4">
            <PaymentsTab project={project} />
          </TabsContent>
          <TabsContent value="changes" className="mt-4">
            <ChangesTab project={project} />
          </TabsContent>
          <TabsContent value="technical" className="mt-4">
            <TechnicalTab project={project} />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <NotesTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DeleteDialog({
  onConfirm,
  name,
}: {
  onConfirm: () => void
  name: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="icon" aria-label="Delete project">
            <Trash2 />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            {`This permanently removes "${name}" and all of its tasks, payments, and notes.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
