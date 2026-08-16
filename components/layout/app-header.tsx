'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Flame, Menu, Sparkles } from 'lucide-react'
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

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { notifications, markNotificationAsRead, clearAllNotifications, streak, xp, level } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu lateral">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div>
          {title ? (
            <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">{title}</h1>
          ) : (
            <Link href="/dashboard" className="lg:hidden">
              <Logo />
            </Link>
          )}
          {subtitle ? <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p> : null}
        </div>
      </div>

      {/* Right: Streak, XP, Notifications, Theme */}
      <div className="flex items-center gap-2.5">
        {/* Streak indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
          <Flame className="size-3.5 fill-warning" />
          <span>{streak} dias seguidos</span>
        </div>

        {/* Level XP Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>Nível {level} • {xp.toLocaleString('pt-BR')} XP</span>
        </div>

        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" className="relative rounded-full" aria-label="Notificações">
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 font-bold">Notificações</DropdownMenuLabel>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Marcar lidas
                </button>
              ) : null}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Nenhuma notificação nova.</p>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className="flex flex-col items-start gap-1 p-2.5 cursor-pointer rounded-lg hover:bg-muted"
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground">{n.title}</span>
                      {!n.read ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
