'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, BookOpen, Code2, Sparkles, Star, Users } from 'lucide-react'

interface StatItem {
  id: string
  value: number
  suffix: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const stats: StatItem[] = [
  {
    id: 'students',
    value: 100000,
    suffix: '+',
    label: 'Aulas & Exercícios Concluídos',
    description: 'Fixação prática com correção e feedback contínuo',
    icon: BookOpen,
  },
  {
    id: 'projects',
    value: 15000,
    suffix: '+',
    label: 'Projetos Desenvolvidos',
    description: 'Aplicações reais publicadas no GitHub e Code Lab',
    icon: Code2,
  },
  {
    id: 'approval',
    value: 98,
    suffix: '.4%',
    label: 'Aprovação em Avaliações',
    description: 'Com nota de corte pedagógica de no mínimo 70%',
    icon: Award,
  },
  {
    id: 'satisfaction',
    value: 4.9,
    suffix: ' / 5.0',
    label: 'Satisfação dos Alunos',
    description: 'Mais de 1.200 avaliações de desenvolvedores reais',
    icon: Star,
  },
]

function Counter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const end = value
    const duration = 1800
    const steps = 60
    const increment = end / steps
    const stepTime = duration / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayVal(end)
        clearInterval(timer)
      } else {
        setDisplayVal(value % 1 !== 0 ? parseFloat(start.toFixed(1)) : Math.floor(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span className="font-mono font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
      {displayVal.toLocaleString('pt-BR')}
      <span className="text-violet-400">{suffix}</span>
    </span>
  )
}

export function StatsCounterSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section ref={ref} className="relative w-full py-16 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent pointer-events-none" />

      <div className="rounded-3xl border border-violet-500/20 bg-[#100f1c]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-3.5 py-1 text-xs font-bold text-violet-300">
            <Sparkles className="size-3 text-violet-400" /> Resultados & Credibilidade
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Metodologia validada por quem constrói software
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
            Números que comprovam a eficiência da formação estruturada guiada por inteligência artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-violet-500/30 hover:bg-violet-950/20 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 group-hover:scale-110 transition-transform">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                    Métrica #{idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <Counter value={item.value} suffix={item.suffix} inView={inView} />
                  <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
