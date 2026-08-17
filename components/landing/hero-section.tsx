'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Code2,
  Flame,
  Layers,
  Lock,
  Play,
  PlayCircle,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { GradientBarsBackground } from '@/components/ui/gradient-bars-background'
import { Progress } from '@/components/ui/progress'

const mockJourney = [
  { label: 'Lógica de Programação & Algoritmos', state: 'done', xp: '+120 XP' },
  { label: 'Estruturas de Dados & Arrays', state: 'done', xp: '+180 XP' },
  { label: 'JavaScript Moderno & Funções Assíncronas', state: 'current', xp: 'Em andamento' },
  { label: 'React, Hooks & Estado Global', state: 'locked', xp: 'Bloqueado' },
  { label: 'Node.js, APIs REST & PostgreSQL', state: 'locked', xp: 'Bloqueado' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-20">
      {/* 21st.dev inspired Gradient Bars Background Layer */}
      <GradientBarsBackground />

      {/* Background Radial Glow & Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 isolate opacity-65 overflow-hidden"
      >
        <div className="w-[50rem] h-[65rem] -translate-y-[220px] absolute left-1/2 -translate-x-1/2 top-0 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(147,51,234,0.22)_0%,rgba(79,70,229,0.08)_50%,transparent_100%)] blur-3xl" />
        <div className="h-[45rem] absolute -left-20 top-20 w-[30rem] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(168,85,247,0.12)_0%,transparent_80%)] blur-3xl" />
        <div className="h-[45rem] absolute -right-20 top-40 w-[30rem] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_80%)] blur-3xl" />
      </div>

      <ContainerScroll
        titleComponent={
          <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
            {/* Pill Badge */}
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-950/40 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-md shadow-violet-950/40 hover:border-violet-400/50 hover:bg-violet-900/30 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="grid size-4 place-items-center rounded-full bg-violet-500 text-white">
                <Sparkles className="size-2.5" />
              </span>
              <span>Mentoria guiada por Inteligência Artificial — DEVPATH AI</span>
              <ChevronRight className="size-3 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Main Headline */}
            <h1 className="text-balance font-sans text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              Pare de estudar programação{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
                sem saber para onde ir.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto max-w-2xl text-pretty text-base sm:text-lg lg:text-xl text-zinc-400 font-medium leading-relaxed">
              Uma plataforma com IA que cria sua trilha personalizada, acompanha seu progresso diário e guia você do zero absoluto até sua carreira profissional como desenvolvedor.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm px-7 py-6 shadow-xl shadow-violet-600/30 gap-2 cursor-pointer transition-all group"
              >
                <Link href="/cadastro">
                  <span>Começar minha jornada</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm px-6 py-6 gap-2 transition-colors"
              >
                <a href="#como-funciona">
                  <PlayCircle className="size-4 text-violet-400" />
                  <span>Conhecer a plataforma</span>
                </a>
              </Button>
            </div>

            {/* Stats Metrics Bar */}
            <div className="mt-8 grid grid-cols-3 max-w-xl mx-auto gap-4 pt-6 border-t border-white/5 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">12+</p>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">Módulos guiados</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-violet-400 font-mono">100%</p>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">Trilha adaptativa</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">24/7</p>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">DevMentor com IA</p>
              </div>
            </div>
          </div>
        }
      >
        {/* Real Platform Product Mockup Inside 3D Rotating Container */}
        <div className="p-3 sm:p-6 space-y-4 bg-gradient-to-b from-[#141220] to-[#0d0c14]">
          {/* Window Bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-[11px] font-mono text-zinc-500 ml-2 hidden sm:inline">
                devpath.ai/dashboard/trilha
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                <Flame className="size-3.5 fill-amber-400" />
                <span>5 dias streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-violet-950/40 border border-violet-500/30 px-2.5 py-1 rounded-xl">
                <Trophy className="size-3.5" />
                <span>1.450 XP</span>
              </div>
            </div>
          </div>

          {/* Interior Dashboard Mockup */}
          <div className="grid gap-4 lg:grid-cols-12 pt-2">
            {/* Left: Learning Path Roadmap */}
            <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                    Sua Trilha Adaptativa
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">Full Stack Developer</h3>
                </div>
                <Badge className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                  68% Concluído
                </Badge>
              </div>

              <Progress value={68} className="h-1.5 bg-white/10" />

              <div className="space-y-2 pt-1">
                {mockJourney.map((step) => (
                  <div
                    key={step.label}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      step.state === 'current'
                        ? 'border-violet-500/60 bg-violet-950/30 shadow-md shadow-violet-950/20'
                        : step.state === 'done'
                        ? 'border-emerald-500/20 bg-black/30 text-zinc-300'
                        : 'border-white/5 bg-black/20 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {step.state === 'done' && (
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      )}
                      {step.state === 'current' && (
                        <span className="grid size-4 place-items-center rounded-full bg-violet-600 text-white shrink-0">
                          <Play className="size-2 fill-white" />
                        </span>
                      )}
                      {step.state === 'locked' && (
                        <Lock className="size-4 text-zinc-600 shrink-0" />
                      )}
                      <span className={`font-semibold ${step.state === 'current' ? 'text-white' : ''}`}>
                        {step.label}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold ${
                        step.state === 'current'
                          ? 'text-violet-300'
                          : step.state === 'done'
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {step.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: DevMentor AI Real-Time Assistant & Code Lab Preview */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* DevMentor AI Chat Snippet */}
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-black/60 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <div className="grid size-7 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/30">
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">DevMentor AI</h4>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Contextualizado com sua aula
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] text-zinc-300 leading-relaxed font-medium">
                    &quot;Notei que você travou no exercício de funções assíncronas. Em vez de usar `then/catch`, que tal tentar com `async/await` para deixar a leitura mais linear?&quot;
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300">
                    <p className="text-zinc-500">// Exemplo recomendado:</p>
                    <p><span className="text-violet-400">const</span> response = <span className="text-violet-400">await</span> fetch(url);</p>
                    <p><span className="text-violet-400">const</span> data = <span className="text-violet-400">await</span> response.json();</p>
                  </div>
                </div>
              </div>

              {/* Practical Assessment Banner */}
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                    <Code2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Projeto de Módulo</p>
                    <p className="text-[11px] text-zinc-400">Avaliação por rubrica ponderada</p>
                  </div>
                </div>
                <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-bold">
                  Nota mín. 70%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  )
}
