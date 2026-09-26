import { NavSidebar } from '@/components/nav-sidebar'
import { PageTransition } from '@/components/page-transition'
import { StoreProvider } from '@/lib/store'
import { createClient } from '@/lib/supabase/server'
import { Project, Lead, Maintenance } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  // Fetch all user's data
  const [{ data: projectsData }, { data: leadsData }, { data: maintenanceData }] = await Promise.all([
    supabase.from('projects').select(`
      *,
      tasks (*),
      payments (*),
      project_notes (*),
      project_changes (*)
    `),
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('maintenance').select('*').order('created_at', { ascending: false })
  ])

  // Transform projects to match the client's deeply nested structure
  const projects: Project[] = (projectsData || []).map((p: any) => ({
    id: p.id,
    businessName: p.business_name,
    clientName: p.client_name,
    contact: p.contact,
    businessType: p.business_type,
    projectName: p.project_name,
    description: p.description || '',
    price: p.price,
    depositPercentage: p.deposit_percentage,
    startDate: p.start_date,
    targetDate: p.target_date,
    status: p.status,
    technical: {
      domain: p.technical_domain || '',
      hosting: p.technical_hosting || '',
      repository: p.technical_repository || '',
      techStack: p.technical_tech_stack || '',
      credentials: p.technical_credentials || ''
    },
    tasks: (p.tasks || []).map((t: any) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      done: t.done
    })),
    payments: (p.payments || []).map((pay: any) => ({
      id: pay.id,
      description: 'Payment', // Database didn't have description, fallback
      amount: pay.amount,
      dueDate: pay.due_date,
      datePaid: pay.date_paid,
      status: pay.status
    })),
    changes: (p.project_changes || []).map((c: any) => ({
      id: c.id,
      description: c.description,
      additionalCost: c.additional_cost,
      additionalDays: c.additional_days,
      date: c.date,
      status: c.status
    })),
    notes: (p.project_notes || []).map((n: any) => ({
      id: n.id,
      content: n.note,
      date: n.date
    }))
  }))

  const leads: Lead[] = (leadsData || []).map((l: any) => ({
    id: l.id,
    businessName: l.business_name,
    businessType: 'Unknown', // missing in schema but required by type
    contact: l.contact,
    potentialValue: 0, // missing in schema
    lastContact: l.last_contact || '',
    nextFollowUp: l.next_follow_up || '',
    notes: l.notes || '',
    status: l.status
  }))

  const maintenance: Maintenance[] = (maintenanceData || []).map((m: any) => ({
    id: m.id,
    client: m.client,
    website: m.website,
    plan: m.plan_type,
    monthlyFee: m.monthly_fee,
    nextBilling: m.next_billing,
    status: m.status,
    lastActivity: '' // missing in schema
  }))

  return (
    <StoreProvider
      initialProjects={projects}
      initialLeads={leads}
      initialMaintenance={maintenance}
    >
      <div className="flex min-h-screen bg-background">
        <NavSidebar />
        <main className="min-w-0 flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </StoreProvider>
  )
}
