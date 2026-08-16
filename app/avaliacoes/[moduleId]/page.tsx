'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockAssessment, mockModules } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import { aiService } from '@/lib/ai/provider'
import type { Assessment, AssessmentQuestion, RecoveryPlan } from '@/lib/types'

export default function ModuleAssessmentPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const moduleId = resolvedParams.moduleId

  const { allModules, submitAssessment, recordDifficulty } = useAppStore()
  const currentModule = allModules.find((m) => m.id === moduleId) || allModules[0]

  // Use the assessment questions for the module or fallback to mock
  const assessment: Assessment = {
    ...mockAssessment,
    moduleId: currentModule?.id || moduleId,
    title: currentModule ? `Avaliação Oficial — ${currentModule.title}` : 'Avaliação do Módulo',
  }

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimitMin * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null)
  const [loadingRecovery, setLoadingRecovery] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [isSubmitted, timeLeft])

  const currentQ: AssessmentQuestion = assessment.questions[currentIdx] || assessment.questions[0]
  const totalQ = assessment.questions.length
  const progressPercent = Math.round(((currentIdx + 1) / totalQ) * 100)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  function handleSelect(optionIdx: number) {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }))
  }

  async function handleFinish() {
    let correctCount = 0
    const weakTopics: string[] = []
    const strongTopics: string[] = []

    assessment.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx]
      if (chosen === q.correctIndex) {
        correctCount++
        if (!strongTopics.includes(q.topic)) strongTopics.push(q.topic)
      } else {
        if (!weakTopics.includes(q.topic)) weakTopics.push(q.topic)
        recordDifficulty(q.topic)
      }
    })

    const finalScore = Math.round((correctCount / totalQ) * 100)
    const isPass = finalScore >= assessment.minScore

    setScore(finalScore)
    setPassed(isPass)
    setIsSubmitted(true)
    submitAssessment(currentModule.id, finalScore)

    if (isPass) {
      toast.success(`Parabéns! Você atingiu ${finalScore}% e foi aprovado no módulo!`)
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        })
      } catch {}
    } else {
      toast.error(`Nota obtida: ${finalScore}%. Nota mínima necessária: ${assessment.minScore}%. Gerando plano de recuperação...`)
      setLoadingRecovery(true)
      const plan = await aiService.generateRecoveryPlan(weakTopics, currentModule.id)
      setRecoveryPlan(plan)
      setLoadingRecovery(false)
    }
  }

  function handleRetake() {
    setSelectedAnswers({})
    setCurrentIdx(0)
    setTimeLeft(assessment.timeLimitMin * 60)
    setIsSubmitted(false)
    setScore(null)
    setPassed(null)
    setRecoveryPlan(null)
  }

  return (
    <AppShell title={assessment.title} subtitle={`Módulo: ${currentModule.title}`}>
      <div className="space-y-6">
        {/* Navigation & Timer Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <Link
            href="/trilha"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
          </Link>

          {!isSubmitted ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                <Clock className="size-3.5" />
                <span>
                  Tempo: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Questão {currentIdx + 1} de {totalQ}
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Assessment Questions or Results Container */}
        {!isSubmitted ? (
          <Card className="border-border/80 shadow-xl shadow-primary/5">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                  Tópico: {currentQ.topic}
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  Nota de corte: {assessment.minScore}%
                </span>
              </div>

              <Progress value={progressPercent} className="h-1.5" />

              <CardTitle className="text-lg sm:text-xl font-bold leading-snug pt-2">
                {currentQ.prompt}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(oIdx)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary font-bold'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-full bg-muted text-[11px] font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected ? <CheckCircle2 className="size-5 text-primary shrink-0" /> : null}
                  </button>
                )
              })}

              <div className="flex items-center justify-between pt-6 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                >
                  Anterior
                </Button>

                {currentIdx < totalQ - 1 ? (
                  <Button
                    onClick={() => setCurrentIdx((i) => i + 1)}
                    disabled={selectedAnswers[currentIdx] === undefined}
                    className="gap-2 font-bold"
                  >
                    Próxima Questão <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    disabled={selectedAnswers[currentIdx] === undefined}
                    className="gap-2 font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground"
                  >
                    Finalizar Avaliação <CheckCircle2 className="size-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Result & Recovery Plan Screen */
          <div className="space-y-6">
            <Card className="border-border/80 shadow-2xl overflow-hidden">
              <div
                className={`p-6 border-b border-border ${
                  passed
                    ? 'bg-gradient-to-r from-success/20 via-success/10 to-transparent'
                    : 'bg-gradient-to-r from-destructive/20 via-destructive/10 to-transparent'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-12 place-items-center rounded-2xl text-primary-foreground shadow-lg ${
                        passed ? 'bg-success shadow-success/30' : 'bg-destructive shadow-destructive/30'
                      }`}
                    >
                      {passed ? <Trophy className="size-6" /> : <AlertTriangle className="size-6" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {passed ? 'Parabéns! Módulo Concluído com Sucesso!' : 'Você Não Atingiu a Nota Mínima'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {passed
                          ? 'O próximo módulo da sua trilha foi desbloqueado automaticamente!'
                          : 'A nota de corte é 70%. A IA montou um plano de recuperação para você.'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Sua Nota</span>
                    <p className={`text-2xl font-black ${passed ? 'text-success' : 'text-destructive'}`}>
                      {score}%
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Result Breakdown */}
                {passed ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                      <h4 className="font-bold text-success text-xs uppercase tracking-wider mb-1">
                        Domínio Comprovado
                      </h4>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        Você demonstrou excelente compreensão de todos os conceitos avaliados neste módulo. O próximo módulo da sua trilha já está liberado no Dashboard.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={handleRetake} className="gap-2 text-xs">
                        <RotateCcw className="size-3.5" /> Refazer para Treinar
                      </Button>
                      <Link href="/trilha">
                        <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                          Avançar na Minha Trilha <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* AI Recovery Plan */
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-warning" />
                        <h3 className="text-sm font-bold text-warning">
                          Plano de Recuperação Personalizado por IA
                        </h3>
                      </div>

                      {loadingRecovery ? (
                        <p className="text-xs text-muted-foreground animate-pulse">Gerando recomendações...</p>
                      ) : recoveryPlan ? (
                        <div className="space-y-4 text-xs">
                          <p className="text-foreground/90 leading-relaxed">{recoveryPlan.explanation}</p>

                          <div>
                            <p className="font-bold text-foreground mb-1.5">Aulas Recomendadas para Revisão:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              {recoveryPlan.recommendedLessons.map((l, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="size-1.5 rounded-full bg-warning" />
                                  {l}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-bold text-foreground mb-1.5">Desafio de Fixação:</p>
                            <div className="rounded-lg border border-border bg-card p-3 font-mono text-[11px] text-foreground">
                              {recoveryPlan.miniChallenge}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link href={`/aulas/${currentModule.lessonIds[0] || 'l-logica-1'}`}>
                        <Button variant="outline" className="gap-2 text-xs">
                          <Brain className="size-3.5 text-primary" /> Revisar Aulas
                        </Button>
                      </Link>

                      <Button onClick={handleRetake} className="gap-2 font-bold shadow-lg shadow-primary/20">
                        <RotateCcw className="size-4" /> Fazer Nova Tentativa
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
