'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  Code2,
  FolderGit2,
  GraduationCap,
  MessageSquareText,
  Repeat,
  Route,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    num: '01',
    icon: MessageSquareText,
    badge: 'Onboarding Inteligente',
    title: 'A IA entende seu perfil',
    desc: 'Um onboarding conduzido por IA mapeia seu nível inicial, seus objetivos de carreira, tempo disponível semanal e principais dificuldades.',
  },
  {
    num: '02',
    icon: Brain,
    badge: 'Teste de Nivelamento',
    title: 'Diagnóstico de Habilidades',
    desc: 'Perguntas práticas e pequenos desafios de lógica identificam exatamente onde você deve começar, sem perder tempo com o que já sabe.',
  },
  {
    num: '03',
    icon: Route,
    badge: 'Árvore de Aprendizado',
    title: 'Sua trilha é gerada',
    desc: 'A IA monta uma trilha sequencial estruturada em fases, módulos, aulas oficiais e pré-requisitos lógicos calculados exclusivamente para você.',
  },
  {
    num: '04',
    icon: Code2,
    badge: 'Fixação Prática',
    title: 'Você estuda e programa',
    desc: 'Aulas com transcrição, materiais complementares, exercícios no Code Lab e atividades com dicas progressivas que não entregam o gabarito.',
  },
  {
    num: '05',
    icon: FolderGit2,
    badge: 'Projetos & Provas',
    title: 'Avaliação com Rubrica Real',
    desc: 'Submeta projetos no GitHub avaliados pela IA contra critérios ponderados e faça avaliações oficiais com nota de corte mínima de 70%.',
  },
  {
    num: '06',
    icon: Repeat,
    badge: 'Recálculo Dinâmico',
    title: 'A trilha se adapta a você',
    desc: 'Se você travar em um conceito, a IA gera um plano de recuperação com aulas de reforço antes de liberar os próximos passos da carreira.',
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
  })

  // Scroll indicator line across the 6 steps
  const lineScaleX = useTransform(smoothProgress, [0.15, 0.75], [0, 1])

  return (
    <section ref={sectionRef} id="como-funciona" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <Sparkles className="size-3 text-violet-400" /> Metodologia Pedagógica
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Um sistema que decide o que você precisa aprender em seguida
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Não é uma biblioteca estática de cursos gravados. É um ecossistema inteligente que responde à pergunta diária do dev: <strong className="text-white">&quot;O que eu estudo agora?&quot;</strong>
          </p>

          {/* Scroll-linked dynamic progress tracker */}
          <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <motion.div
              style={{ scaleX: lineScaleX }}
              className="h-full origin-left bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-400 rounded-full"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, index) => {
            // Each card receives a staggered scroll transform
            const startThreshold = 0.15 + (index * 0.08)
            const endThreshold = startThreshold + 0.25

            const cardY = useTransform(smoothProgress, [startThreshold, endThreshold], [50, 0])
            const cardOpacity = useTransform(smoothProgress, [startThreshold, endThreshold], [0, 1])
            const cardScale = useTransform(smoothProgress, [startThreshold, endThreshold], [0.93, 1])

            return (
              <motion.div
                key={s.num}
                style={{
                  y: cardY,
                  opacity: cardOpacity,
                  scale: cardScale,
                }}
              >
                <Card className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#12111a] hover:border-violet-500/40 transition-colors duration-300 group shadow-lg h-full">
                  <CardHeader className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-violet-950/70 border border-violet-500/30 text-violet-400 group-hover:scale-105 transition-transform">
                        <s.icon className="size-5.5" />
                      </div>
                      <span className="font-mono text-3xl sm:text-4xl font-black text-white/[0.07] group-hover:text-violet-500/20 transition-colors">
                        {s.num}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold tracking-wider text-violet-400 border-violet-500/20 bg-violet-950/20"
                      >
                        {s.badge}
                      </Badge>
                      <CardTitle className="text-lg font-bold text-white leading-snug">
                        {s.title}
                      </CardTitle>
                    </div>

                    <CardDescription className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {s.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
