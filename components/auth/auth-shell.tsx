import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2, Code2, Sparkles, Terminal, Users } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

const highlights = [
  'Trilha de estudos adaptativa personalizada por IA',
  'DevMentor AI com contexto de aula disponível 24/7',
  'Code Lab no navegador com correção inteligente',
  'Avaliações com nota de corte e certificação oficial',
  'Projetos reais de portfólio validados para o mercado',
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
    <div className="grid min-h-svh lg:grid-cols-12 bg-[#09090e] text-foreground">
      {/* Brand / Value Presentation Panel (Left 6 or 7 cols) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#12111f] via-[#0e0d18] to-[#09090e] p-10 lg:col-span-6 xl:col-span-7 lg:flex border-r border-white/5">
        {/* Glow orb background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-violet-600/20 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-purple-600/15 blur-[120px]"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="w-fit">
            <Logo />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/60 px-3 py-1 text-xs font-bold text-violet-300 shadow-sm">
            <Sparkles className="size-3 text-violet-400" /> Plataforma Profissional
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-8 my-auto py-12 max-w-xl">
          <div className="space-y-3">
            <h2 className="font-sans text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
              O seu caminho estruturado do zero à carreira de desenvolvedor.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Elimine a paralisia por excesso de conteúdo. O DEVPATH AI analisa suas metas e cria o roteiro diário exato para sua evolução.
            </p>
          </div>

          {/* Value points */}
          <ul className="flex flex-col gap-3.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-sm">
                  <CheckCircle2 className="size-3.5" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          {/* Mini Terminal Preview Card */}
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-zinc-300 space-y-1.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 text-[10px] text-zinc-500 font-bold">
              <Terminal className="size-3 text-violet-400" /> DEVPATH AI DIAGNOSTIC ENGINE
            </div>
            <p className="text-zinc-400">&gt; Nivelamento: <span className="text-violet-300 font-bold">Iniciante / Fundamentos</span></p>
            <p className="text-zinc-400">&gt; Meta: <span className="text-emerald-400 font-bold">Full Stack JavaScript Developer</span></p>
            <p className="text-violet-400 font-bold">&gt; Trilha estruturada com sucesso (+11 Módulos Ativos)</p>
          </div>
        </div>

        {/* Social Proof Counter */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-block size-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 ring-2 ring-[#0e0d18] text-[10px] font-bold text-white text-center leading-7">W</span>
              <span className="inline-block size-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 ring-2 ring-[#0e0d18] text-[10px] font-bold text-white text-center leading-7">M</span>
              <span className="inline-block size-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 ring-2 ring-[#0e0d18] text-[10px] font-bold text-white text-center leading-7">L</span>
            </div>
            <span className="font-semibold text-zinc-300">Mais de 12.000 alunos</span> ativos
          </div>
          <span className="font-mono text-violet-400 font-bold">★ 4.9/5 de Avaliação</span>
        </div>
      </div>

      {/* Form Panel (Right 6 or 5 cols) */}
      <div className="flex flex-col lg:col-span-6 xl:col-span-5 bg-[#09090e]">
        <header className="flex items-center justify-between p-6 lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
              <p className="text-pretty text-xs sm:text-sm text-zinc-400 font-medium">{subtitle}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#12111a]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
