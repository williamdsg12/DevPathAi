'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  FolderGit2,
  GraduationCap,
  Layers,
  ListChecks,
  Lock,
  Map,
  Repeat,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const phases = [
  {
    phase: 'FASE 1',
    title: 'Fundamentos & Lógica',
    desc: 'Algoritmos, estruturas de decisão, loops, vetores e pensamento computacional.',
    color: 'border-violet-500/40 text-violet-300',
    accent: 'bg-violet-600',
  },
  {
    phase: 'FASE 2',
    title: 'Frontend & TypeScript',
    desc: 'HTML5 semântico, CSS moderno, JavaScript ES6+, React, Hooks e consumo de APIs.',
    color: 'border-purple-500/40 text-purple-300',
    accent: 'bg-purple-600',
  },
  {
    phase: 'FASE 3',
    title: 'Backend & Bancos de Dados',
    desc: 'Node.js, Express, PostgreSQL, Prisma ORM, autenticação JWT e regras de negócio.',
    color: 'border-indigo-500/40 text-indigo-300',
    accent: 'bg-indigo-600',
  },
  {
    phase: 'FASE 4',
    title: 'Full Stack & DevOps',
    desc: 'Integração ponta a ponta, Docker, CI/CD, testes unitários e deploy em nuvem.',
    color: 'border-blue-500/40 text-blue-300',
    accent: 'bg-blue-600',
  },
  {
    phase: 'FASE 5',
    title: 'Projetos & Carreira',
    desc: 'Aplicações completas no GitHub, portfólio profissional e simulação de entrevistas.',
    color: 'border-emerald-500/40 text-emerald-300',
    accent: 'bg-emerald-600',
  },
]

const features = [
  {
    icon: Bot,
    title: 'DevMentor AI',
    desc: 'Um mentor contextualizado que conhece sua trilha e dificuldades — e explica no seu nível com analogias e dicas reflexivas.',
  },
  {
    icon: Map,
    title: 'Trilhas Inteligentes',
    desc: 'Fases, módulos e pré-requisitos validados. A trilha se recalcula automaticamente conforme seu ritmo de estudo.',
  },
  {
    icon: Code2,
    title: 'Code Lab no Navegador',
    desc: 'Ambiente prático para escrever e testar código em tempo real, com análise de qualidade e sintaxe pela IA.',
  },
  {
    icon: FolderGit2,
    title: 'Projetos Obrigatórios',
    desc: 'Cada módulo exige a entrega de um projeto real no GitHub, avaliado por rubrica ponderada de 0 a 100.',
  },
  {
    icon: ListChecks,
    title: 'Avaliações com Nota de Corte',
    desc: 'Nota mínima de 70% para aprovação. Se não atingir, a IA elabora um Plano de Recuperação imediato.',
  },
  {
    icon: Repeat,
    title: 'Revisão Espaçada',
    desc: 'Algoritmo que programa revisões em intervalos inteligentes para fixar o conteúdo na memória de longo prazo.',
  },
  {
    icon: Trophy,
    title: 'Gamificação & Consistência',
    desc: 'XP por atividade, níveis de desenvolvedor, ranking saudável e streak diário para manter o foco constante.',
  },
  {
    icon: GraduationCap,
    title: 'Preparação para Carreira',
    desc: 'Otimização de perfil no LinkedIn, histórico comprovado no GitHub e simulação de entrevistas técnicas.',
  },
]

