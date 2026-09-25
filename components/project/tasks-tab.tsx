"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { TASK_CATEGORIES, type Project, type TaskCategory } from "@/lib/types"
import { taskProgress } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORY_ITEMS = TASK_CATEGORIES.map((c) => ({ label: c, value: c }))

export function TasksTab({ project }: { project: Project }) {
  const { toggleTask, deleteTask, addTask } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TaskCategory>("Development")

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Task title is required.")
      return
    }
    addTask(project.id, { title: title.trim(), category, done: false })
    toast.success("Task added")
    setTitle("")
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {project.tasks.filter((t) => t.done).length} of{" "}
                {project.tasks.length} tasks complete
              </span>
              <span className="tabular-nums text-muted-foreground">
                {taskProgress(project)}%
              </span>
            </div>
            <Progress value={taskProgress(project)} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="sm:ml-4">
                  <Plus data-icon="inline-start" />
                  Add Task
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="task-title">Task</FieldLabel>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Design homepage mockup"
                    autoFocus
                  />
                </Field>
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as TaskCategory)}
                    items={CATEGORY_ITEMS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ITEMS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                <Button onClick={handleAdd}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TASK_CATEGORIES.map((cat) => {
          const items = project.tasks.filter((t) => t.category === cat)
          if (items.length === 0) return null
          return (
            <Card key={cat}>
              <CardHeader>
                <CardTitle className="text-sm">{cat}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col">
                {items.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-md px-1 py-1.5"
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.done}
                      onCheckedChange={() => toggleTask(project.id, task.id)}
                    />
                    <label
                      htmlFor={task.id}
                      className={
                        task.done
                          ? "flex-1 cursor-pointer text-sm text-muted-foreground line-through"
                          : "flex-1 cursor-pointer text-sm"
                      }
                    >
                      {task.title}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteTask(project.id, task.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
