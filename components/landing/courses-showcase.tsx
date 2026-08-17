'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Layers,
  PlayCircle,
  Sparkles,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const courses = [
  {
    title: 'Lógica de Programação & Algoritmos',
    desc: 'Do zero absoluto: variáveis, condicionais, loops, vetores, matrizes e pensamento computacional estruturado.',
    lessons: 24,
    hours: '14h',
    level: 'Iniciante',
    instructor: 'Prof. Lucas Mendes',
    tags: ['Lógica', 'Algoritmos', 'Fundamentos'],
    color: 'border-violet-500/30 text-violet-400 bg-violet-950/20',
  },
  {
    title: 'JavaScript Moderno ES6+ & TypeScript',
    desc: 'Funções de ordem superior, promises, async/await, tipagem estática, generics e manipulação do DOM.',
    lessons: 38,
    hours: '22h',
    level: 'Intermediário',
    instructor: 'Prof. Rafael Lima',
    tags: ['JavaScript', 'TypeScript', 'Async'],
    color: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
  },
  {
    title: 'React 19, Next.js & Interfaces Reativas',
    desc: 'Componentização, Server Components, Hooks customizados, roteamento por App Router e Tailwind CSS.',
    lessons: 42,
    hours: '28h',
    level: 'Avançado',
    instructor: 'Profa. Marina Costa',
    tags: ['React', 'Next.js', 'Tailwind'],
    color: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/20',
  },
  {
    title: 'Node.js, PostgreSQL & Arquitetura de APIs',
    desc: 'Construção de APIs REST robustas, autenticação JWT, Prisma ORM, modelagem relacional e testes unitários.',
    lessons: 36,
    hours: '25h',
    level: 'Avançado',
    instructor: 'Prof. Carlos Eduardo',
    tags: ['Node.js', 'PostgreSQL', 'Prisma'],
    color: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
  },
]

export function CoursesShowcase() {
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
    <section ref={sectionRef} className="py-24 sm:py-32 border-t border-white/5 bg-[#0d0c14]/50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center mb-16">
          <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
            <BookOpen className="size-3 text-violet-400" /> Catálogo de Cursos & Módulos
          </Badge>
          <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Conteúdo curado, estruturado e direto ao ponto
          </h2>
          <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Cada curso faz parte de uma sequência estratégica para garantir que você construa aplicações completas do início ao fim.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c, i) => {
            const start = 0.15 + (i * 0.07)
            const end = start + 0.25
            const cardY = useTransform(smoothProgress, [start, end], [40, 0])
            const cardOpacity = useTransform(smoothProgress, [start, end], [0, 1])

            return (
              <motion.div
                key={c.title}
                style={{
                  y: cardY,
                  opacity: cardOpacity,
                }}
                className="h-full"
              >
                <Card className="h-full rounded-3xl border border-white/10 bg-[#12111a] hover:border-violet-500/40 transition-all duration-300 group shadow-lg flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] font-mono font-bold ${c.color}`}>
                        {c.level}
                      </Badge>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="size-3 text-zinc-500" /> {c.hours}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                      {c.title}
                    </CardTitle>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {c.desc}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 pt-0 space-y-3 border-t border-white/5 mt-auto">
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="size-3.5 text-violet-400" /> {c.lessons} aulas
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <User className="size-3 text-zinc-500" /> {c.instructor.split(' ')[1]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CoursesShowcase
