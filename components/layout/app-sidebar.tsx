'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
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
    title: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/trilha', label: 'Minha Trilha', icon: Map },
      { href: '/cursos', label: 'Cursos & Aulas', icon: BookOpen },
      { href: '/estudo', label: 'Estudo de Hoje', icon: Target, badge: 'Foco' },
    ],
  },
  {
    title: 'Prática & Validação',
    items: [
      { href: '/exercicios', label: 'Exercícios', icon: CheckCircle2 },
      { href: '/code-lab', label: 'Code Lab', icon: Code2, badge: 'IDE' },
      { href: '/projetos', label: 'Projetos', icon: FolderGit2 },
      { href: '/revisoes', label: 'Revisões', icon: Repeat },
    ],
  },
  {
    title: 'IA & Mentoria',
    items: [
      { href: '/mentor', label: 'DevMentor AI', icon: Bot, badge: 'AI' },
      { href: '/carreira/entrevista', label: 'Entrevista IA', icon: Sparkles },
    ],
  },
  {
    title: 'Carreira & Conquistas',
    items: [
      { href: '/carreira', label: 'Carreira Dev', icon: Briefcase },
      { href: '/certificados', label: 'Certificados', icon: Award },
      { href: '/perfil', label: 'Meu Perfil', icon: User },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { href: '/cursos/importar', label: 'Importar YouTube', icon: YoutubeIcon },
      { href: '/admin', label: 'Painel Admin', icon: ShieldCheck, adminOnly: true },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut, xp, level, streak } = useAppStore()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>

      {/* User Progress Mini Badge */}
      <div className="border-b border-border/60 p-4">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nível {level}
            </p>
            <p className="text-sm font-bold text-foreground">{xp.toLocaleString('pt-BR')} XP</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning">
            <span>🔥</span>
            <span>{streak}d</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('size-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <Badge
                          variant={isActive ? 'outline' : 'secondary'}
                          className={cn(
                            'text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5',
                            isActive ? 'border-primary-foreground/30 text-primary-foreground' : 'bg-primary/10 text-primary'
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
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-muted/60 transition-colors">
          <Link href="/perfil" onClick={onNavigate} className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'DV'}
            </div>
            <div className="min-w-0 flex-1 truncate">
              <p className="truncate text-xs font-semibold text-foreground">{profile?.name || 'Desenvolvedor'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{profile?.email || 'aluno@devpath.ai'}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title="Sair da conta"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
