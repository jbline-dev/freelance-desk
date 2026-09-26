# Freelance Desk

A personal freelance project management dashboard for solo web developers. Track website projects, clients, payments, leads, and maintenance plans — all in one place.

Built with **Next.js 16**, **Supabase**, and **Tailwind CSS 4**.

## Features

- **Project Management** — Track projects through 10 stages (Lead → Proposal → Building → Deployment → Completed) with tasks, payments, change requests, and notes per project.
- **Lead Tracking** — Manage potential clients with follow-up dates and convert them into full projects with one click.
- **Maintenance Plans** — Monitor recurring maintenance clients, billing dates, and plan types.
- **Dashboard Overview** — At-a-glance stats: active projects, revenue, upcoming payments, and task progress.
- **Authentication** — Secure login via Supabase Auth with row-level security (only you can see your data).
- **Persistent Data** — All data is stored in Supabase (PostgreSQL). No more losing data on refresh.
- **Responsive Design** — Works on desktop and mobile with a collapsible sidebar navigation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) |
| Backend / Auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| Icons | [Lucide React](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/jbline-dev/freelance-desk.git
cd freelance-desk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard under **Settings → API**.

### 4. Set up the database

Go to your Supabase Dashboard → **SQL Editor** and run the schema script to create the required tables (`projects`, `tasks`, `payments`, `leads`, `maintenance`, etc.) with row-level security policies.

> The full SQL schema is available in the project's setup documentation.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page. Sign up or create a user in your Supabase Dashboard to get started.

## Project Structure

```
app/
├── (dashboard)/          # Protected routes (sidebar layout)
│   ├── layout.tsx        # Fetches data from Supabase, wraps with StoreProvider
│   ├── page.tsx          # Dashboard overview
│   ├── projects/         # Projects list + detail pages
│   ├── leads/            # Leads management
│   └── maintenance/      # Maintenance plans
├── login/                # Public login/signup page
├── layout.tsx            # Root layout (global styles, Toaster)
└── globals.css           # Design tokens, theme, animations
components/
├── nav-sidebar.tsx       # Sidebar navigation + logout
├── page-transition.tsx   # Route change animations
├── add-project-dialog.tsx
└── ui/                   # Reusable UI components (shadcn)
lib/
├── store.tsx             # Client state + Supabase sync (optimistic updates)
├── supabase/             # Supabase client/server/middleware helpers
├── types.ts              # TypeScript interfaces
├── format.ts             # Formatting utilities (currency, dates)
└── templates.ts          # Default tasks/payments for new projects
middleware.ts             # Auth guard (redirects unauthenticated users to /login)
```

## License

This project is private and intended for personal use.
