'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  Repeat,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { YoutubeIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  adminOnly?: boolean
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'PLATAFORMA',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/trilha', label: 'Minha Trilha', icon: Map },
      { href: '/cursos', label: 'Cursos', icon: BookOpen },
      { href: '/projetos', label: 'Projetos', icon: FolderGit2 },
      { href: '/exercicios', label: 'Atividades', icon: CheckCircle2 },
      { href: '/avaliacoes/mod-logica', label: 'Avaliações', icon: Target },
      { href: '/estudo', label: 'Meu Progresso', icon: GraduationCap },
      { href: '/certificados', label: 'Conquistas', icon: Trophy },
    ],
  },
  {
    title: 'MENTORIA & FERRAMENTAS',
    items: [
      { href: '/mentor', label: 'DevMentor AI', icon: Bot, badge: 'AI' },
      { href: '/code-lab', label: 'Code Lab', icon: Code2, badge: 'IDE' },
      { href: '/perfil', label: 'Perfil', icon: User },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/cursos/importar', label: 'Importar YouTube', icon: YoutubeIcon, adminOnly: true },
      { href: '/admin', label: 'Painel Admin', icon: ShieldCheck, adminOnly: true },
    ],
  },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut, xp, level, streak, isSuperAdmin } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-white/5 bg-[#0a0910]/95 backdrop-blur-2xl text-foreground transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 overflow-hidden">
          {collapsed ? (
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-sm">
              DP
            </div>
          ) : (
            <Logo />
          )}
        </Link>

        {/* Collapse toggle (Desktop only) */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:grid size-7 place-items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* User Progress Mini Card */}
      {!collapsed && (
        <div className="p-3.5 border-b border-white/5">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-transparent p-3 shadow-inner">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  Nível {level}
                </span>
              </div>
              <p className="text-sm font-black text-white">
                {xp.toLocaleString('pt-BR')} <span className="text-xs font-semibold text-violet-400/80">XP</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
              <span>🔥</span>
              <span>{streak}d</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 scrollbar-thin">
        {navSections
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => (!item.adminOnly ? true : isSuperAdmin)),
          }))
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <div key={section.title} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'group relative flex items-center rounded-xl py-2.5 font-semibold text-xs sm:text-sm transition-all duration-200',
                          collapsed ? 'justify-center px-0' : 'justify-between px-3',
                          isActive
                            ? 'bg-gradient-to-r from-violet-600/90 to-purple-600/90 text-white shadow-lg shadow-purple-600/20 border border-violet-400/30 font-bold'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                        )}
                      >
                        {/* Active Left Indicator Bar */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white shadow-[0_0_8px_white]" />
                        )}

                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'size-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isActive ? 'text-white' : 'text-zinc-400 group-hover:text-violet-400'
                            )}
                          />
                          {!collapsed && <span>{item.label}</span>}
                        </div>

                        {!collapsed && item.badge ? (
                          <Badge
                            variant={isActive ? 'outline' : 'secondary'}
                            className={cn(
                              'text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md',
                              isActive
                                ? 'border-white/30 text-white bg-white/10'
                                : 'bg-violet-950/60 border border-violet-500/30 text-violet-300'
                            )}
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="border-t border-white/5 p-3">
        <div
          className={cn(
            'flex items-center rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors',
            collapsed ? 'justify-center p-2' : 'justify-between p-2 gap-2'
          )}
        >
          <Link
            href="/perfil"
            onClick={onNavigate}
            className={cn('flex items-center gap-2.5 min-w-0', collapsed ? 'justify-center' : 'flex-1')}
            title="Meu Perfil"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-black text-white shadow-sm">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'DV'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 truncate text-left">
                <p className="truncate text-xs font-bold text-zinc-100">{profile?.name || 'Desenvolvedor'}</p>
                <p className="truncate text-[10px] text-zinc-400">{profile?.email || 'aluno@devpath.ai'}</p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sair da conta"
              className="grid size-8 shrink-0 place-items-center rounded-xl text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
