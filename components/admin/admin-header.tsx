'use client'

import Link from 'next/link'
import {
  Menu,
  Bell,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { getUserRole } from '@/lib/auth/rbac'

export function AdminHeader({
  title,
  subtitle,
  onOpenMobile,
}: {
  title?: string
  subtitle?: string
  onOpenMobile?: () => void
}) {
  const { profile } = useAppStore()
  const role = getUserRole(profile)

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-white/5 bg-[#0e0c18]/95 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Breadcrumbs & Dynamic Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Sidebar Trigger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Menu de navegação"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-bold hidden sm:inline">
              Administração
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {title || 'Painel de Controle'}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Operational Status & Essential Actions */}
      <div className="flex items-center gap-3">
        {/* Subtle Operational Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] font-bold">OPERACIONAL</span>
        </div>

        {/* View Student Platform CTA */}
        <Link href="/" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-zinc-300 hover:text-white rounded-xl gap-1.5 h-8 px-3 border-white/10 bg-black/30 hover:bg-white/5"
          >
            <span className="hidden sm:inline">Plataforma</span>
            <ExternalLink className="size-3 text-zinc-400" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
