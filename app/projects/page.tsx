"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Search, FolderOpen } from "lucide-react"
import { useStore } from "@/lib/store"
import { PROJECT_STAGES, type ProjectStatus } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { ProjectCard } from "@/components/project-card"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const FILTER_ITEMS = [
  { label: "All stages", value: "all" },
  ...PROJECT_STAGES.map((s) => ({ label: s.label, value: s.value })),
]

export default function ProjectsPage() {
  const { projects } = useStore()
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<string>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      const matchesStage = stage === "all" || p.status === stage
      const matchesQuery =
        q === "" ||
        p.businessName.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.businessType.toLowerCase().includes(q)
      return matchesStage && matchesQuery
    })
  }, [projects, query, stage])

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Projects"
        description={`${projects.length} total project${projects.length === 1 ? "" : "s"}`}
      >
        <AddProjectDialog />
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by business, client, or type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={stage}
            onValueChange={(v) => setStage(v as ProjectStatus | "all")}
            items={FILTER_ITEMS}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Empty className="rounded-lg border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>No projects found</EmptyTitle>
              <EmptyDescription>
                {projects.length === 0
                  ? "Create your first project to get started."
                  : "Try adjusting your search or filter."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddProjectDialog />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
