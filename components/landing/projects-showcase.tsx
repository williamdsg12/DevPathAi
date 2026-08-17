'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  CheckCircle2,
  Code2,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Layers,
  Sparkles,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const projects = [
  {
    title: 'FinTech Dashboard Fullstack',
    category: 'Projeto do Módulo 04',
    desc: 'Dashboard financeiro com métricas em tempo real, gráficos de transações e autenticação com múltiplos níveis de acesso.',
    stack: ['Next.js 15', 'TypeScript', 'Tailwind', 'Recharts'],
    rubricScore: 'Nota 9.8 / 10',
    commits: '42 commits',
  },
  {
    title: 'E-Commerce REST API de Alta Performance',
    category: 'Projeto do Módulo 05',
    desc: 'API completa com catálogo de produtos, controle de estoque atômico, integração de pagamentos e modelagem relacional em PostgreSQL.',
    stack: ['Node.js', 'PostgreSQL', 'Prisma ORM', 'Docker'],
    rubricScore: 'Nota 9.5 / 10',
    commits: '38 commits',
  },
  {
    title: 'DevMentor AI Streaming Chat',
    category: 'Projeto Integrador',
    desc: 'Aplicação de chat em tempo real com streaming de respostas por IA, syntax highlighting e persistência de histórico por sessão.',
    stack: ['React', 'AI SDK', 'Server Actions', 'PostgreSQL'],
    rubricScore: 'Nota 10 / 10',
    commits: '56 commits',
  },
  {
    title: 'TaskFlow: Gerenciador Ágil Multi-Tenant',
    category: 'Projeto de Conclusão',
    desc: 'Sistema Kanban interativo com drag and drop, workspace para times, notificações em tempo real e testes unitários com Jest.',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'Jest'],
    rubricScore: 'Nota 9.6 / 10',
    commits: '64 commits',
  },
]

export function ProjectsShowcase() {
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
    <section ref={sectionRef} className="py-24 sm:py-32 border-t border-white/5 bg-[#0a0910] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <FolderGit2 className="size-3 text-violet-400" /> Projetos Reais para Portfólio
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Aprenda construindo aplicações completas
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Cada módulo exige a entrega de um projeto real publicado no GitHub, avaliado por rubrica ponderada pela IA.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((p, i) => {
            const start = 0.15 + (i * 0.08)
            const end = start + 0.25
            const pY = useTransform(smoothProgress, [start, end], [40, 0])
            const pOpacity = useTransform(smoothProgress, [start, end], [0, 1])

            return (
              <motion.div
                key={p.title}
                style={{
                  y: pY,
                  opacity: pOpacity,
                }}
                className="rounded-3xl border border-white/10 bg-[#12111a] p-6 sm:p-7 space-y-4 hover:border-violet-500/40 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                      {p.category}
                    </span>
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-[10px] font-mono font-bold">
                      {p.rubricScore}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-semibold text-zinc-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <GitBranch className="size-3.5 text-violet-400" /> {p.commits}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold">
                      <Code2 className="size-3.5 text-violet-400" /> Ver Código & Repositório
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProjectsShowcase
