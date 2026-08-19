'use client'

import { use, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  HelpCircle,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { activityEngine } from '@/lib/ai/activity-engine'
import type { ActivityQuestion, ActivitySubmissionResult, LearningActivity, Lesson } from '@/lib/types'

export default function ActivitySolverPage({ params }: { params: Promise<{ activityId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const activityId = resolvedParams.activityId

  const {
    activities,
    completedActivities,
    allLessons,
    allModules,
    allCourses,
    submitFullActivity,
    getLessonMissionDetails,
    isLessonUnlocked,
  } = useAppStore()

  // Locate the activity
  const activity: LearningActivity | undefined = useMemo(() => {
    let act = activities.find((a) => a.id === activityId)
    if (!act && activityId.startsWith('act-')) {
      // Find matching lesson activity
      const cleanLessonId = activityId.replace('act-', '')
      act = activities.find((a) => a.lessonId === cleanLessonId)
    }
    return act
  }, [activities, activityId])

  // Locate matching lesson, module and course
  const lesson: Lesson | undefined = useMemo(() => {
    if (!activity) {
      const directLessonId = activityId.replace('act-', '')
      return allLessons.find((l) => l.id === directLessonId) || allLessons[0]
    }
    return allLessons.find((l) => l.id === activity.lessonId) || allLessons[0]
  }, [activity, activityId, allLessons])

  const currentModule = useMemo(() => {
    if (!lesson) return allModules[0]
    return allModules.find((m) => m.id === lesson.moduleId || m.lessonIds.includes(lesson.id)) || allModules[0]
  }, [lesson, allModules])

  const currentCourse = useMemo(() => {
    if (!currentModule) return allCourses[0]
    return (
      allCourses.find((c) => c.id === currentModule.courseId || (lesson?.playlistId && c.playlistId === lesson.playlistId)) ||
      allCourses[0]
    )
  }, [currentModule, lesson, allCourses])

  const moduleLessons = useMemo(() => {
    if (!currentModule) return []
    return allLessons
      .filter((l) => currentModule.lessonIds.includes(l.id) || l.moduleId === currentModule.id)
      .sort((a, b) => a.order - b.order)
  }, [currentModule, allLessons])

  // Compute next lesson in sequence
  const nextLesson = useMemo(() => {
    if (!lesson) return null
    const currentIdx = moduleLessons.findIndex((l) => l.id === lesson.id)
    return currentIdx >= 0 && currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null
  }, [lesson, moduleLessons])

  // Get or construct questions list for this activity
  const questions: ActivityQuestion[] = useMemo(() => {
    if (!activity) return []
    return activityEngine.ensureActivityQuestions(activity)
  }, [activity])

  // Solving State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({})
  const [hintLevel, setHintLevel] = useState(0) // 0: none, 1, 2, 3
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<ActivitySubmissionResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<number[]>([])

  // Reset hint level when moving to another question
  useEffect(() => {
    setHintLevel(0)
    setValidationErrors([])
  }, [currentQuestionIndex])

  // If already completed in store, prepare initial preview
  const isAlreadyCompleted = useMemo(() => {
    return activity ? completedActivities.includes(activity.id) : false
  }, [activity, completedActivities])

  if (!activity || !lesson) {
    return (
      <AppShell title="Atividade Pedagógica" subtitle="Carregando exercício prático...">
        <div className="max-w-3xl mx-auto py-12">
          <Card className="rounded-3xl border border-white/10 bg-[#12111d] p-10 text-center space-y-4">
            <Code2 className="size-12 text-violet-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Atividade não encontrada</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              A atividade solicitada não existe ou ainda não foi gerada para esta aula.
            </p>
            <div className="pt-2">
              <Link href="/exercicios">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl">
                  <ArrowLeft className="size-3.5 mr-1.5" /> Voltar para Central de Atividades
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  const currentQuestion = questions[currentQuestionIndex] || questions[0]
  const totalQuestions = questions.length
  const progressPercent = Math.round(((currentQuestionIndex + 1) / (totalQuestions || 1)) * 100)

  function handleSelectOption(qId: string, optIndex: number) {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optIndex,
    }))
    // Clear validation error for this question if it was highlighted
    setValidationErrors((prev) => prev.filter((idx) => idx !== currentQuestionIndex + 1))
  }

  function handleCodeChange(qId: string, code: string) {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: code,
    }))
    if (code.trim().length > 0) {
      setValidationErrors((prev) => prev.filter((idx) => idx !== currentQuestionIndex + 1))
    }
  }

  function handleResetCode(q: ActivityQuestion) {
    setUserAnswers((prev) => ({
      ...prev,
      [q.id]: q.codeStarter || '',
    }))
    toast.info('Código reiniciado para o estado original.')
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  function handlePrevQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  function handleSubmitActivity() {
    // 1. Mandatory Frontend Anti-Empty Validation
    const missing: number[] = []
    questions.forEach((q, idx) => {
      const val = userAnswers[q.id]
      if (val === undefined || val === null) {
        missing.push(idx + 1)
      } else if (typeof val === 'string' && val.trim().length === 0) {
        missing.push(idx + 1)
      }
    })

    if (missing.length > 0) {
      setValidationErrors(missing)
      toast.error(`Responda todas as questões obrigatórias. Pendente(s): #${missing.join(', #')}`)
      return
    }

    setIsSubmitting(true)
    try {
      const result = submitFullActivity(activity.id, userAnswers, 90)
      setSubmissionResult(result)

      if (result.isApproved) {
        toast.success(`🎉 Atividade concluída com sucesso! (${result.score}%)`)
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          })
        } catch {}
      } else {
        toast.warning(`Atividade finalizada com ${result.score}%. Revise o feedback abaixo!`)
      }
    } catch {
      toast.error('Erro ao processar respostas da atividade.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell
      title={`Missão ${lesson.order || 1}: ${activity.title}`}
      subtitle={`${currentCourse.title} • ${currentModule.title}`}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <Link
            href={`/courses/${currentCourse.slug || currentCourse.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para a Trilha do Curso
          </Link>

          <div className="flex items-center gap-2">
            <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold">
              +{activity.xpReward || 25} XP
            </Badge>
            {isAlreadyCompleted && (
              <Badge className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold gap-1">
                <CheckCircle2 className="size-3.5" /> Concluída
              </Badge>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TELA DE RESULTADOS E FEEDBACK APÓS ENVIO                                   */}
        {/* ========================================================================= */}
        {submissionResult ? (
          <div className="space-y-6">
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-4 shadow-2xl text-center ${
                submissionResult.isApproved
                  ? 'border-emerald-500/30 bg-gradient-to-b from-[#0f1f17] to-[#0c1410]'
                  : 'border-amber-500/30 bg-gradient-to-b from-[#1c1611] to-[#120f0d]'
              }`}
            >
              <div
                className={`size-16 rounded-2xl grid place-items-center mx-auto shadow-lg ${
                  submissionResult.isApproved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-950/40'
                }`}
              >
                {submissionResult.isApproved ? <Trophy className="size-8" /> : <Award className="size-8" />}
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <Badge
                  className={`text-xs font-bold px-3 py-1 ${
                    submissionResult.isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border-0'
                      : 'bg-amber-500/20 text-amber-300 border-0'
                  }`}
                >
                  {submissionResult.isApproved ? 'MISSÃO CONCLUÍDA' : 'EM REVISÃO'}
                </Badge>
                <h2 className="text-2xl font-black text-white">
                  Aproveitamento: {submissionResult.score}%
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  {submissionResult.feedback}
                </p>
                <div className="pt-1 flex items-center justify-center gap-3 text-xs font-bold">
                  <span className="text-emerald-400">+{submissionResult.xpEarned} XP Conquistados</span>
                  <span>•</span>
                  <span className="text-zinc-400">
                    {submissionResult.passedCount} de {submissionResult.totalCount} questões corretas
                  </span>
                </div>
              </div>

              {/* NEXT STEP ACTION CARD */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                {nextLesson ? (
                  <Link href={`/aulas/${nextLesson.id}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs px-7 py-5 rounded-xl shadow-xl shadow-violet-950/50 cursor-pointer">
                      <span>Continuar para a Aula {nextLesson.order}</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${currentCourse.slug || currentCourse.id}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-7 py-5 rounded-xl shadow-xl shadow-emerald-950/50">
                      <span>Ver Trilha Completa do Curso</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmissionResult(null)
                    setCurrentQuestionIndex(0)
                  }}
                  className="w-full sm:w-auto border-white/10 text-xs font-bold rounded-xl"
                >
                  <RotateCcw className="size-3.5 mr-1.5" /> Refazer Atividade
                </Button>
              </div>
            </div>

            {/* DETAILED QUESTION BREAKDOWN */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Gabarito & Feedback Pedagógico Detalhado
              </h3>

              {questions.map((q, idx) => {
                const qRes = submissionResult.questionResults.find((r) => r.questionId === q.id)
                const isPassed = qRes?.isCorrect ?? false

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-5 space-y-3 ${
                      isPassed ? 'border-emerald-500/20 bg-[#0f1814]' : 'border-rose-500/20 bg-[#190f11]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-6 rounded-lg text-xs font-black grid place-items-center ${
                            isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">Questão {idx + 1}</span>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          isPassed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {isPassed ? 'Correta ✓' : 'Incorreta ✗'}
                      </Badge>
                    </div>

                    <p className="text-xs text-zinc-300 font-medium whitespace-pre-wrap">{q.statement}</p>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 space-y-1">
                      <p className="text-zinc-400 font-semibold text-[11px]">Explicação Pedagógica:</p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TELA FOCADA DE RESOLUÇÃO SEQUENCIAL DE QUESTÕES                           */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Header Card: Mission & Progress */}
            <div className="rounded-3xl border border-white/10 bg-[#12111d] p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-violet-600 text-white font-bold text-[10px]">
                      Missão #{lesson.order || 1}
                    </Badge>
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                      {activity.skillName || activity.technology}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white">{activity.title}</h1>
                </div>

                {/* Progress Metric */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    Questão {currentQuestionIndex + 1} de {totalQuestions}
                  </span>
                  <div className="w-28 sm:w-36 h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Step Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
                {questions.map((q, idx) => {
                  const hasAnswer =
                    userAnswers[q.id] !== undefined &&
                    userAnswers[q.id] !== null &&
                    String(userAnswers[q.id]).trim().length > 0
                  const isCurrent = idx === currentQuestionIndex
                  const isMissing = validationErrors.includes(idx + 1)

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`size-8 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center border ${
                        isCurrent
                          ? 'bg-violet-600 border-violet-400 text-white shadow-md shadow-violet-600/40 ring-1 ring-violet-400'
                          : isMissing
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                          : hasAnswer
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/[0.03] border-white/10 text-zinc-500 hover:text-white'
                      }`}
                      title={`Questão ${idx + 1}`}
                    >
                      {hasAnswer ? '✓' : idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Question Card */}
            <div className="rounded-3xl border border-white/10 bg-[#12111d] p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Question Statement */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-black">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {currentQuestion.type === 'code' ? 'Desafio de Código' : 'Múltipla Escolha'}
                    </span>
                  </div>

                  {/* Hint Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHintLevel((prev) => Math.min(prev + 1, (currentQuestion.hints?.length || 2) + 1))}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold gap-1 p-2"
                  >
                    <Lightbulb className="size-3.5" /> Pedir Dica {hintLevel > 0 ? `(Nível ${hintLevel})` : ''}
                  </Button>
                </div>

                <p className="text-sm sm:text-base text-zinc-200 font-semibold leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.statement}
                </p>
              </div>

              {/* Input Area based on Question Type */}
              {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false' ? (
                <div className="space-y-2.5 pt-2">
                  {(currentQuestion.options || []).map((opt, oIdx) => {
                    const isSelected = userAnswers[currentQuestion.id] === oIdx

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer text-xs sm:text-sm transition-all duration-200 ${
                          isSelected
                            ? 'border-violet-500 bg-violet-950/40 text-white font-bold shadow-lg shadow-violet-950/50 ring-1 ring-violet-500/40'
                            : 'border-white/5 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div
                          className={`size-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'border-violet-500 bg-violet-600 text-white'
                              : 'border-white/20 bg-white/5 text-zinc-500'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                    <span className="font-mono text-[11px]">Editor de Código ({activity.technology || 'JS'})</span>
                    <button
                      type="button"
                      onClick={() => handleResetCode(currentQuestion)}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition-colors"
                    >
                      <RotateCcw className="size-3" /> Reiniciar Código
                    </button>
                  </div>

                  <Textarea
                    value={
                      userAnswers[currentQuestion.id] !== undefined
                        ? String(userAnswers[currentQuestion.id])
                        : currentQuestion.codeStarter || ''
                    }
                    onChange={(e) => handleCodeChange(currentQuestion.id, e.target.value)}
                    placeholder="// Digite o código aqui..."
                    className="font-mono text-xs text-emerald-300 min-h-[160px] bg-black/70 border-white/10 rounded-2xl focus-visible:ring-violet-500 p-4 leading-relaxed"
                  />
                </div>
              )}

              {/* Progressive Hints Box */}
              {hintLevel > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1.5 text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Lightbulb className="size-4" />
                    <span>Dica Pedagógica — Nível {hintLevel}:</span>
                  </div>
                  <p className="leading-relaxed">
                    {currentQuestion.hints?.[hintLevel - 1] ||
                      currentQuestion.hint ||
                      'Analise cuidadosamente a estrutura e a sintaxe exigida pelo problema.'}
                  </p>
                </div>
              )}

              {/* Validation Warning when missing answers */}
              {validationErrors.length > 0 && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 flex items-center justify-between gap-3 text-xs text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-400 shrink-0" />
                    <span>
                      Todas as questões obrigatórias devem ser respondidas. Faltam: Questão(ões) #{validationErrors.join(', #')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(validationErrors[0] - 1)}
                    className="text-[11px] font-bold border-rose-500/40 text-rose-300 hover:bg-rose-900/40 shrink-0"
                  >
                    Ir para #{validationErrors[0]}
                  </Button>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="border-white/10 text-xs font-bold rounded-xl text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="size-4 mr-1" /> Questão Anterior
                </Button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    <span>Próxima Questão</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSubmitActivity}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4 mr-1.5" />
                    {isSubmitting ? 'Validando Respostas...' : 'Finalizar e Enviar Atividade'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
