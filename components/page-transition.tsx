"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

/**
 * Wraps page content with a subtle fade-up animation on route change.
 * Uses a key swap to force remount on navigation, guaranteeing the
 * CSS enter animation replays every time.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="page-transition-enter">
      {children}
    </div>
  )
}
