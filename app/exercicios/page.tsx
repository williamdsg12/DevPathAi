'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import type { LearningActivity, LearningModule, Lesson } from '@/lib/types'

export default function FocusedExercisesPage() {
  const router = useRouter()
  const {
    activities,
    completedActivities,
    allModules,
    allLessons,
    allCourses,
    completedLessons,
    submitFullActivity,
    streak,
    xp,
  } = useAppStore()

  // Identify student's active current module
  const currentModule: LearningModule = useMemo(() => {
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

  // Get all module activities
  const moduleActivities = useMemo(() => {
    return activities.filter(
      (a) => a.moduleId === currentModule.id || moduleLessons.some((l) => l.id === a.lessonId)
    )
  }, [activities, currentModule, moduleLessons])

  // Find the first pending activity of the active module, or first activity
  const defaultActivity = useMemo(() => {
    const pending = moduleActivities.find((a) => !completedActivities.includes(a.id))
    if (pending) return pending
    const anyPending = activities.find((a) => !completedActivities.includes(a.id))
    if (anyPending) return anyPending
    return moduleActivities[0] || activities[0]
  }, [moduleActivities, activities, completedActivities])

  const [selectedActivityId, setSelectedActivityId] = useState<string>(defaultActivity?.id || '')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [codeAnswer, setCodeAnswer] = useState<string>('')
  const [showHint, setShowHint] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Current active activity object
  const activeActivity: LearningActivity | undefined = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId) || defaultActivity
  }, [activities, selectedActivityId, defaultActivity])

  // Related Lesson & Module
  const currentLesson = useMemo(() => {
    if (!activeActivity) return moduleLessons[0]
    return allLessons.find((l) => l.id === activeActivity.lessonId) || moduleLessons[0]
  }, [activeActivity, allLessons, moduleLessons])

  const isAlreadyCompleted = activeActivity ? completedActivities.includes(activeActivity.id) : false

  // Next lesson in sequence
  const nextLesson = useMemo(() => {
    if (!currentLesson) return null
    const currentIdx = moduleLessons.findIndex((l) => l.id === currentLesson.id)
    return currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null
  }, [currentLesson, moduleLessons])

  function handleSelectActivity(actId: string) {
    setSelectedActivityId(actId)
    setSelectedOption(null)
    setCodeAnswer('')
    setShowHint(false)
    setIsSubmitted(false)
    setIsCorrect(null)
  }

  function handleVerifyAnswer() {
    if (!activeActivity) return

    let correct = false
    if (activeActivity.type === 'multiple_choice' || activeActivity.type === 'true_false') {
      if (selectedOption === null) {
        toast.error('Por favor, selecione uma das alternativas antes de verificar.')
        return
      }
      correct = selectedOption === (activeActivity.correctOptionIndex ?? 0)
    } else {
      // Code or text
      if (!codeAnswer.trim()) {
        toast.error('Por favor, preencha sua resposta.')
        return
      }
      correct = true
    }

    setIsSubmitted(true)
    setIsCorrect(correct)

    if (correct) {
      submitFullActivity({
        activityId: activeActivity.id,
        lessonId: activeActivity.lessonId || currentLesson?.id || '',
        moduleId: activeActivity.moduleId || currentModule?.id || '',
        score: 100,
        passed: true,
        xpEarned: activeActivity.xpReward || 25,
        answers: { option: selectedOption, code: codeAnswer },
      })
      toast.success(`🎉 Resposta correta! +${activeActivity.xpReward || 25} XP adicionados.`)
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      } catch {}
    } else {
      toast.error('Resposta incorreta. Revise a explicação ou peça uma dica ao mentor.')
    }
  }

  return (
    <AppShell
      title="Atividade Pedagógica"
      subtitle="Painel focado de fixação prática e validação de conhecimento da sua aula"
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        {/* =========================================================================
            1. BREADCRUMB & SELECTOR HEADER
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#100f1c] p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 flex-wrap">
            <span className="text-violet-400 font-bold">{currentModule?.title}</span>
            <ChevronRight className="size-3.5 text-zinc-600" />
            <span className="text-white">Aula {currentLesson?.order}: {currentLesson?.title}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Activity Dropdown Selector */}
            <select
              value={activeActivity?.id || ''}
              onChange={(e) => handleSelectActivity(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#181628] border border-white/10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {activities.map((act, idx) => {
                const isDone = completedActivities.includes(act.id)
                const relLesson = allLessons.find((l) => l.id === act.lessonId)
                return (
                  <option key={act.id} value={act.id}>
                    {isDone ? '✓' : '○'} Atividade {idx + 1}: {act.title} {relLesson ? `(Aula ${relLesson.order})` : ''}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* =========================================================================
            2. PAINEL CENTRAL FOCADO DA ATIVIDADE
           ========================================================================= */}
        {activeActivity ? (
          <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#141226] via-[#100e1e] to-[#0a0912] shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 size-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

            {/* Top Status & Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-5">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 text-white font-extrabold text-xs px-3 py-1 border-0 shadow-md shadow-violet-600/30">
                  <Sparkles className="size-3.5 mr-1" /> EXERCÍCIO OBRIGATÓRIO
                </Badge>
                <Badge variant="outline" className="text-zinc-400 border-white/10 text-xs capitalize">
                  Dificuldade: {activeActivity.difficulty}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  +{activeActivity.xpReward || 25} XP
                </span>
                {isAlreadyCompleted && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold gap-1 px-3 py-1">
                    <CheckCircle2 className="size-3.5" /> Aprovada
                  </Badge>
                )}
              </div>
            </div>

            {/* Activity Statement & Instructions */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">
                  Enunciado da Atividade:
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {activeActivity.title}
                </h1>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-black/40 text-sm text-zinc-200 leading-relaxed font-medium">
                {activeActivity.statement}
              </div>

              {/* Code Snippet if applicable */}
              {activeActivity.codeSnippet && (
                <div className="rounded-2xl border border-white/10 bg-[#090812] overflow-hidden">
                  <div className="border-b border-white/5 bg-white/[0.02] px-4 py-2 text-[10px] font-mono text-zinc-400 font-bold uppercase">
                    Código de Referência
                  </div>
                  <pre className="p-4 text-xs font-mono text-violet-200 overflow-x-auto leading-relaxed">
                    {activeActivity.codeSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Interactive Answer Area */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Sua Resposta:
              </span>

              {/* Multiple Choice Options */}
              {activeActivity.options && activeActivity.options.length > 0 ? (
                <div className="space-y-3">
                  {activeActivity.options.map((option, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrectOption = idx === (activeActivity.correctOptionIndex ?? 0)

                    let cardStyle = 'border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-white/[0.04]'
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        cardStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/40'
                      } else if (isSelected && !isCorrectOption) {
                        cardStyle = 'border-red-500/60 bg-red-950/30 text-red-200'
                      }
                    } else if (isSelected) {
                      cardStyle = 'border-violet-500 bg-violet-950/50 text-white ring-1 ring-violet-500/50 shadow-lg shadow-violet-950/40'
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!isSubmitted) setSelectedOption(idx)
                        }}
                        className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
                      >
                        <div
                          className={`size-6 rounded-xl border grid place-items-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-violet-400 bg-violet-600 text-white'
                              : 'border-white/10 bg-black/40 text-zinc-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                          {option}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                /* Code / Text Answer Input */
                <Textarea
                  value={codeAnswer}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  placeholder="Escreva sua solução ou código aqui..."
                  rows={5}
                  className="font-mono text-xs bg-black/50 border-white/10 text-zinc-200 p-4 rounded-2xl focus:border-violet-500"
                />
              )}
            </div>

            {/* Mentor Hint Box (Collapsible) */}
            {showHint && activeActivity.explanation && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Lightbulb className="size-4" /> Dica Pedagógica do Mentor IA
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {activeActivity.explanation}
                </p>
              </div>
            )}

            {/* Submission Feedback Result */}
            {isSubmitted && (
              <div
                className={`rounded-2xl border p-5 space-y-2 animate-in fade-in duration-300 ${
                  isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-red-500/40 bg-red-950/30 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span>Excelente! Você acertou e dominou este conceito.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-400" />
                      <span>Resposta incorreta. Tente novamente ou revise o conteúdo da aula.</span>
                    </>
                  )}
                </div>

                {activeActivity.explanation && (
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium pt-1 border-t border-white/5">
                    <strong>Explicação:</strong> {activeActivity.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-bold text-zinc-400 hover:text-white gap-1.5 cursor-pointer"
              >
                <Lightbulb className="size-3.5 text-amber-400" />
                {showHint ? 'Ocultar Dica' : 'Pedir Dica ao Mentor'}
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!isSubmitted ? (
                  <Button
                    onClick={handleVerifyAnswer}
                    className="w-full sm:w-auto font-black text-xs sm:text-sm px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-violet-950/60 cursor-pointer"
                  >
                    <Check className="size-4 mr-1.5" /> Verificar Resposta
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false)
                        setIsCorrect(null)
                      }}
                      className="font-bold text-xs rounded-2xl border-white/10 text-zinc-300 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5 mr-1.5" /> Refazer
                    </Button>

                    {nextLesson ? (
                      <Link href={`/aulas/${nextLesson.id}`} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto font-black text-xs sm:text-sm px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-violet-950/60 cursor-pointer">
                          <span>Próxima Aula</span>
                          <ArrowRight className="size-4 ml-1.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/trilha" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto font-black text-xs sm:text-sm px-8 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl cursor-pointer">
                          <span>Voltar para a Trilha</span>
                          <ArrowRight className="size-4 ml-1.5" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#100f1c] p-12 text-center space-y-4">
            <Target className="size-10 text-zinc-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhuma atividade selecionada</h3>
            <p className="text-xs text-zinc-400">Selecione uma aula no menu para praticar.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
