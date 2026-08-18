'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Play,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'
import type { LearningModule, ModuleStatus } from '@/lib/types'

interface WindingJourneyMapProps {
  onSelectModule?: (moduleId: string) => void
  selectedModuleId?: string
  compact?: boolean
}

export function WindingJourneyMap({
  onSelectModule,
  selectedModuleId,
  compact = false,
}: WindingJourneyMapProps) {
  const {
    allModules,
    allLessons,
    allCourses,
    moduleProgress,
    moduleStatus,
    isModuleUnlocked,
    currentModuleId,
    completedLessons,
    completedExercises,
    activities,
  } = useAppStore()

  // Canonical Learning Journey Phases mapped directly to authentic catalog modules
  const journeyPhases = [
    {
      phaseNumber: 1,
      moduleId: 'mod-logica',
      title: 'Lógica de Programação & Algoritmos',
      subtitle: '17 aulas com Gustavo Guanabara: variáveis, condicionais, laços, vetores e matrizes',
      color: 'from-violet-500 to-indigo-600',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400',
      accentColor: '#8B5CF6',
      icon: 'brain',
      items: ['17 Aulas do Guanabara', 'Exercícios no Code Lab', 'Visualg & Algoritmos'],
    },
    {
      phaseNumber: 2,
      moduleId: 'mod-algoritmos',
      title: 'Algoritmos e Estruturas de Dados',
      subtitle: 'Complexidade Big-O, matrizes, pilhas, filas e algoritmos de busca',
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      accentColor: '#F59E0B',
      icon: 'code',
      items: ['Complexidade Big-O', 'Pilhas & Filas', 'Busca e Ordenação'],
    },
    {
      phaseNumber: 3,
      moduleId: 'mod-git',
      title: 'Git & GitHub Profissional',
      subtitle: 'Terminal, branches, commits semânticos, merge e Pull Requests',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      accentColor: '#0EA5E9',
      icon: 'git',
      items: ['Repositório no GitHub', 'Fluxo de Branches', 'Merge Conflicts'],
    },
    {
      phaseNumber: 4,
      moduleId: 'mod-html',
      title: 'HTML5 Semântico & Estruturação Web',
      subtitle: 'Semântica web moderna, formulários, tabelas, SEO e acessibilidade WCAG',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      accentColor: '#F97316',
      icon: 'layout',
      items: ['Semântica HTML5', 'Formulários & Mídias', 'SEO & Acessibilidade'],
    },
    {
      phaseNumber: 5,
      moduleId: 'mod-css',
      title: 'CSS3, Flexbox & CSS Grid',
      subtitle: 'Layouts responsivos, Mobile-First, Flexbox, Grid e tipografia moderna',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      accentColor: '#3B82F6',
      icon: 'palette',
      items: ['Box Model & Cores', 'Flexbox & CSS Grid', 'Mobile-First Design'],
    },
    {
      phaseNumber: 6,
      moduleId: 'mod-js',
      title: 'JavaScript Moderno (ES6+) & DOM',
      subtitle: '16 aulas oficiais: variáveis, funções, DOM, eventos, loops e consumo de APIs',
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      textColor: 'text-yellow-300',
      accentColor: '#FBBF24',
      icon: 'zap',
      items: ['16 Aulas Oficiais', 'Manipulação do DOM', 'Fetch API & REST'],
    },
    {
      phaseNumber: 7,
      moduleId: 'mod-react',
      title: 'React 19 & TypeScript',
      subtitle: 'Componentes reativos, JSX, hooks (useState, useEffect), props e SPA',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-300',
      accentColor: '#06B6D4',
      icon: 'atom',
      items: ['Componentes com TS', 'Hooks de Estado', 'SPA & Rotas'],
    },
    {
      phaseNumber: 8,
      moduleId: 'mod-node',
      title: 'Node.js, Express & APIs RESTful',
      subtitle: 'Servidores HTTP, rotas, middlewares, controllers, arquitetura MVC e JWT',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      accentColor: '#10B981',
      icon: 'server',
      items: ['Endpoints REST', 'Arquitetura MVC', 'Autenticação JWT'],
    },
    {
      phaseNumber: 9,
      moduleId: 'mod-db',
      title: 'Bancos de Dados & SQL',
      subtitle: 'Modelagem relacional, CRUD, consultas com SELECT, JOINs e integridade',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      accentColor: '#F43F5E',
      icon: 'database',
      items: ['Modelagem Relacional', 'CRUD & JOINs', 'Consultas SQL'],
    },
    {
      phaseNumber: 10,
      moduleId: 'mod-fullstack',
      title: 'Projetos Práticos & Full Stack',
      subtitle: 'Integração Front-end + Back-end + Banco de Dados em produção com CI/CD',
      color: 'from-teal-400 to-emerald-500',
      bgColor: 'bg-teal-400/10',
      borderColor: 'border-teal-400/30',
      textColor: 'text-teal-300',
      accentColor: '#14B8A6',
      icon: 'layers',
      items: ['Full Stack na Prática', 'Deploy na Nuvem', 'Code Review por IA'],
    },
    {
      phaseNumber: 11,
      moduleId: 'mod-carreira',
      title: 'Carreira, Simulação & Certificação',
      subtitle: 'Portfólio verificado no GitHub, simulador de entrevistas e certificação oficial',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-400/30',
      textColor: 'text-amber-300',
      accentColor: '#F59E0B',
      icon: 'trophy',
      items: ['Portfólio no GitHub', 'Simulador de Entrevistas', 'Certificado Oficial'],
    },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto py-6">
      {/* Starting Island Sign */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-950/80 to-[#181628] border border-violet-500/40 px-5 py-2.5 shadow-xl shadow-purple-950/50">
          <span className="text-base">🚀</span>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            INÍCIO DA TRILHA DE FORMAÇÃO
          </span>
        </div>
        <div className="h-6 w-0.5 bg-gradient-to-b from-violet-500 to-transparent" />
      </div>

      {/* Interactive Winding Path */}
      <div className="relative flex flex-col items-center space-y-12">
        {journeyPhases.map((phase, idx) => {
          // Resolve authentic module from catalog
          const mod = allModules.find((m) => m.id === phase.moduleId) || allModules.find((m) => m.order === phase.phaseNumber) || allModules[0]
          const rawStatus: ModuleStatus = mod ? moduleStatus(mod.id) : 'locked'
          const isUnlocked = mod ? isModuleUnlocked(mod.id) : false

          // Dynamic pedagogical progression calculation:
          // Phase 1 (mod-logica): Starts as 'in_progress' (Estudando Agora / Executar) if not yet completed
          let status: 'completed' | 'in_progress' | 'locked' = 'locked'
          if (rawStatus === 'completed') {
            status = 'completed'
          } else if (rawStatus === 'in-progress' || (isUnlocked && (idx === 0 || mod.id === currentModuleId || rawStatus === 'available'))) {
            status = 'in_progress'
          } else {
            status = 'locked'
          }

          // Positioning: Alternate Center / Left / Right
          const position = idx % 3 === 0 ? 'center' : idx % 3 === 1 ? 'left' : 'right'
          const isSelected = selectedModuleId === phase.moduleId
          const isCurrentActive = status === 'in_progress'
          const isDone = status === 'completed'
          const isLocked = status === 'locked'

          // Find the exact real pending lesson for this module
          const pendingLessonId =
            mod?.lessonIds.find((id) => !completedLessons.includes(id)) ||
            mod?.lessonIds[0] ||
            'l-logica-1'

          // Calculate progress percentage inside this specific module
          const modTotalLessons = mod?.lessonIds.length || 1
          const modCompletedLessons = mod?.lessonIds.filter((id) => completedLessons.includes(id)).length || 0
          const modPercent = Math.round((modCompletedLessons / modTotalLessons) * 100)

          return (
            <div
              key={phase.phaseNumber}
              className={`relative w-full flex flex-col items-center transition-all ${
                position === 'left'
                  ? 'sm:items-start sm:pl-8'
                  : position === 'right'
                  ? 'sm:items-end sm:pr-8'
                  : 'items-center'
              }`}
            >
              {/* Curved Pathway Connector Line */}
              {idx > 0 && (
                <div
                  className={`absolute -top-12 h-12 w-1 transition-colors ${
                    isDone || isCurrentActive
                      ? 'bg-gradient-to-b from-violet-500 to-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                      : 'bg-white/10'
                  }`}
                  style={{
                    left:
                      position === 'left'
                        ? 'calc(50% - 120px)'
                        : position === 'right'
                        ? 'calc(50% + 120px)'
                        : '50%',
                  }}
                />
              )}

              {/* Checkpoint Node Platform + Card */}
              <div
                onClick={() => onSelectModule && mod && onSelectModule(mod.id)}
                className={`group relative flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 rounded-3xl border transition-all duration-300 cursor-pointer max-w-lg w-full ${
                  isCurrentActive
                    ? 'border-violet-500 bg-gradient-to-r from-violet-950/60 via-[#18152c] to-[#12111d] ring-2 ring-violet-500/50 shadow-2xl shadow-purple-950/80 scale-[1.02]'
                    : isDone
                    ? 'border-emerald-500/30 bg-[#12111d] hover:border-emerald-500/60 shadow-lg'
                    : 'border-white/5 bg-[#100f18]/60 opacity-65 hover:opacity-90 hover:border-white/15'
                } ${isSelected ? 'ring-2 ring-white/50' : ''}`}
              >
                {/* 3D-Style Squircle Stepping Stone Icon */}
                <div className="relative shrink-0">
                  <div
                    className={`grid size-16 place-items-center rounded-3xl font-black text-lg transition-transform duration-300 group-hover:scale-105 shadow-xl ${
                      isDone
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/30'
                        : isCurrentActive
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-600/50 animate-pulse'
                        : 'bg-white/5 text-zinc-500 border border-white/10'
                    }`}
                  >
                    {isDone ? (
                      <Check className="size-8 stroke-[3]" />
                    ) : isCurrentActive ? (
                      <Play className="size-7 fill-white ml-0.5" />
                    ) : (
                      <Lock className="size-6 text-zinc-500" />
                    )}
                  </div>

                  {/* Flag Number Badge */}
                  <span
                    className={`absolute -top-2 -left-2 grid size-6 place-items-center rounded-full text-[10px] font-black font-mono shadow-md ${
                      isDone
                        ? 'bg-emerald-400 text-black'
                        : isCurrentActive
                        ? 'bg-violet-400 text-black'
                        : 'bg-zinc-700 text-white'
                    }`}
                  >
                    {phase.phaseNumber}
                  </span>
                </div>

                {/* Phase Info & Bullet Checklist */}
                <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 font-mono">
                      FASE {phase.phaseNumber} • {mod?.technology || 'Fundamentos'}
                    </span>

                    {isDone ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold gap-1">
                        <CheckCircle2 className="size-3" /> Concluído ({modPercent}%)
                      </Badge>
                    ) : isCurrentActive ? (
                      <Badge className="bg-violet-600 text-white text-[10px] font-bold gap-1 shadow-sm">
                        <Zap className="size-3 fill-white" /> Estudando Agora
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/5 text-zinc-500 border border-white/5 text-[10px] gap-1">
                        <Lock className="size-2.5" /> Bloqueado
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-violet-300 transition-colors">
                    {phase.title}
                  </h3>

                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {phase.subtitle}
                  </p>

                  {/* Bullets checklist items */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-300 font-medium pt-1">
                    {phase.items.map((item, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="size-1 rounded-full bg-violet-400" /> {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Link to the exact real lesson */}
                {!isLocked && (
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <Link href={`/aulas/${pendingLessonId}`}>
                      <Button
                        size="sm"
                        className={`font-bold text-xs rounded-xl shadow-md cursor-pointer ${
                          isCurrentActive
                            ? 'bg-violet-600 hover:bg-violet-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {isDone ? 'Revisar' : 'Acessar'} <ChevronRight className="size-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Final Trophy Island / Finish Line */}
        <div className="flex flex-col items-center pt-8 text-center">
          <div className="h-10 w-0.5 bg-gradient-to-b from-violet-500 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <div className="relative mt-2 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 via-[#18152c] to-[#12111d] p-6 text-center max-w-sm shadow-2xl shadow-amber-500/20">
            <div className="mx-auto size-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black grid place-items-center text-3xl font-black shadow-xl shadow-amber-500/40 mb-3">
              🏆
            </div>
            <h4 className="text-base font-black text-white">TRILHA CONCLUÍDA</h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Formação completa com portfólio validado e certificado emitido com autenticidade criptográfica.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