export function PersonalizedPathSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
  })

  // Dynamic SVG path drawing progress linked to scroll
  const pathFill = useTransform(smoothProgress, [0.1, 0.55], [0, 1])

  return (
    <section ref={sectionRef} id="trilhas" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20">
        {/* Top: Visual Roadmap representation with SVG Connector */}
        <div className="space-y-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
            <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
              <Layers className="size-3 text-violet-400" /> Estrutura da Trilha
            </Badge>
            <h2 className="text-balance font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Você não recebe uma lista aleatória de vídeos. Recebe um caminho.
            </h2>
            <p className="text-pretty text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
              Cada fase desbloqueia as competências necessárias para a etapa seguinte, garantindo que você nunca avance com lacunas conceituais.
            </p>

            {/* Scroll-linked progress bar between stages */}
            <div className="w-full max-w-lg h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
              <motion.div
                style={{ scaleX: pathFill }}
                className="h-full origin-left bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-400 rounded-full"
              />
            </div>

            {/* AI Decision Pipeline Funnel Visual */}
            <div className="w-full max-w-4xl mx-auto rounded-3xl border border-violet-500/30 bg-[#0f0e1a]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl mt-6">
              <div className="text-center space-y-1 mb-6">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-violet-400">
                  Como a Inteligência Artificial Constrói Sua Trilha
                </span>
                <p className="text-xs text-zinc-400">
                  A IA analisa seu momento individual e gera uma progressão pedagógica adaptativa
                </p>
              </div>

              {/* Steps Funnel */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-violet-400">01</div>
                  <div className="text-xs font-bold text-white">Nível Atual</div>
                  <div className="text-[10px] text-zinc-400">Diagnóstico real</div>
                </div>
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-purple-400">02</div>
                  <div className="text-xs font-bold text-white">Objetivo</div>
                  <div className="text-[10px] text-zinc-400">Cargo & Carreira</div>
                </div>
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-indigo-400">03</div>
                  <div className="text-xs font-bold text-white">Tempo Disponível</div>
                  <div className="text-[10px] text-zinc-400">Horas por dia</div>
                </div>
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
                  <div className="text-[10px] font-mono font-bold text-blue-400">04</div>
                  <div className="text-xs font-bold text-white">Perfil Dev</div>
                  <div className="text-[10px] text-zinc-400">Histórico & Estilo</div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-400">05</div>
                  <div className="text-xs font-bold text-emerald-300">Trilha Única</div>
                  <div className="text-[10px] text-emerald-400/80">Roadmap Prático</div>
                </div>
              </div>

              {/* Status Legend Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-3.5" /> Conteúdo concluído
                </div>
                <div className="flex items-center gap-1.5 text-violet-400 font-semibold">
                  <span className="size-2.5 rounded-full bg-violet-400 animate-pulse" /> Conteúdo atual
                </div>
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <span className="size-2.5 rounded-full border border-sky-400" /> Próximo conteúdo
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
                  <Lock className="size-3.5" /> Conteúdo bloqueado
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 relative">
            {phases.map((p, i) => {
              const start = 0.12 + (i * 0.08)
              const end = start + 0.2
              const phaseY = useTransform(smoothProgress, [start, end], [40, 0])
              const phaseOpacity = useTransform(smoothProgress, [start, end], [0, 1])
              const phaseScale = useTransform(smoothProgress, [start, end], [0.92, 1])

              return (
                <motion.div
                  key={p.phase}
                  style={{
                    y: phaseY,
                    opacity: phaseOpacity,
                    scale: phaseScale,
                  }}
                  className="rounded-2xl border border-white/10 bg-[#12111a] p-5 space-y-3 relative hover:border-violet-500/40 transition-colors shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-mono font-bold ${p.color}`}>
                      {p.phase}
                    </Badge>
                    <span className="text-[10px] font-bold text-zinc-500">Passo 0{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{p.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom: All 8 Platform Features */}
        <div className="space-y-12 pt-8 border-t border-white/5">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <Badge className="bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-bold gap-1.5 px-3 py-1">
              <Sparkles className="size-3 text-violet-400" /> Recursos da Plataforma
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Tudo o que você precisa para se tornar dev, em um só lugar
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 font-medium">
              Do primeiro comando no terminal até a sua aprovação na entrevista técnica.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, index) => {
              const start = 0.25 + (index * 0.05)
              const end = start + 0.2
              const fY = useTransform(smoothProgress, [start, end], [30, 0])
              const fOpacity = useTransform(smoothProgress, [start, end], [0, 1])

              return (
                <motion.div
                  key={f.title}
                  style={{
                    y: fY,
                    opacity: fOpacity,
                  }}
                  className="h-full"
                >
                  <Card className="h-full rounded-2xl border border-white/5 bg-[#100f18] hover:border-violet-500/30 transition-all duration-300 group shadow-md">
                    <CardHeader className="p-5 sm:p-6 space-y-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-violet-950/70 border border-violet-500/30 text-violet-400 group-hover:scale-105 transition-transform">
                        <f.icon className="size-5" />
                      </div>
                      <CardTitle className="text-base font-bold text-white">{f.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                        {f.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PersonalizedPathSection
