'use client'

import React, { useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  GraduationCap,
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

  const leftX = useTransform(smoothProgress, [0.1, 0.4], [-50, 0])
  const leftOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1])

  const rightX = useTransform(smoothProgress, [0.15, 0.45], [50, 0])
  const rightOpacity = useTransform(smoothProgress, [0.15, 0.4], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 border-t border-white/5 bg-[#0a0910] relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center mb-16">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <Brain className="size-3 text-violet-400" /> Onboarding Inteligente
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Antes de ensinar, o DEVPATH AI entende você
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Nada de trilhas genéricas iguais para todo mundo. Experimente abaixo como o diagnóstico da IA molda seu ponto de partida:
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Interactive Questionnaire Simulator */}
          <motion.div
            style={{
              x: leftX,
              opacity: leftOpacity,
            }}
            className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#12111a] p-5 sm:p-8 shadow-2xl space-y-6 ring-1 ring-white/5"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-violet-600 text-white">
                  <Compass className="size-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Simulador de Perfilamento</h4>
                  <p className="text-[11px] text-zinc-400">Clique nas opções para ver a IA recalcular</p>
                </div>
              </div>
              <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px] font-bold">
                Interativo
              </Badge>
            </div>

            {/* Question 1: Nível */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-violet-400" /> 1. Qual o seu nível atual em programação?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'zero', label: 'Iniciante do Zero' },
                  { id: 'basico', label: 'Conheço o Básico' },
                  { id: 'intermediario', label: 'Já Pratico' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      level === item.id
                        ? 'border-violet-500 bg-violet-950/50 text-white shadow-md shadow-violet-950/30'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Área */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Target className="size-3.5 text-purple-400" /> 2. Qual área de tecnologia você quer dominar?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fullstack', label: 'Full Stack Web' },
                  { id: 'frontend', label: 'Frontend React' },
                  { id: 'backend', label: 'Backend Node' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      goal === item.id
                        ? 'border-purple-500 bg-purple-950/50 text-white shadow-md shadow-purple-950/30'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Horas */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="size-3.5 text-indigo-400" /> 3. Quanto tempo disponível por semana?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '5h', label: '5h / semana' },
                  { id: '10h', label: '10h / semana' },
                  { id: '20h', label: '20h+ / semana' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHours(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      hours === item.id
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-md shadow-indigo-950/30'
                        : 'border-white/5 bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
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
            className="lg:col-span-5 rounded-3xl border border-violet-500/40 bg-gradient-to-b from-[#181528] to-[#0f0e18] p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-5"
          >
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-4 animate-spin" /> Plano Gerado pela IA em Tempo Real
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Trilha: {goal === 'fullstack' ? 'Full Stack Developer' : goal === 'frontend' ? 'Frontend Specialist' : 'Backend Engineer'}
              </h3>
              <p className="text-xs text-zinc-400">
                Ponto de partida: <strong className="text-white">{level === 'zero' ? 'Fundamentos & Algoritmos' : level === 'basico' ? 'Avanço Direto em JavaScript' : 'Arquitetura & Projetos'}</strong>
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-black/50 border border-white/5 text-xs text-zinc-300">
              <p className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="size-4" /> Estimativa de conclusão: {hours === '20h' ? '4 a 5 meses' : hours === '10h' ? '7 a 8 meses' : '10 a 12 meses'}
              </p>
              <p className="flex items-center gap-2 text-violet-300 font-semibold">
                <CheckCircle2 className="size-4" /> {level === 'zero' ? '6 Módulos obrigatórios com reforço' : '4 Módulos avançados com bypass'}
              </p>
              <p className="flex items-center gap-2 text-indigo-300 font-semibold">
                <CheckCircle2 className="size-4" /> Mentor IA configurado no modo {level === 'zero' ? 'Didático com Analogias' : 'Code Review Técnico'}
              </p>
            </div>

            <Button asChild size="sm" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl py-5 shadow-lg shadow-violet-600/30">
              <a href="/onboarding">
                <span>Fazer meu teste de nivelamento real</span>
                <ChevronRight className="size-4 ml-1" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default OnboardingInteractiveDemo
