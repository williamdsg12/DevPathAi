'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import type { LearningActivity } from '@/lib/types'

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

interface ActivitySolverModalProps {
  activity: LearningActivity | null
  isOpen: boolean
  onClose: () => void
  onNextActivity?: () => void
}

export function ActivitySolverModal({
  activity,
  isOpen,
  onClose,
  onNextActivity,
}: ActivitySolverModalProps) {
  const {
    allLessons,
    allModules,
    completedActivities,
    submitActivityAnswer,
    activityAttempts,
  } = useAppStore()

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [codeAnswer, setCodeAnswer] = useState<string>('')
  const [showHintLevel, setShowHintLevel] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    isCorrect: boolean
    feedback: string
    hint?: string
    xpEarned: number
    attemptNumber: number
  } | null>(null)

  // Reset state when activity changes or modal opens
  useEffect(() => {
    if (activity) {
      setSelectedOption(null)
      setCodeAnswer(activity.codeStarter || '')
      setShowHintLevel(0)
      setSubmissionResult(null)
    }
  }, [activity, isOpen])

  if (!isOpen || !activity) return null

  const isDone = completedActivities.includes(activity.id)
  const relatedLesson = allLessons.find((l) => l.id === activity.lessonId)
  const relatedModule = allModules.find(
    (m) => m.id === activity.moduleId || (relatedLesson && m.lessonIds.includes(relatedLesson.id))
  )
  const attempts = activityAttempts[activity.id] || []

  // Extract hints list
  const hintsList: string[] =
    activity.hints && activity.hints.length > 0
      ? activity.hints
      : [
          activity.hint || 'Revise os conceitos principais da aula correspondente.',
          activity.detailedGuidance || 'Preste atenção na sintaxe e nas regras de negócio da linguagem.',
          'Consulte o código demonstrado pelo professor no vídeo da aula.',
        ]

  function handleOptionClick(idx: number) {
    if (submissionResult?.isCorrect) return
    setSelectedOption(idx)
  }

  function handleResetCode() {
    if (activity?.codeStarter) {
      setCodeAnswer(activity.codeStarter)
      toast.info('Código inicial restaurado.')
    } else {
      setCodeAnswer('')
    }
  }

  function handleRequestHint() {
    if (showHintLevel < hintsList.length) {
      setShowHintLevel((prev) => prev + 1)
      toast.info(`Dica Pedagógica da IA (Nível ${showHintLevel + 1}) desbloqueada!`)
    }
  }

  function handleSubmit() {
    if (!activity) return

    let answerPayload: string | number
    if (activity.type === 'multiple_choice' || activity.type === 'true_false') {
      if (selectedOption === null) {
        toast.error('Selecione uma alternativa antes de enviar.')
        return
      }
      answerPayload = selectedOption
    } else {
      if (!codeAnswer.trim()) {
        toast.error('Digite sua resposta antes de enviar.')
        return
      }
      answerPayload = codeAnswer.trim()
    }

    setIsSubmitting(true)
    const res = submitActivityAnswer(activity.id, answerPayload, 60)
    setSubmissionResult(res)
    setIsSubmitting(false)

    if (res.isCorrect) {
      toast.success(`Parabéns! Atividade concluída com sucesso (+${res.xpEarned} XP).`)
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        })
      } catch {}
    } else {
      toast.error('Resposta incorreta. Leia a dica pedagógica e tente novamente!')
      if (showHintLevel === 0) {
        setShowHintLevel(1)
      } else if (showHintLevel === 1) {
        setShowHintLevel(2)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-violet-500/30 bg-[#0f0e1a] text-white shadow-2xl shadow-violet-950/60 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-violet-400 uppercase tracking-wider text-[10px]">
                {relatedModule?.title || 'Módulo'}
              </span>
              {relatedLesson && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300 font-medium truncate max-w-[280px]">
                    Aula {relatedLesson.order}: {relatedLesson.title}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {activity.title}
              </h2>
              {isDone && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                  <CheckCircle2 className="size-3.5" /> Concluído
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <Badge className="bg-violet-950 text-violet-300 border-violet-500/40 text-[10px] font-black">
                +{activity.xpReward} XP
              </Badge>
              <Badge variant="outline" className="border-white/10 text-zinc-400 text-[10px] font-bold">
                {TYPE_LABELS[activity.type] || activity.type}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-zinc-400 text-[10px] font-bold capitalize">
                {activity.difficulty}
              </Badge>
              {activity.skillName && (
                <span className="text-[11px] text-zinc-400 font-medium">
                  🎯 {activity.skillName}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">
          {/* Statement / Problem */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Enunciado Pedagógico:
            </label>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
              {activity.statement}
            </p>

            {/* Contextual Code Block if available */}
            {activity.codeContext && (
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-violet-200 overflow-x-auto shadow-inner">
                <pre>{activity.codeContext}</pre>
              </div>
            )}
          </div>

          {/* Multiple Choice / True False Options */}
          {(activity.type === 'multiple_choice' || activity.type === 'true_false') &&
            activity.options && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Escolha a alternativa correta:
                </label>
                <div className="space-y-2">
                  {activity.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx
                    const isCorrectAnswer =
                      submissionResult?.isCorrect && idx === activity.correctOptionIndex

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleOptionClick(idx)}
                        disabled={submissionResult?.isCorrect}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-400/50'
                            : isPicked
                            ? 'border-violet-500 bg-violet-950/60 text-white ring-1 ring-violet-400/50 shadow-lg shadow-violet-950/40'
                            : 'border-white/5 bg-black/30 text-zinc-300 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`grid size-6 place-items-center rounded-lg text-xs font-bold font-mono shrink-0 ${
                              isPicked ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                        {isPicked && <Check className="size-4 text-violet-400 shrink-0 ml-2" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          {/* Code Editor for coding questions */}
          {activity.type !== 'multiple_choice' &&
            activity.type !== 'true_false' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Sua Solução de Código:
                  </label>
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" /> Restaurar Inicial
                  </button>
                </div>
                <Textarea
                  rows={8}
                  value={codeAnswer}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  placeholder="// Digite sua solução de código aqui..."
                  className="font-mono text-xs bg-black/60 border-white/10 rounded-2xl text-violet-200 leading-relaxed focus:border-violet-500"
                  spellCheck={false}
                />
              </div>
            )}

          {/* Submission Result Feedback Box */}
          {submissionResult && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 animate-in fade-in duration-200 ${
                submissionResult.isCorrect
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {submissionResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Resposta Correta! (+{submissionResult.xpEarned} XP)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-rose-400" />
                    <span>Resposta Incorreta</span>
                  </>
                )}
              </div>
              <p className="text-zinc-200 font-medium">{submissionResult.feedback}</p>
            </div>
          )}

          {/* Progressive Hints Drawer */}
          {showHintLevel > 0 && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Lightbulb className="size-4 text-amber-400" />
                  <span>Dica Pedagógica da IA (Nível {showHintLevel} de {hintsList.length})</span>
                </div>
              </div>
              <p className="text-zinc-200 leading-relaxed font-medium">
                {hintsList[showHintLevel - 1] || hintsList[0]}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-6 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showHintLevel < hintsList.length && !submissionResult?.isCorrect && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRequestHint}
                className="w-full sm:w-auto text-xs font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10 rounded-xl"
              >
                <Lightbulb className="size-3.5 mr-1.5" /> Pedir Dica ({showHintLevel}/{hintsList.length})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {submissionResult?.isCorrect ? (
              <>
                {onNextActivity && (
                  <Button
                    onClick={onNextActivity}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50"
                  >
                    <span>Próxima Atividade</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto border-white/10 text-xs font-bold rounded-xl"
                >
                  Concluir e Fechar
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-8 py-5 rounded-xl shadow-lg shadow-violet-950/50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Avaliando com IA...' : 'Enviar Resposta'}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
