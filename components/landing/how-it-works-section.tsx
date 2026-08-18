'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Award,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  Code2,
  FolderGit2,
  GraduationCap,
  MessageSquareText,
  Repeat,
  Route,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    num: '01',
    icon: Brain,
    badge: 'Diagnóstico & Nivelamento',
    title: 'Mapeamento do seu nível inicial',
    desc: 'O diagnóstico por IA avalia seus conhecimentos atuais, histórico e rotina diária para você não perder tempo com o que já domina.',
  },
  {
    num: '02',
    icon: Route,
    badge: 'Trilha Personalizada',
    title: 'Geração do seu Roadmap de Carreira',
    desc: 'A IA constrói sua trilha sob medida em fases lógicas com pré-requisitos conectados e foco nas tecnologias mais demandadas pelo mercado.',
  },
  {
    num: '03',
    icon: GraduationCap,
    badge: 'Aulas Direto ao Ponto',
    title: 'Fundamentos sólidos sem enrolação',
    desc: 'Conteúdo focado e aulas com exemplos práticos, transcrições e explicações conceituais claras.',
  },
  {
    num: '04',
    icon: Code2,
    badge: 'Exercícios Práticos',
    title: 'Fixação profunda com desafios de código',
    desc: 'Múltipla escolha, preenchimento de lacunas, depuração de bugs e testes automatizados que validam seu raciocínio lógico.',
  },
  {
    num: '05',
    icon: FolderGit2,
    badge: 'Projetos de Mercado',
    title: 'Construção de aplicações reais',
    desc: 'Desenvolva projetos práticos orientados a especificações de mercado, conectando seus repositórios do GitHub.',
  },
  {
    num: '06',
    icon: Target,
    badge: 'Avaliação & Feedback',
    title: 'Rubrica e nota de corte mínima de 70%',
    desc: 'Testes de checkpoint e revisão automatizada de código pela IA para garantir que você realmente assimilou cada competência.',
  },
  {
    num: '07',
    icon: Briefcase,
    badge: 'Portfólio Validado',
    title: 'Página pública para recrutadores',
    desc: 'Seus projetos, badges e certificados oficiais são publicados em devpath.ai/u/seunome para demonstrar senioridade.',
  },
  {
    num: '08',
    icon: Trophy,
    badge: 'Evolução Profissional',
    title: 'Simulação de entrevistas e contratação',
    desc: 'Treinamento de entrevistas técnicas com o DevMentor AI e preparação estratégica para processos seletivos e promoção.',
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

  // Scroll indicator line across the 8 steps
  const lineScaleX = useTransform(smoothProgress, [0.12, 0.85], [0, 1])

  return (
    <section ref={sectionRef} id="como-funciona" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <Sparkles className="size-3 text-violet-400" /> Metodologia em 8 Etapas
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Como você aprende e evolui na DevPath AI
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Uma jornada pedagógica estruturada do diagnóstico inicial até sua contratação como desenvolvedor profissional.
          </p>

          {/* Scroll-linked dynamic progress tracker */}
          <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <motion.div
              style={{ scaleX: lineScaleX }}
              className="h-full origin-left bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-400 rounded-full"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, index) => {
            const startThreshold = 0.1 + index * 0.07
            const endThreshold = startThreshold + 0.22

            const cardY = useTransform(smoothProgress, [startThreshold, endThreshold], [45, 0])
            const cardOpacity = useTransform(smoothProgress, [startThreshold, endThreshold], [0, 1])
            const cardScale = useTransform(smoothProgress, [startThreshold, endThreshold], [0.94, 1])

            return (
              <motion.div
                key={s.num}
                style={{
                  y: cardY,
                  opacity: cardOpacity,
                  scale: cardScale,
                }}
              >
                <Card className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#12111a] hover:border-violet-500/40 transition-colors duration-300 group shadow-lg h-full flex flex-col justify-between">
                  <CardHeader className="p-6 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="grid size-11 place-items-center rounded-2xl bg-violet-950/70 border border-violet-500/30 text-violet-400 group-hover:scale-105 transition-transform">
                        <s.icon className="size-5" />
                      </div>
                      <span className="font-mono text-3xl font-black text-white/[0.07] group-hover:text-violet-500/20 transition-colors">
                        {s.num}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase font-bold tracking-wider text-violet-400 border-violet-500/20 bg-violet-950/20"
                      >
                        {s.badge}
                      </Badge>
                      <CardTitle className="text-base font-bold text-white leading-snug">
                        {s.title}
                      </CardTitle>
                    </div>

                    <CardDescription className="text-xs text-zinc-400 leading-relaxed font-normal">
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

export default HowItWorksSection
