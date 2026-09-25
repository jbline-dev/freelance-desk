"use client"

import * as React from "react"
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  ChangeRequest,
  Lead,
  Maintenance,
  Note,
  Payment,
  Project,
  ProjectStatus,
  Task,
} from "@/lib/types"
import { uid } from "@/lib/format"
import { createDefaultPayments, createDefaultTasks } from "@/lib/templates"
import {
  SAMPLE_LEADS,
  SAMPLE_MAINTENANCE,
  SAMPLE_PROJECTS,
} from "@/lib/sample-data"

export interface NewProjectInput {
  businessName: string
  clientName: string
  contact: string
  businessType: string
  projectName: string
  description: string
  price: number
  depositPercentage: number
  startDate: string
  targetDate: string
  status: ProjectStatus
}

interface StoreValue {
  projects: Project[]
  leads: Lead[]
  maintenance: Maintenance[]

  addProject: (input: NewProjectInput) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  moveProject: (id: string, status: ProjectStatus) => void

  addTask: (projectId: string, task: Omit<Task, "id">) => void
  updateTask: (projectId: string, taskId: string, patch: Partial<Task>) => void
  toggleTask: (projectId: string, taskId: string) => void
  deleteTask: (projectId: string, taskId: string) => void

  addPayment: (projectId: string, payment: Omit<Payment, "id">) => void
  updatePayment: (
    projectId: string,
    paymentId: string,
    patch: Partial<Payment>,
  ) => void
  deletePayment: (projectId: string, paymentId: string) => void

  addChange: (projectId: string, change: Omit<ChangeRequest, "id">) => void
  updateChange: (
    projectId: string,
    changeId: string,
    patch: Partial<ChangeRequest>,
  ) => void
  deleteChange: (projectId: string, changeId: string) => void

  addNote: (projectId: string, content: string) => void
  deleteNote: (projectId: string, noteId: string) => void

  addLead: (lead: Omit<Lead, "id">) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  deleteLead: (id: string) => void
  convertLead: (id: string) => string

  addMaintenance: (item: Omit<Maintenance, "id">) => void
  updateMaintenance: (id: string, patch: Partial<Maintenance>) => void
  deleteMaintenance: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS)
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS)
  const [maintenance, setMaintenance] =
    useState<Maintenance[]>(SAMPLE_MAINTENANCE)

  const patchProject = (id: string, updater: (p: Project) => Project) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))

  const value = useMemo<StoreValue>(() => {
    return {
      projects,
      leads,
      maintenance,

      addProject: (input) => {
        const id = uid("proj")
        const project: Project = {
          id,
          ...input,
          tasks: createDefaultTasks(),
          payments: createDefaultPayments(
            input.price,
            input.depositPercentage,
            input.startDate,
            input.targetDate,
          ),
          changes: [],
          notes: [],
          technical: {
            domain: "",
            hosting: "",
            repository: "",
            techStack: "",
            credentials: "",
          },
        }
        setProjects((prev) => [project, ...prev])
        return id
      },
      updateProject: (id, patch) =>
        patchProject(id, (p) => ({ ...p, ...patch })),
      deleteProject: (id) =>
        setProjects((prev) => prev.filter((p) => p.id !== id)),
      moveProject: (id, status) =>
        patchProject(id, (p) => ({ ...p, status })),

      addTask: (projectId, task) =>
        patchProject(projectId, (p) => ({
          ...p,
          tasks: [...p.tasks, { ...task, id: uid("task") }],
        })),
      updateTask: (projectId, taskId, patch) =>
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t,
          ),
        })),
      toggleTask: (projectId, taskId) =>
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t,
          ),
        })),
      deleteTask: (projectId, taskId) =>
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.filter((t) => t.id !== taskId),
        })),

      addPayment: (projectId, payment) =>
        patchProject(projectId, (p) => ({
          ...p,
          payments: [...p.payments, { ...payment, id: uid("pay") }],
        })),
      updatePayment: (projectId, paymentId, patch) =>
        patchProject(projectId, (p) => ({
          ...p,
          payments: p.payments.map((pay) =>
            pay.id === paymentId ? { ...pay, ...patch } : pay,
          ),
        })),
      deletePayment: (projectId, paymentId) =>
        patchProject(projectId, (p) => ({
          ...p,
          payments: p.payments.filter((pay) => pay.id !== paymentId),
        })),

      addChange: (projectId, change) =>
        patchProject(projectId, (p) => ({
          ...p,
          changes: [...p.changes, { ...change, id: uid("chg") }],
        })),
      updateChange: (projectId, changeId, patch) =>
        patchProject(projectId, (p) => ({
          ...p,
          changes: p.changes.map((c) =>
            c.id === changeId ? { ...c, ...patch } : c,
          ),
        })),
      deleteChange: (projectId, changeId) =>
        patchProject(projectId, (p) => ({
          ...p,
          changes: p.changes.filter((c) => c.id !== changeId),
        })),

      addNote: (projectId, content) =>
        patchProject(projectId, (p) => {
          const note: Note = {
            id: uid("note"),
            content,
            date: new Date().toISOString().slice(0, 10),
          }
          return { ...p, notes: [note, ...p.notes] }
        }),
      deleteNote: (projectId, noteId) =>
        patchProject(projectId, (p) => ({
          ...p,
          notes: p.notes.filter((n) => n.id !== noteId),
        })),

      addLead: (lead) =>
        setLeads((prev) => [{ ...lead, id: uid("lead") }, ...prev]),
      updateLead: (id, patch) =>
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        ),
      deleteLead: (id) => setLeads((prev) => prev.filter((l) => l.id !== id)),
      convertLead: (id) => {
        const lead = leads.find((l) => l.id === id)
        const projectId = uid("proj")
        if (!lead) return projectId
        const today = new Date().toISOString().slice(0, 10)
        const target = new Date()
        target.setDate(target.getDate() + 30)
        const project: Project = {
          id: projectId,
          businessName: lead.businessName,
          clientName: "",
          contact: lead.contact,
          businessType: lead.businessType,
          projectName: `${lead.businessName} Website`,
          description: lead.notes,
          price: lead.potentialValue,
          depositPercentage: 40,
          startDate: today,
          targetDate: target.toISOString().slice(0, 10),
          status: "proposal",
          tasks: createDefaultTasks(),
          payments: createDefaultPayments(
            lead.potentialValue,
            40,
            today,
            target.toISOString().slice(0, 10),
          ),
          changes: [],
          notes: [],
          technical: {
            domain: "",
            hosting: "",
            repository: "",
            techStack: "",
            credentials: "",
          },
        }
        setProjects((prev) => [project, ...prev])
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "won" } : l)),
        )
        return projectId
      },

      addMaintenance: (item) =>
        setMaintenance((prev) => [{ ...item, id: uid("maint") }, ...prev]),
      updateMaintenance: (id, patch) =>
        setMaintenance((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        ),
      deleteMaintenance: (id) =>
        setMaintenance((prev) => prev.filter((m) => m.id !== id)),
    }
  }, [projects, leads, maintenance])

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function useProject(id: string): Project | undefined {
  const { projects } = useStore()
  return projects.find((p) => p.id === id)
}
