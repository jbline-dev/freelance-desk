"use client"

import { PROJECT_STAGES } from "@/lib/types"
import { useStore } from "@/lib/store"
import { ProjectCard } from "@/components/project-card"

export function KanbanBoard() {
  const { projects } = useStore()

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3">
        {PROJECT_STAGES.map((stage) => {
          const items = projects.filter((p) => p.status === stage.value)
          return (
            <div
              key={stage.value}
              className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{stage.label}</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                    No projects
                  </p>
                ) : (
                  items.map((p) => <ProjectCard key={p.id} project={p} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
