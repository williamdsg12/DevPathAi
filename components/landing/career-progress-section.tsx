'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Briefcase,
  FolderGit2,
  Globe,
  MessageSquare,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <Briefcase className="size-3 text-violet-400" /> Preparação Profissional
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Não apenas aprenda sintaxe. Prepare-se para ser contratado.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Tudo o que você constrói na DEVPATH AI se transforma em evidências reais de competência para o mercado de tecnologia.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {careerPillars.map((item, index) => {
            const start = 0.15 + (index * 0.08)
            const end = start + 0.25
            const itemY = useTransform(smoothProgress, [start, end], [40, 0])
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
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
