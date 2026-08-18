'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function OnboardingInteractiveDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  // State for the interactive onboarding simulator
  const [level, setLevel] = useState<'zero' | 'basico' | 'intermediario'>('zero')
  const [goal, setGoal] = useState<'fullstack' | 'frontend' | 'backend'>('fullstack')
  const [hours, setHours] = useState<'5h' | '10h' | '20h'>('10h')
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    setIsCalculating(true)
    const t = setTimeout(() => setIsCalculating(false), 350)
    return () => clearTimeout(t)
  }, [level, goal, hours])

  const leftX = useTransform(smoothProgress, [0.1, 0.4], [-40, 0])
  const leftOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1])

  const rightX = useTransform(smoothProgress, [0.15, 0.45], [40, 0])
  const rightOpacity = useTransform(smoothProgress, [0.15, 0.4], [0, 1])

  const confidenceScore = level === 'zero' ? 98 : level === 'basico' ? 95 : 99

  return (
    <section
      id="simulador"
      ref={sectionRef}
      className="py-24 sm:py-32 border-t border-white/5 bg-[#0a0910] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center mb-16">
          <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-bold gap-1.5 px-3.5 py-1 shadow-lg shadow-violet-950/40">
            <Brain className="size-3 text-violet-400" /> Diferencial Único da IA
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Antes de ensinar, o DEVPATH AI decodifica suas metas
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Nada de trilhas genéricas que fazem você perder meses. Teste o simulador de diagnóstico em tempo real e veja como o motor de IA ajusta o conteúdo para seu ritmo:
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Interactive Questionnaire Simulator */}
          <motion.div
            style={{
              x: leftX,
              opacity: leftOpacity,
            }}
            className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#12111a]/95 p-6 sm:p-8 shadow-2xl space-y-6 ring-1 ring-white/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30">
                  <Compass className="size-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Simulador de Perfilamento & Diagnóstico</h4>
                  <p className="text-[11px] text-zinc-400">Alterne as opções para simular o motor adaptativo</p>
                </div>
              </div>
              <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-bold">
                100% Interativo
              </Badge>
            </div>

            {/* Question 1: Nível */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-violet-400" /> 1. Qual o seu ponto de partida em programação?
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: 'zero', label: 'Iniciante do Zero', sub: 'Sem bagagem prévia' },
                  { id: 'basico', label: 'Conheço o Básico', sub: 'Lógica ou sintaxe leve' },
                  { id: 'intermediario', label: 'Já Desenvolvo', sub: 'Busco senioridade' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      level === item.id
                        ? 'border-violet-500 bg-violet-950/60 text-white ring-1 ring-violet-400/40 shadow-lg shadow-violet-950/40'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Área */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Target className="size-3.5 text-purple-400" /> 2. Qual área e tecnologia você deseja dominar?
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: 'fullstack', label: 'Full Stack Web', sub: 'React + Node + SQL' },
                  { id: 'frontend', label: 'Front-end Moderno', sub: 'React 19, Next.js, UI' },
                  { id: 'backend', label: 'Back-end & APIs', sub: 'Node, Python, DBs' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      goal === item.id
                        ? 'border-purple-500 bg-purple-950/60 text-white ring-1 ring-purple-400/40 shadow-lg shadow-purple-950/40'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Horas */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="size-3.5 text-indigo-400" /> 3. Quanto tempo você pode dedicar por semana?
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: '5h', label: '5 horas / semana', sub: '45 min por dia útil' },
                  { id: '10h', label: '10 horas / semana', sub: '1h30 por dia (ideal)' },
                  { id: '20h', label: '20h+ / semana', sub: 'Modo Acelerado' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHours(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      hours === item.id
                        ? 'border-indigo-500 bg-indigo-950/60 text-white ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-950/40'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Real-Time AI Generation Result */}
          <motion.div
            style={{
              x: rightX,
              opacity: rightOpacity,
            }}
            className="lg:col-span-5 rounded-3xl border border-violet-500/40 bg-gradient-to-b from-[#181528] via-[#12111d] to-[#0d0c14] p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-5 relative overflow-hidden"
          >
            {/* Top Glow Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-4 text-violet-400 animate-spin" /> Trilha Gerada pela IA
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {confidenceScore}% Precisão
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${level}-${goal}-${hours}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Resultado Personalizado</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {goal === 'fullstack' ? 'Formação Full Stack Developer' : goal === 'frontend' ? 'Especialização Front-end React' : 'Engenharia Back-end & Node'}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium pt-1">
                    Ponto de partida calibrado:{' '}
                    <strong className="text-violet-300 font-bold">
                      {level === 'zero' ? 'Nível 01 — Fundamentos & Algoritmos' : level === 'basico' ? 'Nível 03 — JavaScript & Aplicações' : 'Nível 05 — Arquitetura & Projetos de Portfólio'}
                    </strong>
                  </p>
                </div>

                <div className="space-y-2.5 p-4 rounded-2xl bg-black/60 border border-white/5 text-xs text-zinc-300 leading-relaxed font-medium">
                  <p className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Tempo previsto: <strong>{hours === '20h' ? '3 a 4 meses' : hours === '10h' ? '6 a 7 meses' : '9 a 11 meses'}</strong></span>
                  </p>
                  <p className="flex items-center gap-2.5 text-violet-300 font-semibold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{level === 'zero' ? '11 Módulos estruturados + 17 projetos guiados' : '7 Módulos avançados com bypass de fundamentos'}</span>
                  </p>
                  <p className="flex items-center gap-2.5 text-indigo-300 font-semibold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>DevMentor AI: <strong>{level === 'zero' ? 'Modo Didático (com analogias)' : 'Modo Code Review & Clean Code'}</strong></span>
                  </p>
                </div>

                {/* Progress bar simulation */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                    <span>Aproveitamento Esperado</span>
                    <span className="text-violet-400 font-mono">100% dos Requisitos</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <Button asChild size="lg" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl py-6 shadow-xl shadow-violet-600/30 gap-2 cursor-pointer transition-transform hover:scale-[1.02] border border-violet-400/30">
              <a href="/onboarding">
                <span>Criar minha trilha real com IA</span>
                <ChevronRight className="size-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default OnboardingInteractiveDemo
