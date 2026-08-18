'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileCode2,
  Flame,
  FolderGit2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Play,
  PlayCircle,
  Route,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export type MockupMode = 'dashboard' | 'trilha' | 'aula' | 'codelab'

interface ProductMockupExperienceProps {
  activeMode?: MockupMode
  onModeChange?: (mode: MockupMode) => void
  interactive?: boolean
}

export function ProductMockupExperience({
  activeMode: externalMode,
  onModeChange,
  interactive = true,
}: ProductMockupExperienceProps) {
  const [internalMode, setInternalMode] = useState<MockupMode>('dashboard')
  const mode = externalMode || internalMode

  const setMode = (newMode: MockupMode) => {
    if (onModeChange) onModeChange(newMode)
    setInternalMode(newMode)
  }

  const tabs: { id: MockupMode; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
    { id: 'trilha', label: 'Minha Trilha IA', icon: Route },
    { id: 'aula', label: 'Área de Aula & Mentor', icon: PlayCircle },
    { id: 'codelab', label: 'Code Lab & Avaliação', icon: Terminal },
  ]

  return (
    <div className="relative w-full">
      {/* =========================================================================
          FLOATING DEV NOTIFICATION TOASTS (Dev-Native Identity Toasts)
         ========================================================================= */}
      
      {/* Floating Toast 1 (Top Left): npm run dev */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:flex items-center gap-2 absolute -top-7 -left-6 z-30 rounded-2xl border border-violet-500/30 bg-[#0d0c18]/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl shadow-purple-950/50 text-xs font-mono text-violet-300"
      >
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <Terminal className="size-3.5 text-violet-400" />
        <span>&gt; npm run dev</span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">ready on :3000</span>
      </motion.div>

      {/* Floating Toast 2 (Top Right): Build Successful */}
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:flex items-center gap-2 absolute -top-7 -right-6 z-30 rounded-2xl border border-emerald-500/30 bg-[#0d0c18]/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl shadow-emerald-950/50 text-xs font-mono text-emerald-300"
      >
        <CheckCircle2 className="size-3.5 text-emerald-400" />
        <span>&gt; Build successful (0 errors)</span>
        <span className="text-[10px] text-zinc-400 font-bold">142ms</span>
      </motion.div>

      {/* Floating Toast 3 (Bottom Left): 87% da Trilha Concluída */}
      <motion.div
        animate={{ y: [3, -5, 3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden xl:flex items-center gap-2.5 absolute -bottom-5 -left-8 z-30 rounded-2xl border border-violet-500/30 bg-[#0d0c18]/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl shadow-purple-950/50 text-xs"
      >
        <div className="size-7 rounded-xl bg-violet-600/20 text-violet-400 grid place-items-center font-black">
          ⚡
        </div>
        <div>
          <p className="text-[11px] font-bold text-white">&gt; 87% da Trilha Concluída</p>
          <p className="text-[10px] text-violet-400">Nível 04: JavaScript Avançado</p>
        </div>
      </motion.div>

      {/* Floating Toast 4 (Bottom Right): Projeto Aprovado */}
      <motion.div
        animate={{ y: [-5, 3, -5] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden xl:flex items-center gap-2.5 absolute -bottom-5 -right-8 z-30 rounded-2xl border border-amber-500/30 bg-[#0d0c18]/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl shadow-amber-950/40 text-xs"
      >
        <div className="size-7 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center font-black">
          🏆
        </div>
        <div>
          <p className="text-[11px] font-bold text-white">&gt; Projeto Aprovado pelo DevMentor</p>
          <p className="text-[10px] text-amber-300">+250 XP • Badge Conquistada</p>
        </div>
      </motion.div>

      {/* Main SaaS Window */}
      <div className="w-full bg-gradient-to-b from-[#141220] to-[#0d0c14] rounded-[20px] sm:rounded-[28px] overflow-hidden border border-white/10 shadow-2xl">
        {/* SaaS Window Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-black/40 px-3 sm:px-5 py-3">
          {/* Window dots & URL badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/5 hidden sm:inline">
              devpath.ai/app/{mode}
            </span>
          </div>

          {/* Live Interactive Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = mode === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* User Stats: Streak & XP */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg">
              <Flame className="size-3 fill-amber-400" />
              <span>7d streak</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-violet-300 bg-violet-950/40 border border-violet-500/30 px-2 py-0.5 rounded-lg">
              <Trophy className="size-3" />
              <span>1.820 XP</span>
            </div>
          </div>
        </div>

        {/* Main Dynamic Viewport with AnimatePresence */}
        <div className="p-3 sm:p-6 min-h-[380px] sm:min-h-[440px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {mode === 'dashboard' && <DashboardView key="dashboard" />}
            {mode === 'trilha' && <TrilhaView key="trilha" />}
            {mode === 'aula' && <AulaView key="aula" />}
            {mode === 'codelab' && <CodeLabView key="codelab" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   MODE 1: DASHBOARD GERAL VIEW
   ========================================================================= */
function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 lg:grid-cols-12 w-full text-left"
    >
      {/* Left 8 Cols: Welcome & Weekly Progress */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#171526] to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
              Jornada Full Stack JavaScript
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Olá, William 👋 Vamos continuar sua jornada?
            </h3>
            <p className="text-xs text-zinc-400">
              Meta de hoje: 25 minutos • Módulo ativo: JavaScript Assíncrono & Promises
            </p>
          </div>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs gap-1.5 shrink-0 rounded-xl shadow-lg shadow-purple-600/30">
            <Play className="size-3.5 fill-white" /> Continuar Aula
          </Button>
        </div>

        {/* Current Lesson in Progress Spotlight */}
        <div className="rounded-2xl border border-white/5 bg-[#12111d] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <PlayCircle className="size-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Próxima Aula</span>
              <h4 className="text-xs sm:text-sm font-bold text-white">Aula 07 — Promises, Async/Await e Try/Catch</h4>
              <p className="text-[11px] text-zinc-400">22 min • Exercício Prático no Code Lab incluso</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold text-violet-400">75% Concluído</span>
            <div className="w-24 h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
              <div className="w-3/4 h-full bg-violet-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right 4 Cols: DevMentor AI Mini Feed */}
      <div className="lg:col-span-4 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/30 to-[#12111d] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Bot className="size-4 text-violet-400" />
            <span className="text-xs font-bold text-white">DevMentor AI</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full">
            Online 24/7
          </span>
        </div>
        <div className="rounded-xl bg-black/40 p-3 text-[11px] text-zinc-300 space-y-1.5 leading-relaxed">
          <p className="text-violet-300 font-semibold">&gt; Diagnóstico Pedagógico:</p>
          <p>
            &quot;William, seu aproveitamento em manipulação do DOM está excelente (92%). Na aula de Promises, preste atenção em encadeamento de métodos .then() vs async/await.&quot;
          </p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
          <span>Pronto para tirar dúvidas</span>
          <span className="text-violet-400 font-semibold cursor-pointer">Abrir Chat &rarr;</span>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   MODE 2: TRILHA & ROADMAP VIEW
   ========================================================================= */
function TrilhaView() {
  const steps = [
    { title: 'Fundamentos & Algoritmos', status: 'Concluído', score: '98%', icon: CheckCircle2, active: false, done: true },
    { title: 'Git, GitHub & Workflow Dev', status: 'Concluído', score: '95%', icon: CheckCircle2, active: false, done: true },
    { title: 'HTML5 Semântico & CSS3 Moderno', status: 'Concluído', score: '92%', icon: CheckCircle2, active: false, done: true },
    { title: 'JavaScript Moderno (ES6+)', status: 'Em Andamento', score: '87%', icon: Zap, active: true, done: false },
    { title: 'React 19 & Next.js App Router', status: 'Próxima Missão', score: 'Bloqueado', icon: Lock, active: false, done: false },
    { title: 'Node.js, Express & APIs RESTful', status: 'Bloqueado', score: 'Bloqueado', icon: Lock, active: false, done: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 w-full text-left"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <h3 className="text-sm font-bold text-white">Trilha Adaptativa — Formação Full Stack Developer</h3>
          <p className="text-xs text-zinc-400">Progresso calculado segundo rubricas e avaliações por IA</p>
        </div>
        <Badge className="bg-violet-600 text-white text-xs font-bold font-mono">
          Progresso Global: 64%
        </Badge>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className={`p-3.5 rounded-2xl border transition-all ${
              s.active
                ? 'border-violet-500 bg-violet-950/40 shadow-lg shadow-purple-950/40 ring-1 ring-violet-400/50'
                : s.done
                ? 'border-emerald-500/30 bg-[#12111d]'
                : 'border-white/5 bg-white/[0.01] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-[10px] text-zinc-500">Nível 0{i + 1}</span>
              <Badge
                variant="secondary"
                className={`text-[9px] font-bold ${
                  s.done ? 'bg-emerald-950 text-emerald-300' : s.active ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-500'
                }`}
              >
                {s.status}
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px]">
              <span className="text-zinc-500">Mastery Score:</span>
              <span className={s.done ? 'text-emerald-400 font-bold font-mono' : 'text-zinc-400 font-mono'}>{s.score}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   MODE 3: ÁREA DE AULA & MENTOR VIEW
   ========================================================================= */
function AulaView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 lg:grid-cols-12 w-full text-left"
    >
      {/* Video Player Mockup */}
      <div className="lg:col-span-8 space-y-2">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center group shadow-xl">
          <div className="size-14 rounded-full bg-violet-600 text-white grid place-items-center shadow-2xl shadow-purple-600/60 group-hover:scale-110 transition-transform">
            <Play className="size-6 fill-white ml-0.5" />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span className="font-mono">14:32 / 22:10</span>
            <span className="text-[11px] font-bold text-violet-300">Aula 07: JavaScript Assíncrono</span>
            <span className="font-mono text-emerald-400">1080p HD</span>
          </div>
        </div>
      </div>

      {/* Lesson Notes & DevMentor Chat Sync */}
      <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-[#12111d] p-3.5 space-y-2.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white">Notas & Dúvidas Rápidas</span>
            <span className="text-[10px] text-violet-400 font-mono">IA Sincronizada</span>
          </div>
          <div className="rounded-xl bg-black/40 p-2.5 text-[11px] text-zinc-300 space-y-1">
            <p className="font-bold text-white">Dica Pedagógica da Aula:</p>
            <p className="text-zinc-400 leading-relaxed">
              O loop de eventos (Event Loop) prioriza microtasks (Promises) antes de macrotasks (setTimeout).
            </p>
          </div>
        </div>

        <Button size="sm" className="w-full text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl">
          <Code2 className="size-3.5 mr-1" /> Ir para Exercício no Code Lab
        </Button>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   MODE 4: CODE LAB & AVALIAÇÃO VIEW
   ========================================================================= */
function CodeLabView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 lg:grid-cols-12 w-full text-left"
    >
      {/* Code Editor */}
      <div className="lg:col-span-8 rounded-2xl border border-white/5 bg-black/80 p-4 font-mono text-xs text-emerald-300 space-y-1.5 overflow-x-auto">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] pb-2 border-b border-white/5">
          <span className="flex items-center gap-2">
            <FileCode2 className="size-3.5 text-violet-400" /> exercicio_04_async.js
          </span>
          <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/30 text-[10px]">
            Sintaxe Válida
          </Badge>
        </div>
        <p><span className="text-violet-400">async function</span> <span className="text-amber-300">buscarUsuariosAtivos</span>(apiUrl) &#123;</p>
        <p className="pl-4"><span className="text-violet-400">try</span> &#123;</p>
        <p className="pl-8"><span className="text-violet-400">const</span> response = <span className="text-violet-400">await</span> fetch(apiUrl);</p>
        <p className="pl-8"><span className="text-violet-400">const</span> data = <span className="text-violet-400">await</span> response.json();</p>
        <p className="pl-8"><span className="text-violet-400">return</span> data.<span className="text-blue-400">filter</span>(user =&gt; user.ativo === <span className="text-rose-400">true</span>);</p>
        <p className="pl-4">&#125; <span className="text-violet-400">catch</span> (error) &#123;</p>
        <p className="pl-8">console.<span className="text-blue-400">error</span>(<span className="text-emerald-400">&quot;Falha ao buscar usuários&quot;</span>, error);</p>
        <p className="pl-8"><span className="text-violet-400">return</span> [];</p>
        <p className="pl-4">&#125;</p>
        <p>&#125;</p>
      </div>

      {/* Test Runner & Evaluation Rubric */}
      <div className="lg:col-span-4 space-y-3">
        <div className="p-3.5 rounded-2xl border border-white/5 bg-black/60 space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
            <span className="font-bold text-white">Testes Unitários</span>
            <span className="text-emerald-400 font-bold font-mono">3/3 Passaram</span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-400">
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" /> Retorna apenas usuários ativos
            </p>
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" /> Trata erro de rede sem throw
            </p>
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" /> Converte JSON corretamente
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-violet-500/30 bg-violet-950/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Rubrica Pedagógica</span>
            <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-[11px] font-bold font-mono">
              Nota 9.4 / 10
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-300 leading-snug">
            Código limpo, imutável e com excelente estratégia de fallback em exceções. Módulo concluído!
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductMockupExperience
