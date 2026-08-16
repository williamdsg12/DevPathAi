import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

const highlights = [
  'Trilha de estudos personalizada por IA',
  'Mentor virtual disponível 24 horas por dia',
  'Projetos práticos e correção inteligente',
  'Acompanhamento de progresso e conquistas',
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand / value panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, var(--primary) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--accent) 0, transparent 45%)',
          }}
        />
        <Link href="/" className="relative z-10 w-fit">
          <Logo />
        </Link>

        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="max-w-md text-balance font-display text-3xl font-bold leading-tight">
            Seu caminho estruturado do zero à carreira dev.
          </h2>
          <ul className="flex flex-col gap-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-sidebar-foreground/60">
          Mais de 12.000 pessoas já começaram sua jornada na DevPath AI.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-4 lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-pretty text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
