'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Briefcase,
  CheckCircle2,
  FolderGit2,
  Globe,
  GraduationCap,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const careerStages = [
  {
    level: 'Iniciante',
    time: '0 a 2 meses',
    xp: '0 - 1.000 XP',
    desc: 'Construção da base de pensamento computacional, algoritmos e sintaxe limpa no Code Lab.',
    tag: 'Fase Fundamentos',
    color: 'border-violet-500/40 text-violet-300',
  },
  {
    level: 'Júnior',
    time: '3 a 6 meses',
    xp: '1.000 - 3.500 XP',
    desc: 'Primeiros projetos Full Stack com banco de dados, GitHub estruturado e simulador de entrevistas com IA.',
    tag: 'Pronto para Vagas',
    color: 'border-emerald-500/40 text-emerald-300',
  },
  {
    level: 'Pleno',
    time: '1 a 2 anos',
    xp: '3.500 - 8.000 XP',
    desc: 'Domínio de arquitetura, testes unitários, CI/CD e resolução autônoma de problemas complexos de negócio.',
    tag: 'Autonomia Técnica',
    color: 'border-purple-500/40 text-purple-300',
  },
  {
    level: 'Sênior',
    time: '3+ anos',
    xp: '8.000+ XP',
    desc: 'Desenho de sistemas distribuídos, liderança técnica, segurança avançada e otimização de alta escala.',
    tag: 'Liderança & Arquitetura',
    color: 'border-blue-500/40 text-blue-300',
  },
]

const careerPillars = [
  {
    icon: FolderGit2,
    title: 'Portfólio no GitHub',
    desc: 'Projetos reais com commits frequentes, README detalhado e código limpo pronto para recrutadores inspecionarem.',
  },
  {
    icon: Globe,
    title: 'LinkedIn & Posicionamento',
    desc: 'Orientações para destacar suas habilidades técnicas, projetos concluídos e certificados oficiais validados.',
  },
  {
    icon: MessageSquare,
    title: 'Simulador de Entrevistas com IA',
    desc: 'Treine perguntas conceituais e comportamentais com a IA atuando como Tech Lead e receba feedback em tempo real.',
  },
  {
    icon: Trophy,
    title: 'Certificados Validados',
    desc: 'Certificados emitidos após a conclusão dos 5 critérios pedagógicos com código QR e hash de validação pública.',
  },
]

export function CareerProgressSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  return (
    <section
      ref={sectionRef}
      id="carreira"
      className="py-24 sm:py-32 border-t border-white/5 bg-[#0d0c14]/70 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20">
        {/* Top: Career Evolution Timeline */}
        <div className="space-y-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
            <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
              <TrendingUp className="size-3 text-violet-400" /> Jornada de Evolução Profissional
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Do primeiro código até a liderança técnica
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
              Cada marco conquistado na DEVPATH AI prepara você para os desafios reais que o mercado corporativo exige.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {careerStages.map((stage, index) => {
              const start = 0.1 + (index * 0.07)
              const end = start + 0.22
              const stageY = useTransform(smoothProgress, [start, end], [35, 0])
              const stageOpacity = useTransform(smoothProgress, [start, end], [0, 1])

              return (
                <motion.div
                  key={stage.level}
                  style={{
                    y: stageY,
                    opacity: stageOpacity,
                  }}
                  className="rounded-3xl border border-white/10 bg-[#12111a] p-5 sm:p-6 space-y-3 relative hover:border-violet-500/40 transition-colors shadow-lg group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] font-mono font-bold ${stage.color}`}>
                        {stage.tag}
                      </Badge>
                      <span className="text-[11px] font-mono font-bold text-zinc-500">{stage.xp}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white pt-1">{stage.level}</h3>
                    <p className="text-xs text-violet-400 font-medium">{stage.time}</p>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal pt-1">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-3.5" /> Metas Validadas por IA
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom: 4 Employability Pillars */}
        <div className="space-y-12 pt-8 border-t border-white/5">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
              <Briefcase className="size-3 text-violet-400" /> Preparação Profissional
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Não apenas aprenda sintaxe. Prepare-se para ser contratado.
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 font-medium">
              Tudo o que você constrói na DEVPATH AI se transforma em evidências reais de competência.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {careerPillars.map((item, index) => {
              const start = 0.25 + (index * 0.06)
              const end = start + 0.22
              const itemY = useTransform(smoothProgress, [start, end], [35, 0])
              const itemOpacity = useTransform(smoothProgress, [start, end], [0, 1])

              return (
                <motion.div
                  key={item.title}
                  style={{
                    y: itemY,
                    opacity: itemOpacity,
                  }}
                  className="rounded-3xl border border-white/5 bg-[#12111a] p-6 space-y-3.5 hover:border-violet-500/30 transition-all duration-300 shadow-md group h-full"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-violet-950/70 border border-violet-500/30 text-violet-400 group-hover:scale-105 transition-transform">
                    <item.icon className="size-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CareerProgressSection
