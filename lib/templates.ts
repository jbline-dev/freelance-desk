import type { Payment, Task, TaskCategory } from "@/lib/types"
import { uid } from "@/lib/format"

const TEMPLATE: { category: TaskCategory; items: string[] }[] = [
  {
    category: "Discovery",
    items: ["Requirements confirmed", "Website goals defined"],
  },
  {
    category: "Content",
    items: [
      "Logo received",
      "Business information received",
      "Images received",
      "Services/products received",
    ],
  },
  {
    category: "Design",
    items: [
      "Design direction confirmed",
      "Homepage completed",
      "Mobile layout completed",
    ],
  },
  {
    category: "Development",
    items: [
      "Pages implemented",
      "Forms implemented",
      "Backend implemented",
      "Database configured if required",
    ],
  },
  {
    category: "Testing",
    items: [
      "Mobile testing",
      "Desktop testing",
      "Forms tested",
      "Security check",
      "Performance check",
    ],
  },
  {
    category: "Deployment",
    items: [
      "Domain configured",
      "Hosting configured",
      "HTTPS enabled",
      "Website deployed",
      "Backup created",
    ],
  },
  {
    category: "Handover",
    items: [
      "Final payment received",
      "Client approval received",
      "Credentials transferred",
      "Warranty recorded",
    ],
  },
]

export function createDefaultTasks(): Task[] {
  return TEMPLATE.flatMap((group) =>
    group.items.map((title) => ({
      id: uid("task"),
      category: group.category,
      title,
      done: false,
    })),
  )
}

export function createDefaultPayments(
  price: number,
  depositPercentage: number,
  startDate: string,
  targetDate: string,
): Payment[] {
  const deposit = Math.round((price * depositPercentage) / 100)
  const balance = price - deposit
  return [
    {
      id: uid("pay"),
      description: `Deposit (${depositPercentage}%)`,
      amount: deposit,
      dueDate: startDate,
      datePaid: null,
      status: "pending",
    },
    {
      id: uid("pay"),
      description: `Final payment (${100 - depositPercentage}%)`,
      amount: balance,
      dueDate: targetDate,
      datePaid: null,
      status: "pending",
    },
  ]
}
