export type ProjectStatus =
  | "lead"
  | "proposal"
  | "deposit_paid"
  | "building"
  | "client_review"
  | "final_payment"
  | "deployment"
  | "warranty"
  | "maintenance"
  | "completed"

export const PROJECT_STAGES: { value: ProjectStatus; label: string }[] = [
  { value: "lead", label: "Leads" },
  { value: "proposal", label: "Proposal" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "building", label: "Building" },
  { value: "client_review", label: "Client Review" },
  { value: "final_payment", label: "Final Payment" },
  { value: "deployment", label: "Deployment" },
  { value: "warranty", label: "Warranty" },
  { value: "maintenance", label: "Maintenance" },
  { value: "completed", label: "Completed" },
]

export type TaskCategory =
  | "Discovery"
  | "Content"
  | "Design"
  | "Development"
  | "Testing"
  | "Deployment"
  | "Handover"

export const TASK_CATEGORIES: TaskCategory[] = [
  "Discovery",
  "Content",
  "Design",
  "Development",
  "Testing",
  "Deployment",
  "Handover",
]

export interface Task {
  id: string
  category: TaskCategory
  title: string
  done: boolean
}

export type PaymentStatus = "pending" | "paid"

export interface Payment {
  id: string
  description: string
  amount: number
  dueDate: string
  datePaid: string | null
  status: PaymentStatus
}

export type ChangeStatus = "pending" | "approved" | "rejected"

export interface ChangeRequest {
  id: string
  description: string
  additionalCost: number
  additionalDays: number
  date: string
  status: ChangeStatus
}

export interface Note {
  id: string
  content: string
  date: string
}

export interface Technical {
  domain: string
  hosting: string
  repository: string
  techStack: string
  credentials: string
}

export interface Project {
  id: string
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
  tasks: Task[]
  payments: Payment[]
  changes: ChangeRequest[]
  notes: Note[]
  technical: Technical
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "proposal_sent"
  | "won"
  | "lost"

export const LEAD_STAGES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

export interface Lead {
  id: string
  businessName: string
  businessType: string
  contact: string
  potentialValue: number
  lastContact: string
  nextFollowUp: string
  notes: string
  status: LeadStatus
}

export type MaintenanceStatus = "active" | "paused" | "cancelled"

export interface Maintenance {
  id: string
  client: string
  website: string
  plan: string
  monthlyFee: number
  nextBilling: string
  status: MaintenanceStatus
  lastActivity: string
}
