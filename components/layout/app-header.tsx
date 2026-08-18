'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  ChevronRight,
  Flame,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter()
  const { profile, signOut, notifications, markNotificationAsRead, clearAllNotifications, streak, xp, level } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadCount = notifications.filter((n) => !n.read).length
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Desenvolvedor'

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/cursos?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 sm:px-6 backdrop-blur-2xl">
      {/* Left: Mobile Trigger & Breadcrumbs */}
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

        <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
          <Link href="/dashboard" className="hidden sm:inline font-semibold text-zinc-300 hover:text-violet-400 transition-colors shrink-0">
            Plataforma
          </Link>
          {title ? (
            <>
              <ChevronRight className="size-3 text-zinc-600 hidden sm:inline shrink-0" />
              <span className="font-bold text-white truncate text-xs sm:text-sm">{title}</span>
            </>
          ) : (
            <span className="font-bold text-white text-xs sm:text-sm">Dashboard</span>
          )}
        </div>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aulas, cursos, módulos..."
            className="w-full h-9 pl-9 pr-12 text-xs bg-white/[0.03] border-white/10 rounded-xl placeholder:text-zinc-500 focus-visible:ring-violet-500/50 focus-visible:border-violet-500"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
            ↵
          </span>
        </div>
      </form>

      {/* Right: User Greeting, Stats, Notifications, Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Student Greeting */}
        <span className="hidden xl:inline text-xs font-semibold text-zinc-300">
          Olá, <strong className="text-white font-bold">{firstName}</strong> 👋
        </span>

        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <Flame className="size-3.5 fill-amber-400" />
          <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
        </div>

        {/* Level XP Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1 text-xs font-bold text-violet-300">
          <Sparkles className="size-3.5 text-violet-400" />
          <span>Nível {level} • {xp.toLocaleString('pt-BR')} XP</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative rounded-xl text-zinc-400 hover:text-white hover:bg-white/5" aria-label="Notificações">
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                  <span className="absolute 1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-violet-500 animate-pulse" />
                ) : null}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 p-2 bg-[#12111a] border-white/10 text-white shadow-2xl rounded-2xl">
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
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-xs font-black text-white shadow-md shadow-purple-500/20 border border-violet-400/30 hover:scale-105 transition-transform"
              >
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'DV'}
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 p-2 bg-[#12111a] border-white/10 text-white shadow-2xl rounded-2xl">
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
  )
}
