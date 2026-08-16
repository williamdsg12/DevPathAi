'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  FolderGit2,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'
import type { LearningModule, LearningPathItem, ModuleStatus, TrailItemStatus } from '@/lib/types'

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
  } = useAppStore()

  const [selectedModuleId, setSelectedModuleId] = useState<string>(currentModuleId || allModules[0]?.id || '')

  // Keep selectedModuleId in sync if currentModuleId changes
  useEffect(() => {
    if (currentModuleId && !selectedModuleId) {
      setSelectedModuleId(currentModuleId)
    }
  }, [currentModuleId, selectedModuleId])

  // Standard 7-Phase Structure
  const phases = [
    { order: 1, title: 'FASE 1 — Fundamentos da Programação' },
    { order: 2, title: 'FASE 2 — Base do Desenvolvimento Web' },
    { order: 3, title: 'FASE 3 — Tecnologia Central (JavaScript)' },
    { order: 4, title: 'FASE 4 — Especialização Front-end & Back-end' },
    { order: 5, title: 'FASE 5 — Integração Full Stack & Deploy' },
    { order: 6, title: 'FASE 6 — Projetos Reais & Portfólio' },
    { order: 7, title: 'FASE 7 — Preparação Profissional & Carreira' },
  ]

  const selectedModule = allModules.find((m) => m.id === selectedModuleId) || allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const selModStatus = selectedModule ? moduleStatus(selectedModule.id) : 'locked'
  const selModProgress = selectedModule ? moduleProgress[selectedModule.id] : null
  const SelIcon = selectedModule ? getIcon(selectedModule.icon) : BookOpen

  // Find prerequisite names
  const prereqModules = selectedModule
    ? selectedModule.prerequisites.map((pid) => allModules.find((m) => m.id === pid)).filter(Boolean)
    : []
  const moduleLessons = selectedModule
    ? allLessons.filter((l) => selectedModule.lessonIds.includes(l.id)).sort((a, b) => a.order - b.order)
    : []

  // Find Path Item with justification
  const currentPathItem: LearningPathItem | undefined = selectedModule
    ? activePath.items?.find((i) => i.moduleId === selectedModule.id)
    : undefined

  if (allModules.length === 0 || !selectedModule) {
    return (
      <AppShell
        title="Minha Trilha de Aprendizagem"
        subtitle="Árvore sequencial e adaptativa de formação estruturada a partir do catálogo educacional"
      >
        <div className="space-y-8">
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/80 rounded-3xl bg-muted/10 space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="size-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-foreground">Trilha Aguardando Cursos</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nenhum módulo ou curso está cadastrado no momento. Assim que o administrador cadastrar canais ou playlists do YouTube, a IA montará sua trilha adaptativa automaticamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/admin/youtube">
                <Button className="font-bold text-xs gap-2">
                  Gerenciar Fontes no Painel Admin <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button variant="outline" className="font-bold text-xs">
                  Ver Catálogo de Cursos
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  const continueLessonId = nextPendingLessonId || moduleLessons[0]?.id || allLessons[0]?.id || ''

  return (
    <AppShell
      title="Minha Trilha de Aprendizagem"
      subtitle="Árvore sequencial e adaptativa de formação com justificativas pedagógicas e pré-requisitos"
    >
      <div className="space-y-8">
        {/* Path Overview Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold">Trilha Individualizada</Badge>
              <span className="text-xs text-muted-foreground font-semibold">
                Personalizada para {activePath.customizedFor || 'você'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{activePath.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">{activePath.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link href="/nivelamento">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5 text-primary" /> Recalcular Nivelamento
              </Button>
            </Link>
            {continueLessonId && (
              <Link href={`/aulas/${continueLessonId}`}>
                <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <PlayCircle className="size-3.5" /> Continuar Estudando
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Trail Adaptation Notices Banner if any */}
        {activePath.adaptations && activePath.adaptations.length > 0 && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">Ajustes Adaptativos da sua Trilha:</h3>
            </div>
            <div className="divide-y divide-border/50">
              {activePath.adaptations.map((ad) => (
                <div key={ad.id} className="py-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">[{ad.date}] {ad.reason}</strong> — {ad.changesMade}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Path Phases & Detailed Inspector Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Left 2 Cols: Phases Roadmap */}
          <div className="lg:col-span-2 space-y-8">
            {phases.map((phase) => {
              const phaseMods = allModules.filter((m) => m.phaseOrder === phase.order)
              if (phaseMods.length === 0) return null

              return (
                <div key={phase.order} className="space-y-4">
                  {/* Phase Section Header */}
                  <div className="flex items-center gap-3 border-b border-border/80 pb-2">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                      {phase.order}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-foreground">
                      {phase.title}
                    </h2>
                  </div>

                  {/* Modules List in this Phase */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {phaseMods.map((mod) => {
                      const status: ModuleStatus = moduleStatus(mod.id)
                      const isSelected = selectedModuleId === mod.id
                      const Icon = getIcon(mod.icon)
                      const prog = moduleProgress[mod.id]
                      const totalLessonsCount = mod.lessonIds.length
                      const doneLessonsCount = prog?.lessonsCompleted ?? 0
                      const percent = totalLessonsCount > 0 ? Math.round((doneLessonsCount / totalLessonsCount) * 100) : 0
                      const pathItem = activePath.items?.find((i) => i.moduleId === mod.id)

                      return (
                        <div
                          key={mod.id}
                          onClick={() => setSelectedModuleId(mod.id)}
                          className={`cursor-pointer group relative rounded-2xl border p-5 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/[0.07] ring-2 ring-primary shadow-lg shadow-primary/10'
                              : status === 'locked'
                              ? 'border-border/60 bg-muted/20 opacity-75 hover:opacity-100 hover:border-border'
                              : 'border-border bg-card hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid size-10 place-items-center rounded-xl transition-colors ${
                                  status === 'completed'
                                    ? 'bg-success/15 text-success'
                                    : status === 'in-progress' || status === 'available'
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <Icon className="size-5" />
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                  {mod.title}
                                </h3>
                                <span className="text-[11px] text-muted-foreground">
                                  {totalLessonsCount} aulas reais • {mod.estimatedHours}h
                                </span>
                              </div>
                            </div>

                            {/* Status Badges */}
                            {status === 'completed' ? (
                              <Badge className="bg-success/15 text-success border-0 text-[10px] font-bold gap-1">
                                <CheckCircle2 className="size-3" /> Concluído
                              </Badge>
                            ) : status === 'in-progress' ? (
                              <Badge className="bg-primary/15 text-primary border-0 text-[10px] font-bold">
                                Em Andamento
                              </Badge>
                            ) : status === 'available' ? (
                              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold">
                                Disponível
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground text-[10px] gap-1">
                                <Lock className="size-3" /> Bloqueado
                              </Badge>
                            )}
                          </div>

                          {/* Recommendation Reason Snippet */}
                          {pathItem?.recommendationReason ? (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2 pt-2 border-t border-border/40">
                              💡 {pathItem.recommendationReason}
                            </p>
                          ) : null}

                          {/* Module Progress Bar */}
                          {status !== 'locked' && (
                            <div className="space-y-1.5 pt-3">
                              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                                <span>{doneLessonsCount} de {totalLessonsCount} aulas</span>
                                <span>{percent}%</span>
                              </div>
                              <Progress value={percent} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Col: Deep Module & Lesson Inspector */}
          <div className="space-y-6 lg:sticky lg:top-20">
            <Card className="border-border/80 shadow-xl shadow-primary/5">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Módulo Selecionado
                  </span>
                  {selModStatus === 'completed' ? (
                    <Badge className="bg-success text-success-foreground text-[10px] font-bold">Concluído</Badge>
                  ) : selModStatus === 'locked' ? (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Lock className="size-3" /> Bloqueado
                    </Badge>
                  ) : (
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">Liberado</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <SelIcon className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{selectedModule.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {moduleLessons.length} aulas reais • {selectedModule.estimatedHours}h estimadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5 text-xs">
                {/* Pedagogical Justification Card */}
                {currentPathItem?.recommendationReason && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      Por que você está estudando este módulo?
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {currentPathItem.recommendationReason}
                    </p>
                  </div>
                )}

                {/* Objective */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Objetivo de Aprendizagem</span>
                  <p className="text-muted-foreground leading-relaxed">{selectedModule.objective}</p>
                </div>

                {/* Skills Acquired */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Competências Desenvolvidas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModule.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prerequisites Lock Warning */}
                {selModStatus === 'locked' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1 text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Lock className="size-3.5" /> Requisito de Desbloqueio:
                    </div>
                    <p className="text-[11px]">
                      {currentPathItem?.unlockRequirement ||
                        `Conclua os módulos anteriores (${prereqModules.map((p) => p?.title).join(', ')}) com aproveitamento de 70% na avaliação.`}
                    </p>
                  </div>
                )}

                {/* Lessons Quick List */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Aulas do Módulo ({moduleLessons.length})</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Todas com vídeos reais</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {moduleLessons.map((l, i) => {
                      const isLessonDone = completedLessons.includes(l.id)
                      return (
                        <div
                          key={l.id}
                          className={`flex items-center justify-between rounded-lg border p-2 text-[11px] ${
                            isLessonDone
                              ? 'border-success/30 bg-success/5 text-foreground'
                              : 'border-border/60 bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-[10px] text-muted-foreground">{i + 1}.</span>
                            <span className="truncate">{l.title}</span>
                          </div>
                          {isLessonDone ? (
                            <CheckCircle2 className="size-3.5 text-success shrink-0" />
                          ) : (
                            <Clock className="size-3.5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  {selModStatus === 'locked' ? (
                    <Button disabled className="w-full gap-2 text-xs">
                      <Lock className="size-3.5" /> Módulo Bloqueado por Pré-Requisito
                    </Button>
                  ) : (
                    <Link
                      href={
                        selectedModule.lessonIds.length > 0
                          ? `/aulas/${selectedModule.lessonIds[0]}`
                          : `/aulas/l-logica-1`
                      }
                      className="w-full"
                    >
                      <Button className="w-full gap-2 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20">
                        <PlayCircle className="size-4" /> Acessar Aulas do Módulo
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
