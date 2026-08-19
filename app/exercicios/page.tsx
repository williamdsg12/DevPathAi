'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Flame,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { ActivitySolverModal } from '@/components/activities/activity-solver-modal'
import type { LearningActivity, LearningModule, Lesson } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Múltipla Escolha',
  true_false: 'Verdadeiro ou Falso',
  fill_code: 'Preencher Código',
  find_bug: 'Encontrar o Bug',
  fix_code: 'Corrigir Código',
  write_code: 'Escrever Código',
  code: 'Prática de Código',
  practical_challenge: 'Desafio Prático',
  mini_project: 'Mini Projeto',
  module_project: 'Projeto de Módulo',
  written: 'Resposta Discursiva',
}

export default function ExercisesPage() {
  const {
    activities,
    completedActivities,
    allModules,
    allLessons,
    allCourses,
    completedLessons,
    streak,
    xp,
  } = useAppStore()

  const [tabFilter, setTabFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [solvingActivity, setSolvingActivity] = useState<LearningActivity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Identify student's active current module
  const currentModule: LearningModule = useMemo(() => {
    // Find the first module that is not yet fully completed, or default to first module
    for (const mod of allModules) {
      const modLessons = allLessons.filter((l) => mod.lessonIds.includes(l.id) || l.moduleId === mod.id)
      const allDone = modLessons.length > 0 && modLessons.every((l) => completedLessons.includes(l.id))
      if (!allDone) return mod
    }
    return allModules[0] || {
      id: 'mod-logica',
      title: 'Lógica de Programação',
      description: 'Fundamentos de programação',
      lessonIds: [],
    } as any
  }, [allModules, allLessons, completedLessons])

  const moduleLessons: Lesson[] = useMemo(() => {
    return allLessons
      .filter((l) => currentModule.lessonIds.includes(l.id) || l.moduleId === currentModule.id)
      .sort((a, b) => a.order - b.order)
  }, [allLessons, currentModule])

  const doneModuleLessonsCount = useMemo(() => {
    return moduleLessons.filter((l) => completedLessons.includes(l.id)).length
  }, [moduleLessons, completedLessons])

  const isModuleLessonsComplete =
    moduleLessons.length > 0 && doneModuleLessonsCount >= moduleLessons.length

  // Next recommended pending activity:
  // 1. Pending activity for the current module's latest active/completed lesson
  // 2. Or first pending activity in the entire system
  // 3. Or first activity
  const nextRecommendedActivity: LearningActivity | undefined = useMemo(() => {
    // Filter activities for current module that are pending
    const currentModulePending = activities.find(
      (a) =>
        (a.moduleId === currentModule.id || moduleLessons.some((l) => l.id === a.lessonId)) &&
        !completedActivities.includes(a.id)
    )
    if (currentModulePending) return currentModulePending

    // Any pending activity
    const anyPending = activities.find((a) => !completedActivities.includes(a.id))
    if (anyPending) return anyPending

    return activities[0]
  }, [activities, completedActivities, currentModule, moduleLessons])

  // Filtered list of all activities for the "Suas Atividades" section
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const isDone = completedActivities.includes(act.id)
      if (tabFilter === 'pending' && isDone) return false
      if (tabFilter === 'completed' && !isDone) return false

      const modMatch = selectedModuleId === 'all' || act.moduleId === selectedModuleId
      const diffMatch = selectedDifficulty === 'all' || act.difficulty === selectedDifficulty
      return modMatch && diffMatch
    })
  }, [activities, completedActivities, tabFilter, selectedModuleId, selectedDifficulty])

  function handleStartActivity(act: LearningActivity) {
    setSolvingActivity(act)
    setIsModalOpen(true)
  }

  function handleNextActivityInSequence() {
    if (!solvingActivity) return
    const currentIndex = activities.findIndex((a) => a.id === solvingActivity.id)
    const nextPending = activities.slice(currentIndex + 1).find((a) => !completedActivities.includes(a.id))
    if (nextPending) {
      setSolvingActivity(nextPending)
    } else {
      setIsModalOpen(false)
      toast.success('Todas as atividades deste bloco foram concluídas!')
    }
  }

  const nextActivityLesson = allLessons.find((l) => l.id === nextRecommendedActivity?.lessonId)
  const nextActivityModule = allModules.find(
    (m) =>
      m.id === nextRecommendedActivity?.moduleId ||
      (nextActivityLesson && m.lessonIds.includes(nextActivityLesson.id))
  )

  return (
    <AppShell
      title="Atividades Pedagógicas"
      subtitle="Continue aprendendo com atividades geradas especialmente para o seu progresso."
    >
      <div className="space-y-10 pb-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: PRÓXIMA ATIVIDADE RECOMENDADA                            */}
        {/* ========================================================================= */}
        {nextRecommendedActivity ? (
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-[#121022] to-[#0a0914] p-6 sm:p-10 shadow-2xl shadow-violet-950/40">
            {/* Ambient Lighting */}
            <div className="absolute -top-20 -right-20 size-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-violet-600 text-white font-extrabold text-xs px-3 py-1 border-0 shadow-md shadow-violet-600/30">
                    ⚡ PRÓXIMA ATIVIDADE RECOMENDADA
                  </Badge>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {nextActivityModule?.title || currentModule.title}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {nextActivityLesson && (
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <BookOpen className="size-3.5" /> Aula {nextActivityLesson.order}: {nextActivityLesson.title}
                    </span>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    {nextRecommendedActivity.title}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                  {nextRecommendedActivity.statement}
                </p>

                <div className="flex items-center gap-3 pt-2 text-xs flex-wrap text-zinc-400 font-semibold">
                  <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    +{nextRecommendedActivity.xpReward} XP
                  </span>
                  <span>•</span>
                  <span className="capitalize">{nextRecommendedActivity.difficulty}</span>
                  <span>•</span>
                  <span>{nextRecommendedActivity.expectedTimeMin || 5}-10 min</span>
                  {nextRecommendedActivity.skillName && (
                    <>
                      <span>•</span>
                      <span className="text-violet-300">🎯 {nextRecommendedActivity.skillName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Action Button */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0">
                <Link href={`/exercicios/${nextRecommendedActivity.id}`}>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl shadow-violet-950/60 transition-all cursor-pointer group"
                  >
                    <span>Começar Atividade</span>
                    <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <span className="text-[11px] text-zinc-400 text-center font-medium">
                  Resolução em tela própria com IA
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* ========================================================================= */}
        {/* 2. PROGRESSO DO MÓDULO ATUAL & SEQUÊNCIA DE AULAS                         */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-white/10 bg-[#100f1c] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                Módulo em Andamento
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Layers className="size-5 text-violet-400" />
                {currentModule.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-zinc-300">
                {doneModuleLessonsCount} de {moduleLessons.length} aulas ({Math.round((doneModuleLessonsCount / (moduleLessons.length || 1)) * 100)}%)
              </span>
              {isModuleLessonsComplete ? (
                <Link href={`/avaliacoes/${currentModule.id}`}>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold gap-1 px-3 py-1 cursor-pointer hover:bg-emerald-500/30">
                    <Sparkles className="size-3.5" /> Avaliação Final Liberada!
                  </Badge>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-500"
              style={{
                width: `${Math.max(5, (doneModuleLessonsCount / (moduleLessons.length || 1)) * 100)}%`,
              }}
            />
          </div>

          {/* Sequential Lesson Chips Map */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Trilha de Aulas do Módulo:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {moduleLessons.map((lesson, idx) => {
                const isLessonDone = completedLessons.includes(lesson.id)
                const lessonActs = activities.filter((a) => a.lessonId === lesson.id)
                const hasPendingAct = lessonActs.some((a) => !completedActivities.includes(a.id))
                const isCurrentActive =
                  !isLessonDone && (idx === 0 || completedLessons.includes(moduleLessons[idx - 1]?.id))

                return (
                  <Link
                    key={lesson.id}
                    href={`/aulas/${lesson.id}`}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isLessonDone
                        ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50'
                        : isCurrentActive
                        ? 'border-violet-500/50 bg-violet-950/40 ring-1 ring-violet-500/40 shadow-lg shadow-violet-950/30'
                        : 'border-white/5 bg-white/[0.02] opacity-75 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`grid size-6 place-items-center rounded-lg text-xs font-bold shrink-0 ${
                          isLessonDone
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isCurrentActive
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-zinc-500'
                        }`}
                      >
                        {lesson.order || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isLessonDone ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      ) : hasPendingAct ? (
                        <Badge className="bg-amber-500/20 text-amber-300 border-0 text-[9px] font-extrabold px-1.5 py-0.5">
                          Atividade
                        </Badge>
                      ) : isCurrentActive ? (
                        <Play className="size-3.5 text-violet-400 fill-violet-400" />
                      ) : (
                        <Lock className="size-3.5 text-zinc-600" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Module Assessment Card Callout when completed */}
          {isModuleLessonsComplete && (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Todas as aulas concluídas!
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Realize a Avaliação Final de {currentModule.title}
                </h4>
                <p className="text-xs text-zinc-300 font-medium">
                  A IA gerou uma prova abrangente de 15 questões cobrindo todos os conceitos deste módulo. Nota mínima para aprovação: 70%.
                </p>
              </div>

              <Link href={`/avaliacoes/${currentModule.id}`}>
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                  <span>Fazer Avaliação Oficial</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. SUAS ATIVIDADES — LISTA LIMPA E RESPONSIVA (SEM SCROLL INTERNO)        */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Suas Atividades</h2>
              <p className="text-xs text-zinc-400 font-medium">
                {completedActivities.length} de {activities.length} atividades concluídas (+{completedActivities.length * 25} XP acumulados)
              </p>
            </div>

            {/* Clean Tab Filter & Module Selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#12111f] border border-white/10">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'pending', label: 'Pendentes' },
                  { id: 'completed', label: 'Concluídas' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabFilter(tab.id as 'all' | 'pending' | 'completed')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tabFilter === tab.id
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-[#12111f] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">Todos os Módulos</option>
                {allModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Single Natural Scrollable List of Cards */}
          {filteredActivities.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#100f1c] p-12 text-center space-y-4">
              <Target className="size-10 text-zinc-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Nenhuma atividade encontrada</h4>
                <p className="text-xs text-zinc-400">
                  {tabFilter === 'pending'
                    ? 'Parabéns! Você não possui atividades pendentes neste filtro.'
                    : 'Nenhuma atividade corresponde aos filtros selecionados.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTabFilter('all')
                  setSelectedModuleId('all')
                }}
                className="text-xs font-bold border-white/10 rounded-xl"
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((act) => {
                const isDone = completedActivities.includes(act.id)
                const relLesson = allLessons.find((l) => l.id === act.lessonId)
                const relMod = allModules.find(
                  (m) => m.id === act.moduleId || (relLesson && m.lessonIds.includes(relLesson.id))
                )

                return (
                  <div
                    key={act.id}
                    className={`group flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                      isDone
                        ? 'border-emerald-500/20 bg-[#10141b] hover:border-emerald-500/40'
                        : 'border-white/10 bg-[#100f1c] hover:border-violet-500/40 hover:bg-[#141224] shadow-lg shadow-black/40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header Pills */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-violet-400 uppercase text-[10px] tracking-wider truncate max-w-[200px]">
                          {relMod?.title || 'Módulo'}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="secondary"
                            className="text-[9px] uppercase font-bold bg-white/5 border border-white/5 text-zinc-400"
                          >
                            {act.difficulty}
                          </Badge>
                          {isDone && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold gap-1 px-2 py-0.5">
                              <CheckCircle2 className="size-3" /> Feito
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title & Lesson Info */}
                      <div>
                        {relLesson && (
                          <span className="text-[11px] text-zinc-400 font-semibold block mb-0.5">
                            Aula {relLesson.order}: {relLesson.title}
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                          {act.title}
                        </h4>
                      </div>

                      {/* Statement snippet */}
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                        {act.statement}
                      </p>
                    </div>

                    {/* Card Footer & Action CTA */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[11px]">
                          {TYPE_LABELS[act.type] || act.type}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          +{act.xpReward} XP
                        </span>
                      </div>

                      <Link href={`/exercicios/${act.id}`}>
                        <Button
                          size="sm"
                          className={`text-xs font-bold rounded-xl px-4 py-2 cursor-pointer transition-all ${
                            isDone
                              ? 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                          }`}
                        >
                          <span>{isDone ? 'Revisar' : 'Resolver'}</span>
                          <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Focused Interactive Activity Solver Modal */}
      <ActivitySolverModal
        activity={solvingActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNextActivity={handleNextActivityInSequence}
      />
    </AppShell>
  )
}
