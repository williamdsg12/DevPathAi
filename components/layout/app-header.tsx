'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Bell,
  Check,
  ChevronRight,
  Command,
  Flame,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/logo'
import { useAppStore } from '@/lib/store'
import { AppSidebar } from './app-sidebar'
import { CommandMenu } from './command-menu'

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, signOut, notifications, markNotificationAsRead, clearAllNotifications, streak, xp, level } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [greeting, setGreeting] = useState('Olá')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('Bom dia')
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde')
    else setGreeting('Boa noite')
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Desenvolvedor'

  // XP needed for next level calculation
  const nextLevelXp = level * 1000
  const xpInCurrentLevel = xp % 1000
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 1000) * 100))

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#09090e]/85 px-4 sm:px-6 backdrop-blur-2xl">
        {/* Left: Mobile Trigger & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400 hover:text-white" aria-label="Abrir menu lateral">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-72 bg-[#0d0c14] border-r border-white/10">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
            <Link
              href="/dashboard"
              className="font-semibold text-zinc-400 hover:text-violet-400 transition-colors shrink-0"
            >
              Plataforma
            </Link>
            {title ? (
              <>
                <ChevronRight className="size-3 text-zinc-600 shrink-0" />
                <span className="font-bold text-white truncate text-xs sm:text-sm">{title}</span>
              </>
            ) : (
              <>
                <ChevronRight className="size-3 text-zinc-600 shrink-0" />
                <span className="font-bold text-white text-xs sm:text-sm">Dashboard</span>
              </>
            )}
          </nav>
        </div>

        {/* Center: Command Palette Trigger Search Bar */}
        <div
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center max-w-sm w-full mx-4 cursor-pointer"
        >
          <div className="relative w-full flex items-center justify-between h-9 px-3 text-xs bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/40 rounded-xl text-zinc-400 transition-all shadow-inner group">
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-zinc-500 group-hover:text-violet-400 transition-colors" />
              <span>Buscar aulas, cursos, IA...</span>
            </div>
            <kbd className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              <Command className="size-2.5" /> K
            </kbd>
          </div>
        </div>

        {/* Right: User Greeting, Stats, Notifications, Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Personalized Greeting */}
          <span className="hidden xl:inline text-xs font-semibold text-zinc-300">
            {greeting}, <strong className="text-white font-bold">{firstName}</strong> 👋
          </span>

          {/* Unified Compact Streak & Level/XP Widget with Tooltip Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-950/40 hover:bg-violet-900/40 px-3 py-1.5 text-xs font-bold text-violet-200 transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    <Flame className="size-3.5 fill-amber-400" />
                    <span>{streak}d</span>
                  </div>
                  <span className="text-zinc-600 font-normal">|</span>
                  <div className="flex items-center gap-1 text-violet-300">
                    <Sparkles className="size-3 text-violet-400" />
                    <span>Nv {level}</span>
                  </div>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 p-4 bg-[#12111d] border-white/10 text-white shadow-2xl rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Estatísticas do Aluno</span>
                <Badge className="bg-violet-600 text-white text-[10px] font-bold">Nível {level}</Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-400">Experiência (XP)</span>
                  <span className="text-violet-400 font-mono">{xp.toLocaleString('pt-BR')} XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${xpProgressPercent}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  Faltam {1000 - xpInCurrentLevel} XP para o Nível {level + 1}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 flex items-center gap-2.5 text-xs text-amber-300">
                <Flame className="size-5 fill-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">{streak} {streak === 1 ? 'dia' : 'dias'} de consistência</p>
                  <p className="text-[10px] text-amber-400/80">Estude hoje para manter seu streak ativo!</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="relative rounded-xl text-zinc-400 hover:text-white hover:bg-white/5" aria-label="Notificações">
                  <Bell className="size-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute top-2 right-2 flex size-2 items-center justify-center rounded-full bg-violet-500 animate-pulse" />
                  ) : null}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-80 p-2 bg-[#12111d] border-white/10 text-white shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Notificações</span>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Marcar todas lidas
                  </button>
                ) : null}
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto p-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-zinc-500">Nenhuma notificação no momento.</p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="flex flex-col items-start gap-1 p-2.5 cursor-pointer rounded-xl hover:bg-white/5 focus:bg-white/5"
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="text-xs font-bold text-zinc-100">{n.title}</span>
                        {!n.read ? <span className="size-1.5 rounded-full bg-violet-400" /> : null}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{n.message}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-xs font-black text-white shadow-md shadow-purple-500/20 border border-violet-400/30 hover:scale-105 transition-transform cursor-pointer"
                >
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'DV'}
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 p-2 bg-[#12111d] border-white/10 text-white shadow-2xl rounded-2xl">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-xs font-bold text-white truncate">{profile?.name || 'Desenvolvedor'}</p>
                <p className="text-[11px] text-zinc-400 truncate">{profile?.email || 'aluno@devpath.ai'}</p>
              </div>
              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => router.push('/perfil')}
                  className="cursor-pointer gap-2 text-xs font-semibold py-2 rounded-lg hover:bg-white/5 focus:bg-white/5"
                >
                  <User className="size-3.5 text-violet-400" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/configuracoes')}
                  className="cursor-pointer gap-2 text-xs font-semibold py-2 rounded-lg hover:bg-white/5 focus:bg-white/5"
                >
                  <Settings className="size-3.5 text-zinc-400" /> Configurações
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-xs font-semibold py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10 rounded-lg"
              >
                <LogOut className="size-3.5" /> Sair da Conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Menu Dialog */}
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
