'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const problemPoints = [
  'Cursos isolados e desorganizados que não conversam entre si',
  '"Tutorial Hell": assistir a centenas de horas de vídeo sem programar nada de verdade',
  'Ficar perdido sem saber qual tecnologia aprender em seguida',
  'Pular fundamentos e travar gravemente quando o nível técnico sobe',
  'Não ter certeza se o seu código está pronto para o mercado de trabalho',
]

const solutionPoints = [
  { q: 'O que eu preciso estudar agora?', a: 'A IA traça a sequência exata de aulas e conceitos.' },
  { q: 'O que eu ainda não domino?', a: 'Diagnóstico em tempo real por exercícios e testes.' },
  { q: 'Por que estou tendo dificuldade?', a: 'DevMentor explica com analogias e exemplos no seu nível.' },
  { q: 'Estou pronto para avançar?', a: 'Aprovação validada por 5 critérios obrigatórios de módulo.' },
  { q: 'Quais projetos devo construir?', a: 'Desafios práticos com rubrica de avaliação para portfólio.' },
  { q: 'Estou preparado para uma vaga?', a: 'Simulação de entrevistas técnicas e revisão de currículo.' },
]

export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  // Scroll-linked transforms
  const leftX = useTransform(smoothProgress, [0.1, 0.45], [-60, 0])
  const leftOpacity = useTransform(smoothProgress, [0.1, 0.4], [0, 1])

  const rightX = useTransform(smoothProgress, [0.15, 0.5], [60, 0])
  const rightScale = useTransform(smoothProgress, [0.15, 0.5], [0.92, 1])
  const rightOpacity = useTransform(smoothProgress, [0.15, 0.45], [0, 1])

  return (
    <section
      ref={sectionRef}
      id="trilhas"
      className="py-24 sm:py-32 border-y border-white/5 bg-[#0d0c14]/70 relative overflow-hidden"
    >
      {/* Scroll-linked background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left: The Problem - Slides from Left */}
          <motion.div
            style={{
              x: leftX,
              opacity: leftOpacity,
            }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="space-y-2">
              <Badge className="bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold gap-1.5 px-3 py-1">
                <AlertTriangle className="size-3 text-rose-400" /> O Grande Obstáculo
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Estudar programação sem direção é o motivo nº 1 de desistência
              </h2>
            </div>

            <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
              A maioria dos aspirantes a desenvolvedor não desiste por falta de capacidade, mas pelo excesso de informações desconectadas e pela ausência de um plano claro de evolução.
            </p>

            <ul className="space-y-3 pt-2">
              {problemPoints.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-rose-500/15 bg-rose-950/10 p-3.5 text-xs sm:text-sm text-zinc-300 transition-colors hover:border-rose-500/30"
                >
                  <XCircle className="size-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: The Solution Card - Slides from Right with Scale */}
          <motion.div
            style={{
              x: rightX,
              scale: rightScale,
              opacity: rightOpacity,
            }}
            className="lg:col-span-6"
          >
            <Card className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#151322] to-[#0e0d16] p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden ring-1 ring-violet-500/20">
              <div className="space-y-2 border-b border-white/5 pb-5">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-violet-600 text-white">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-violet-400">
                    A Solução Definitiva
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  O DEVPATH AI responde diariamente por você:
                </CardTitle>
              </div>

              <CardContent className="p-0 pt-6 space-y-3">
                {solutionPoints.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/40 p-3.5 text-xs transition-all hover:border-violet-500/40 hover:bg-violet-950/20"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">{item.q}</strong>
                      <span className="text-zinc-400 font-medium leading-relaxed">{item.a}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
