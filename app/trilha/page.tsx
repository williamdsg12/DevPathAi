'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Flame,
  FolderGit2,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Play,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Unlock,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'
import type { LearningModule, LearningPathItem, ModuleStatus } from '@/lib/types'

export default function LearningPathPage() {
  const {
    activePath,
    allModules,
    allLessons,
    moduleProgress,
    moduleStatus,
    isModuleUnlocked,
    currentModuleId,
    nextPendingLessonId,
    completedLessons,
    isSuperAdmin,
  } = useAppStore()

  const [selectedModuleId, setSelectedModuleId] = useState<string>(currentModuleId || allModules[0]?.id || '')

  useEffect(() => {
    if (currentModuleId && !selectedModuleId) {
      setSelectedModuleId(currentModuleId)
    }
  }, [currentModuleId, selectedModuleId])

  // 6 Definitive Learning Journey Levels
  const journeyLevels = [
    { level: 1, title: 'NÍVEL 01 — Fundamentos & Algoritmos', description: 'Base sólida de lógica, estruturas de controle e raciocínio computacional.' },
    { level: 2, title: 'NÍVEL 02 — Ferramentas & Controle de Versão', description: 'Git, GitHub, terminal e workflow profissional de desenvolvimento.' },
    { level: 3, title: 'NÍVEL 03 — Desenvolvimento Web & Estrutura', description: 'HTML5 semântico, CSS3 moderno, flexbox, grid e responsividade.' },
    { level: 4, title: 'NÍVEL 04 — Programação & Tecnologias Centrais', description: 'JavaScript moderno (ES6+), manipulação do DOM e lógica aplicada.' },
    { level: 5, title: 'NÍVEL 05 — Especialização Front-end & Back-end', description: 'React 19, consumo de APIs, Node.js e bancos de dados relacionais.' },
    { level: 6, title: 'NÍVEL 06 — Projetos Reais, Portfólio & Carreira', description: 'Construção de aplicações completas e preparação para processos seletivos.' },
  ]

  const selectedModule = allModules.find((m) => m.id === selectedModuleId) || allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const selModStatus = selectedModule ? moduleStatus(selectedModule.id) : 'locked'
  const selModProgress = selectedModule ? moduleProgress[selectedModule.id] : null
  const SelIcon = selectedModule ? getIcon(selectedModule.icon) : BookOpen

  const prereqModules = selectedModule
    ? selectedModule.prerequisites.map((pid) => allModules.find((m) => m.id === pid)).filter(Boolean)
    : []
  const moduleLessons = selectedModule
    ? allLessons.filter((l) => selectedModule.lessonIds.includes(l.id)).sort((a, b) => a.order - b.order)
    : []

  const currentPathItem: LearningPathItem | undefined = selectedModule
    ? activePath?.items?.find((i) => i.moduleId === selectedModule.id)
    : undefined

  if (allModules.length === 0 || !selectedModule) {
    return (
      <AppShell
        title="Minha Trilha"
        subtitle="Seu caminho personalizado para se tornar um desenvolvedor."
      >
        <div className="space-y-8">
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 rounded-3xl bg-[#12111d] space-y-4">
            <div className="size-16 rounded-full bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Layers className="size-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-white">Trilha Aguardando Cursos</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nenhum módulo ou curso está cadastrado no momento.
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  const continueLessonId = nextPendingLessonId || moduleLessons[0]?.id || allLessons[0]?.id || ''

  return (
    <AppShell
      title="Minha Trilha"
      subtitle="Seu caminho personalizado estruturado por IA para se tornar um desenvolvedor"
    >
      <div className="space-y-8 pb-16">
        {/* Banner Hero Trilha */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/50 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                {isSuperAdmin ? (
                  <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold px-3 py-0.5 text-xs gap-1.5 shadow-sm">
                    <Sparkles className="size-3 text-violet-400" />
                    Modo Administrador • Acesso Total aos Módulos
                  </Badge>
                ) : (
                  <Badge className="bg-violet-950 border border-violet-500/30 text-violet-300 font-bold px-3 py-0.5 text-xs">
                    Trilha Adaptativa
                  </Badge>
                )}
                <span className="text-xs text-zinc-400 font-medium">
                  Estruturada para {activePath?.customizedFor || 'você'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {activePath?.title || 'Formação Desenvolvedor Full Stack JavaScript'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {activePath?.description || 'Jornada sequencial estruturada a partir de fundamentos, prática guiada e projetos de mercado.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {continueLessonId && (
                <Link href={`/aulas/${continueLessonId}`}>
                  <Button className="gap-2 font-black text-xs sm:text-sm px-7 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-purple-600/30 border border-violet-400/30">
                    <Play className="size-4 fill-white" /> Continuar Trilha
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Grid: Skill Tree Timeline de Níveis (2 Cols) + Inspetor Lateral (1 Col) */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Coluna da Esquerda: Jornada Progressiva Nível a Nível */}
          <div className="lg:col-span-2 space-y-10">
            {journeyLevels.map((lvl, lvlIdx) => {
              const levelMods = allModules.filter((m) => m.phaseOrder === lvl.level)
              if (levelMods.length === 0) return null

              return (
                <div key={lvl.level} className="relative space-y-4">
                  {/* Visual Node & Level Heading */}
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-black text-white shadow-md shadow-purple-600/30 border border-violet-400/30">
                      {lvl.level}
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                        {lvl.title}
                      </h2>
                      <p className="text-[11px] text-zinc-400 font-medium">{lvl.description}</p>
                    </div>
                  </div>

                  {/* Modules Cards in this Level */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {levelMods.map((mod) => {
                      const status: ModuleStatus = moduleStatus(mod.id)
                      const isSelected = selectedModuleId === mod.id
                      const Icon = getIcon(mod.icon)
                      const prog = moduleProgress[mod.id]
                      const totalLessonsCount = mod.lessonIds.length
                      const doneLessonsCount = prog?.lessonsCompleted ?? 0
                      const percent = totalLessonsCount > 0 ? Math.round((doneLessonsCount / totalLessonsCount) * 100) : 0
                      const pathItem = activePath?.items?.find((i) => i.moduleId === mod.id)
                      const isLocked = status === 'locked'

                      return (
                        <div
                          key={mod.id}
                          onClick={() => setSelectedModuleId(mod.id)}
                          className={`cursor-pointer group relative rounded-3xl border p-5 transition-all duration-200 ${
                            isSelected
                              ? 'border-violet-500 bg-violet-950/40 ring-2 ring-violet-500/50 shadow-xl shadow-purple-950/40'
                              : isLocked
                              ? 'border-white/5 bg-[#12111d]/40 opacity-60 hover:opacity-90 hover:border-white/10'
                              : 'border-white/5 bg-[#12111d] hover:border-violet-500/40 hover:bg-[#161424]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid size-11 place-items-center rounded-2xl transition-all ${
                                  status === 'completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : !isLocked
                                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm'
                                    : 'bg-white/5 text-zinc-500 border border-white/5'
                                }`}
                              >
                                <Icon className="size-5" />
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                                  {mod.title}
                                </h3>
                                <span className="text-[11px] text-zinc-400">
                                  {totalLessonsCount} aulas • {mod.estimatedHours}h
                                </span>
                              </div>
                            </div>

                            {/* Status Badges */}
                            {status === 'completed' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold gap-1">
                                <CheckCircle2 className="size-3" /> Concluído
                              </Badge>
                            ) : status === 'in-progress' ? (
                              <Badge className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold">
                                Em Andamento
                              </Badge>
                            ) : !isLocked ? (
                              <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px] font-bold">
                                <Unlock className="size-2.5 mr-1" /> Disponível
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-white/5 text-zinc-500 text-[10px] gap-1 border border-white/5">
                                <Lock className="size-3" /> Bloqueado
                              </Badge>
                            )}
                          </div>

                          {/* Pedagogical Reason Snippet */}
                          {pathItem?.recommendationReason ? (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-3 pt-2.5 border-t border-white/5 font-medium">
                              💡 {pathItem.recommendationReason}
                            </p>
                          ) : null}

                          {/* Module Progress Bar */}
                          {!isLocked && (
                            <div className="space-y-1.5 pt-3">
                              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                <span>{doneLessonsCount} de {totalLessonsCount} aulas</span>
                                <span className="text-violet-400 font-mono">{percent}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                <div
                                  style={{ width: `${percent}%` }}
                                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Connective indicator between levels */}
                  {lvlIdx < journeyLevels.length - 1 && (
                    <div className="flex justify-center pt-2 text-zinc-600">
                      <ChevronDown className="size-5 animate-bounce text-violet-400/60" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Coluna da Direita: Inspetor do Módulo Selecionado (Sticky) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400">
                    Detalhes do Módulo
                  </span>
                  {selModStatus === 'completed' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">Concluído</Badge>
                  ) : selModStatus === 'locked' ? (
                    <Badge variant="secondary" className="bg-white/5 text-zinc-500 border border-white/5 text-[10px] gap-1">
                      <Lock className="size-3" /> Bloqueado
                    </Badge>
                  ) : (
                    <Badge className="bg-violet-600 text-white text-[10px] font-bold">Disponível</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-violet-600/15 text-violet-400 border border-violet-500/30">
                    <SelIcon className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-white">{selectedModule.title}</CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                      {moduleLessons.length} aulas reais • {selectedModule.estimatedHours}h estimadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5 text-xs">
                {/* Objetivo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Objetivo Pedagógico</span>
                  <p className="text-zinc-300 leading-relaxed font-medium">
                    {selectedModule.objective || selectedModule.description}
                  </p>
                </div>

                {/* Skills */}
                {selectedModule.skills && selectedModule.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Competências Desenvolvidas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModule.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-zinc-300 font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aulas do módulo */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Aulas do Módulo</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {moduleLessons.map((lesson) => {
                      const isDone = completedLessons.includes(lesson.id)
                      return (
                        <Link
                          key={lesson.id}
                          href={`/aulas/${lesson.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-violet-600/15 border border-white/5 hover:border-violet-500/30 text-xs text-zinc-300 transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Play className="size-3 text-zinc-500 group-hover:text-violet-400 shrink-0" />
                            )}
                            <span className="truncate font-semibold text-[11px] group-hover:text-white">
                              {lesson.order}. {lesson.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">{lesson.durationMin || 20}m</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {moduleLessons.length > 0 && (
                    <Link href={`/aulas/${moduleLessons[0].id}`}>
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-5 rounded-xl shadow-lg shadow-purple-600/25">
                        <Play className="size-4 fill-white mr-1" /> Acessar Módulo
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
