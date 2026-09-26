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
import { createDefaultPayments, createDefaultTasks } from "@/lib/templates"
import { createClient } from "@/lib/supabase/client"

/** Generate a UUID compatible with Supabase's uuid columns. */
function newId(): string {
  return crypto.randomUUID()
}

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

export function StoreProvider({ 
  children,
  initialProjects = [],
  initialLeads = [],
  initialMaintenance = [],
}: { 
  children: ReactNode
  initialProjects?: Project[]
  initialLeads?: Lead[]
  initialMaintenance?: Maintenance[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [maintenance, setMaintenance] = useState<Maintenance[]>(initialMaintenance)

  const supabase = createClient()

  const patchProject = (id: string, updater: (p: Project) => Project) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))

  const value = useMemo<StoreValue>(() => {
    return {
      projects,
      leads,
      maintenance,

      // ─── Projects ────────────────────────────────────────────
      addProject: (input) => {
        const id = newId()

        // Async save to Supabase
        ;(async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          await supabase.from('projects').insert({
            id,
            user_id: user.id,
            business_name: input.businessName,
            client_name: input.clientName,
            contact: input.contact,
            business_type: input.businessType,
            project_name: input.projectName,
            description: input.description,
            price: input.price,
            deposit_percentage: input.depositPercentage,
            status: input.status,
            start_date: input.startDate,
            target_date: input.targetDate,
          })

          const defaultTasks = createDefaultTasks()
          await supabase.from('tasks').insert(
            defaultTasks.map(t => ({
              project_id: id,
              title: t.title,
              category: t.category,
              done: false,
            }))
          )

          const defaultPayments = createDefaultPayments(
            input.price, input.depositPercentage, input.startDate, input.targetDate,
          )
          await supabase.from('payments').insert(
            defaultPayments.map(p => ({
              project_id: id,
              amount: p.amount,
              status: p.status,
              due_date: p.dueDate,
            }))
          )
        })()

        // Optimistic local update
        const project: Project = {
          id,
          ...input,
          tasks: createDefaultTasks(),
          payments: createDefaultPayments(
            input.price, input.depositPercentage, input.startDate, input.targetDate,
          ),
          changes: [],
          notes: [],
          technical: { domain: "", hosting: "", repository: "", techStack: "", credentials: "" },
        }
        setProjects((prev) => [project, ...prev])
        return id
      },

      updateProject: (id, patch) => {
        patchProject(id, (p) => ({ ...p, ...patch }))
        // Build a DB-compatible patch (snake_case keys)
        const dbPatch: Record<string, unknown> = {}
        if (patch.businessName !== undefined) dbPatch.business_name = patch.businessName
        if (patch.clientName !== undefined) dbPatch.client_name = patch.clientName
        if (patch.contact !== undefined) dbPatch.contact = patch.contact
        if (patch.businessType !== undefined) dbPatch.business_type = patch.businessType
        if (patch.projectName !== undefined) dbPatch.project_name = patch.projectName
        if (patch.description !== undefined) dbPatch.description = patch.description
        if (patch.price !== undefined) dbPatch.price = patch.price
        if (patch.depositPercentage !== undefined) dbPatch.deposit_percentage = patch.depositPercentage
        if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate
        if (patch.targetDate !== undefined) dbPatch.target_date = patch.targetDate
        if (patch.status !== undefined) dbPatch.status = patch.status
        if (patch.technical) {
          dbPatch.technical_domain = patch.technical.domain
          dbPatch.technical_hosting = patch.technical.hosting
          dbPatch.technical_repository = patch.technical.repository
          dbPatch.technical_tech_stack = patch.technical.techStack
          dbPatch.technical_credentials = patch.technical.credentials
        }
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('projects').update(dbPatch).eq('id', id).then()
        }
      },

      deleteProject: (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id))
        supabase.from('projects').delete().eq('id', id).then()
      },

      moveProject: (id, status) => {
        patchProject(id, (p) => ({ ...p, status }))
        supabase.from('projects').update({ status }).eq('id', id).then()
      },

      // ─── Tasks ───────────────────────────────────────────────
      addTask: (projectId, task) => {
        const taskId = newId()
        patchProject(projectId, (p) => ({
          ...p,
          tasks: [...p.tasks, { ...task, id: taskId }],
        }))
        supabase.from('tasks').insert({
          id: taskId,
          project_id: projectId,
          title: task.title,
          category: task.category,
          done: task.done,
        }).then()
      },

      updateTask: (projectId, taskId, patch) => {
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        }))
        const dbPatch: Record<string, unknown> = {}
        if (patch.title !== undefined) dbPatch.title = patch.title
        if (patch.category !== undefined) dbPatch.category = patch.category
        if (patch.done !== undefined) dbPatch.done = patch.done
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('tasks').update(dbPatch).eq('id', taskId).then()
        }
      },

      toggleTask: (projectId, taskId) => {
        let newDone = false
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.map((t) => {
            if (t.id === taskId) {
              newDone = !t.done
              return { ...t, done: newDone }
            }
            return t
          }),
        }))
        // We need to read the current state to get the toggled value
        // Since patchProject is synchronous, newDone is set by now
        supabase.from('tasks').update({ done: newDone }).eq('id', taskId).then()
      },

      deleteTask: (projectId, taskId) => {
        patchProject(projectId, (p) => ({
          ...p,
          tasks: p.tasks.filter((t) => t.id !== taskId),
        }))
        supabase.from('tasks').delete().eq('id', taskId).then()
      },

      // ─── Payments ────────────────────────────────────────────
      addPayment: (projectId, payment) => {
        const payId = newId()
        patchProject(projectId, (p) => ({
          ...p,
          payments: [...p.payments, { ...payment, id: payId }],
        }))
        supabase.from('payments').insert({
          id: payId,
          project_id: projectId,
          amount: payment.amount,
          status: payment.status,
          due_date: payment.dueDate,
          date_paid: payment.datePaid,
        }).then()
      },

      updatePayment: (projectId, paymentId, patch) => {
        patchProject(projectId, (p) => ({
          ...p,
          payments: p.payments.map((pay) =>
            pay.id === paymentId ? { ...pay, ...patch } : pay,
          ),
        }))
        const dbPatch: Record<string, unknown> = {}
        if (patch.amount !== undefined) dbPatch.amount = patch.amount
        if (patch.status !== undefined) dbPatch.status = patch.status
        if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate
        if (patch.datePaid !== undefined) dbPatch.date_paid = patch.datePaid
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('payments').update(dbPatch).eq('id', paymentId).then()
        }
      },

      deletePayment: (projectId, paymentId) => {
        patchProject(projectId, (p) => ({
          ...p,
          payments: p.payments.filter((pay) => pay.id !== paymentId),
        }))
        supabase.from('payments').delete().eq('id', paymentId).then()
      },

      // ─── Change Requests ─────────────────────────────────────
      addChange: (projectId, change) => {
        const changeId = newId()
        patchProject(projectId, (p) => ({
          ...p,
          changes: [...p.changes, { ...change, id: changeId }],
        }))
        supabase.from('project_changes').insert({
          id: changeId,
          project_id: projectId,
          description: change.description,
          additional_cost: change.additionalCost,
          additional_days: change.additionalDays,
          date: change.date,
          status: change.status,
        }).then()
      },

      updateChange: (projectId, changeId, patch) => {
        patchProject(projectId, (p) => ({
          ...p,
          changes: p.changes.map((c) =>
            c.id === changeId ? { ...c, ...patch } : c,
          ),
        }))
        const dbPatch: Record<string, unknown> = {}
        if (patch.description !== undefined) dbPatch.description = patch.description
        if (patch.additionalCost !== undefined) dbPatch.additional_cost = patch.additionalCost
        if (patch.additionalDays !== undefined) dbPatch.additional_days = patch.additionalDays
        if (patch.date !== undefined) dbPatch.date = patch.date
        if (patch.status !== undefined) dbPatch.status = patch.status
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('project_changes').update(dbPatch).eq('id', changeId).then()
        }
      },

      deleteChange: (projectId, changeId) => {
        patchProject(projectId, (p) => ({
          ...p,
          changes: p.changes.filter((c) => c.id !== changeId),
        }))
        supabase.from('project_changes').delete().eq('id', changeId).then()
      },

      // ─── Notes ───────────────────────────────────────────────
      addNote: (projectId, content) => {
        const noteId = newId()
        const date = new Date().toISOString().slice(0, 10)
        const note: Note = { id: noteId, content, date }
        patchProject(projectId, (p) => ({ ...p, notes: [note, ...p.notes] }))
        supabase.from('project_notes').insert({
          id: noteId,
          project_id: projectId,
          note: content,
          date,
        }).then()
      },

      deleteNote: (projectId, noteId) => {
        patchProject(projectId, (p) => ({
          ...p,
          notes: p.notes.filter((n) => n.id !== noteId),
        }))
        supabase.from('project_notes').delete().eq('id', noteId).then()
      },

      // ─── Leads ───────────────────────────────────────────────
      addLead: (lead) => {
        const id = newId()
        setLeads((prev) => [{ ...lead, id }, ...prev])
        ;(async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          await supabase.from('leads').insert({
            id,
            user_id: user.id,
            business_name: lead.businessName,
            client_name: lead.businessType, // mapped from businessType since Lead has no clientName in DB
            contact: lead.contact,
            status: lead.status,
            last_contact: lead.lastContact || null,
            next_follow_up: lead.nextFollowUp || null,
            notes: lead.notes || null,
          })
        })()
      },

      updateLead: (id, patch) => {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        )
        const dbPatch: Record<string, unknown> = {}
        if (patch.businessName !== undefined) dbPatch.business_name = patch.businessName
        if (patch.contact !== undefined) dbPatch.contact = patch.contact
        if (patch.status !== undefined) dbPatch.status = patch.status
        if (patch.lastContact !== undefined) dbPatch.last_contact = patch.lastContact
        if (patch.nextFollowUp !== undefined) dbPatch.next_follow_up = patch.nextFollowUp
        if (patch.notes !== undefined) dbPatch.notes = patch.notes
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('leads').update(dbPatch).eq('id', id).then()
        }
      },

      deleteLead: (id) => {
        setLeads((prev) => prev.filter((l) => l.id !== id))
        supabase.from('leads').delete().eq('id', id).then()
      },

      convertLead: (id) => {
        const lead = leads.find((l) => l.id === id)
        const projectId = newId()
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
            lead.potentialValue, 40, today, target.toISOString().slice(0, 10),
          ),
          changes: [],
          notes: [],
          technical: { domain: "", hosting: "", repository: "", techStack: "", credentials: "" },
        }
        setProjects((prev) => [project, ...prev])
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "won" } : l)),
        )

        // Persist the converted project and lead status
        ;(async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          await supabase.from('projects').insert({
            id: projectId,
            user_id: user.id,
            business_name: project.businessName,
            client_name: project.clientName,
            contact: project.contact,
            business_type: project.businessType,
            project_name: project.projectName,
            description: project.description,
            price: project.price,
            deposit_percentage: project.depositPercentage,
            status: project.status,
            start_date: project.startDate,
            target_date: project.targetDate,
          })
          await supabase.from('leads').update({ status: 'won' }).eq('id', id)
        })()

        return projectId
      },

      // ─── Maintenance ─────────────────────────────────────────
      addMaintenance: (item) => {
        const id = newId()
        setMaintenance((prev) => [{ ...item, id }, ...prev])
        ;(async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          await supabase.from('maintenance').insert({
            id,
            user_id: user.id,
            client: item.client,
            website: item.website,
            plan_type: item.plan,
            monthly_fee: item.monthlyFee,
            status: item.status,
            next_billing: item.nextBilling,
            tasks: [], // placeholder
          })
        })()
      },

      updateMaintenance: (id, patch) => {
        setMaintenance((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        )
        const dbPatch: Record<string, unknown> = {}
        if (patch.client !== undefined) dbPatch.client = patch.client
        if (patch.website !== undefined) dbPatch.website = patch.website
        if (patch.plan !== undefined) dbPatch.plan_type = patch.plan
        if (patch.monthlyFee !== undefined) dbPatch.monthly_fee = patch.monthlyFee
        if (patch.status !== undefined) dbPatch.status = patch.status
        if (patch.nextBilling !== undefined) dbPatch.next_billing = patch.nextBilling
        if (Object.keys(dbPatch).length > 0) {
          supabase.from('maintenance').update(dbPatch).eq('id', id).then()
        }
      },

      deleteMaintenance: (id) => {
        setMaintenance((prev) => prev.filter((m) => m.id !== id))
        supabase.from('maintenance').delete().eq('id', id).then()
      },
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
