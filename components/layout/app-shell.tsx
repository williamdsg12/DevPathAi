'use client'

import { type ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AppSidebar />
      </div>

      {/* Main Content Area with Adaptive Padding & Ultrawide Support */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 xl:p-8 scrollbar-thin">
          <div className="mx-auto max-w-[1600px] w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
