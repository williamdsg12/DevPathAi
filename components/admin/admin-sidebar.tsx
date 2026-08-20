'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GitFork,
  Brain,
  Code2,
  CheckSquare,
  Award,
  CreditCard,
  BarChart3,
  Settings,
  History,
  ShieldCheck,
  Sparkles,
  BookMarked,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { YoutubeIcon } from '@/components/icons'
import { useAppStore } from '@/lib/store'
import { getUserRole } from '@/lib/auth/rbac'
import { Badge } from '@/components/ui/badge'

export interface NavSection {
  title: string
  items: Array<{
    title: string
    href: string
    icon: any
    badge?: string
    badgeColor?: string
    requiredPermission?: string
  }>
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Analytics & Relatórios', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { title: 'Catálogo de Cursos', href: '/admin/cursos', icon: BookOpen },
      { title: 'Trilhas de Aprendizagem', href: '/admin/trilhas', icon: GitFork },
      { title: 'Atividades Práticas', href: '/admin/atividades', icon: CheckSquare },
      { title: 'Avaliações de Módulo', href: '/admin/avaliacoes', icon: Award },
      { title: 'Desafios & Projetos', href: '/admin/desafios', icon: Code2 },
    ],
  },
  {
    title: 'Inteligência Artificial',
    items: [
      { title: 'AI Core & Instruções', href: '/admin/ai', icon: Brain },
      { title: 'Base de Conhecimento RAG', href: '/admin/ai/conhecimento', icon: BookMarked },
      { title: 'Playground & Testes', href: '/admin/ai/playground', icon: Sparkles },
    ],
  },
  {
    title: 'Curadoria',
    items: [
      { title: 'YouTube & Canais', href: '/admin/youtube', icon: YoutubeIcon, badge: 'SYNC', badgeColor: 'bg-red-500/20 text-red-300' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { title: 'Usuários & Permissões', href: '/admin/usuarios', icon: Users },
      { title: 'Assinaturas & Faturamento', href: '/admin/assinaturas', icon: Layers },
      { title: 'Financeiro SaaS', href: '/admin/financeiro', icon: CreditCard },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { title: 'Logs & Auditoria', href: '/admin/logs', icon: History },
      { title: 'Configurações', href: '/admin/configuracoes', icon: Settings },
    ],
  },
]

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const { profile } = useAppStore()
  const role = getUserRole(profile)

  return (
    <aside className="w-64 h-screen bg-[#0d0c17] border-r border-white/5 flex flex-col justify-between shrink-0 select-none overflow-hidden">
      {/* Brand Header */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 bg-[#100f1c] shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 grid place-items-center shadow-lg shadow-violet-950/60 border border-violet-400/30">
              <ShieldCheck className="size-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                DEVPATH <span className="text-violet-400 text-xs font-mono font-bold">ADMIN</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono block leading-none">
                SaaS Management Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {section.title}
              </span>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/25 shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`size-4 shrink-0 transition-colors ${
                            isActive ? 'text-violet-400' : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono px-1.5 py-0 h-4 border-0 font-bold ${
                            item.badgeColor || 'bg-white/10 text-zinc-300'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Role */}
      <div className="p-3 border-t border-white/5 bg-[#100f1c] shrink-0">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-lg bg-violet-600/30 border border-violet-500/30 grid place-items-center text-xs font-bold text-violet-300 shrink-0">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white truncate block">
                {profile?.name || 'Administrador'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono truncate block">
                {role}
              </span>
            </div>
          </div>
          <Link href="/" target="_blank" title="Ver Plataforma do Aluno">
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              <ExternalLink className="size-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
