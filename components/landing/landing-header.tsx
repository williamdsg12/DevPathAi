'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const links = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#trilhas', label: 'Trilhas' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="DevPath AI — início">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LinkButton variant="ghost" size="sm" href="/login" className="hidden sm:inline-flex">
            Entrar
          </LinkButton>
          <LinkButton size="sm" href="/cadastro" className="hidden sm:inline-flex">
            Começar agora
          </LinkButton>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <LinkButton variant="outline" href="/login">
                  Entrar
                </LinkButton>
                <LinkButton href="/cadastro">Começar agora</LinkButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
