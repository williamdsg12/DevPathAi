'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
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
        <div className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-black/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                Seu Ponto de Estudo Atual
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Módulo 03: JavaScript Moderno & Assincronismo
              </h3>
            </div>
            <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-xs font-bold font-mono">
              Nível 4 • Júnior
            </Badge>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Progresso geral da trilha</span>
              <strong className="text-white font-mono">68% concluído</strong>
            </div>
            <Progress value={68} className="h-2 bg-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-zinc-500 font-medium">Aulas Assistidas</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">34 / 50</p>
            </div>
            <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-zinc-500 font-medium">Atividades Feitas</span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">28 aprovadas</p>
            </div>
            <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-zinc-500 font-medium">Projetos GitHub</span>
              <p className="text-sm font-bold text-violet-400 font-mono mt-0.5">3 entregues</p>
            </div>
          </div>
        </div>

        {/* Up next recommendation */}
        <div className="p-3.5 rounded-2xl border border-violet-500/20 bg-violet-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white shrink-0">
              <Play className="size-4 fill-white" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-violet-300 uppercase">Próxima Aula Recomendada</span>
              <p className="text-xs font-bold text-white">Promises, Async/Await e Tratamento de Erros</p>
            </div>
          </div>
          <Badge className="bg-violet-600 text-white text-[10px] font-bold hidden sm:inline-flex">
            Continuar Aula
          </Badge>
        </div>
      </div>

      {/* Right 4 Cols: DevMentor Snapshot & AI Status */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="size-3.5" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Diagnóstico da IA</h4>
              <p className="text-[10px] text-zinc-400">Atualizado após o último exercício</p>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
            &quot;Você dominou manipulação de arrays e métodos funcionais (.map, .filter). Próxima meta: estruturar requisições assíncronas com tratamento de erros robusto.&quot;
          </p>

          <div className="space-y-1.5 text-xs font-medium text-zinc-400">
            <div className="flex items-center justify-between text-[11px]">
              <span>Lógica & Sintaxe</span>
              <span className="text-emerald-400 font-bold">92%</span>
            </div>
            <Progress value={92} className="h-1.5 bg-white/10" />
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span>Assincronismo</span>
              <span className="text-violet-400 font-bold">64%</span>
            </div>
            <Progress value={64} className="h-1.5 bg-white/10" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* =========================================================================
   MODE 2: TRILHA IA INTERATIVA VIEW
   ========================================================================= */
function TrilhaView() {
  const steps = [
    { label: '01. Lógica de Programação & Algoritmos', status: 'done', score: 'Nota 9.5', xp: '+150 XP' },
    { label: '02. Estrutura de Dados & Arrays em JS', status: 'done', score: 'Nota 9.0', xp: '+180 XP' },
    { label: '03. JavaScript Moderno & Funções Assíncronas', status: 'current', score: 'Em andamento', xp: '+220 XP' },
    { label: '04. React, Hooks, Context & Tailwind CSS', status: 'locked', score: 'Bloqueado', xp: '+250 XP' },
    { label: '05. Node.js, Express, PostgreSQL & Prisma', status: 'locked', score: 'Bloqueado', xp: '+300 XP' },
    { label: '06. Projeto Integrador Full Stack & Deploy', status: 'locked', score: 'Bloqueado', xp: '+500 XP' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 w-full text-left"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
            Árvore de Aprendizado Personalizada
          </span>
          <h3 className="text-base font-bold text-white">Trilha: Full Stack Web Developer</h3>
        </div>
        <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/30 text-xs font-mono font-bold">
          Calculada para 8h/semana
        </Badge>
      </div>

      <div className="grid gap-2.5">
        {steps.map((step) => {
          const isDone = step.status === 'done'
          const isCurrent = step.status === 'current'
          return (
            <div
              key={step.label}
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-xs transition-all ${
                isCurrent
                  ? 'border-violet-500/60 bg-violet-950/30 shadow-lg shadow-violet-950/20'
                  : isDone
                  ? 'border-emerald-500/20 bg-black/30 text-zinc-300'
                  : 'border-white/5 bg-black/20 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDone && <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0" />}
                {isCurrent && (
                  <span className="grid size-5 place-items-center rounded-full bg-violet-600 text-white shrink-0 animate-pulse">
                    <Play className="size-2.5 fill-white" />
                  </span>
                )}
                {step.status === 'locked' && <Lock className="size-4.5 text-zinc-600 shrink-0" />}

                <div>
                  <p className={`font-bold ${isCurrent ? 'text-white' : ''}`}>{step.label}</p>
                  <p className="text-[10px] text-zinc-500">{step.score}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold ${isCurrent ? 'text-violet-300' : isDone ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {step.xp}
                </span>
                {isCurrent && (
                  <Badge className="bg-violet-600 text-white text-[10px] font-bold">
                    Estudar Agora
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* =========================================================================
   MODE 3: ÁREA DE AULA & DEVMENTOR VIEW
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
      {/* Video Player Simulator */}
      <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-black/60 p-4 space-y-3">
        <div className="relative aspect-video rounded-xl bg-gradient-to-tr from-violet-950/80 via-black to-[#1a1728] border border-white/10 flex items-center justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)]" />
          <div className="grid size-12 place-items-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/50 group-hover:scale-110 transition-transform cursor-pointer">
            <Play className="size-5 fill-white ml-0.5" />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
            <span>08:42 / 18:20</span>
            <span className="text-violet-400 font-bold font-mono">1080p HD • Transcrição Ativa</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-violet-400">Aula #04</span>
          <h4 className="text-sm font-bold text-white">Dominando Async/Await e Requisições REST em JS</h4>
        </div>
      </div>

      {/* DevMentor AI Contextual Chat */}
      <div className="lg:col-span-5 rounded-2xl border border-violet-500/30 bg-[#12111a] p-4 space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <div className="grid size-7 place-items-center rounded-lg bg-violet-600 text-white">
              <Bot className="size-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">DevMentor AI</h5>
              <p className="text-[10px] text-emerald-400 font-medium">● Sincronizado com o minuto 08:42</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.03] text-zinc-300 font-medium">
              &quot;O professor acabou de demonstrar o bloco <code className="text-violet-300 font-mono">try/catch</code>. Ele é fundamental para capturar erros de rede sem quebrar a sua aplicação.&quot;
            </div>

            <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-emerald-300">
              <p className="text-zinc-500">// Experimente mentalizar o fluxo:</p>
              <p><span className="text-violet-400">try</span> &#123;</p>
              <p className="pl-3"><span className="text-violet-400">const</span> res = <span className="text-violet-400">await</span> api.get();</p>
              <p>&#125; <span className="text-violet-400">catch</span> (err) &#123; <span className="text-zinc-500">/* trate o erro */</span> &#125;</p>
            </div>
          </div>
        </div>

        <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl gap-1.5">
          <MessageSquare className="size-3.5" /> Fazer uma pergunta ao Mentor
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
