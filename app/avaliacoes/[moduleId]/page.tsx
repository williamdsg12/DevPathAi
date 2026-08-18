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
import { moduleCompletionEngine } from '@/lib/pedagogy/module-completion-engine'
import type { Assessment, AssessmentQuestion, ModuleReflection, RecoveryPlan } from '@/lib/types'
import { Textarea } from '@/components/ui/textarea'

export default function ModuleAssessmentPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const moduleId = resolvedParams.moduleId

  const {
    allModules,
    allLessons,
    allCourses,
    assessments,
    completedLessons,
    submitAssessment,
    recordDifficulty,
    submitModuleReflection,
    moduleReflections,
    moduleProgress,
  } = useAppStore()

  const currentModule = allModules.find((m) => m.id === moduleId) || allModules[0]
  const currentCourse = allCourses.find((c) => c.id === currentModule.courseId || c.category === currentModule.phase) || allCourses[0]

  // Module Lessons & Completion Check
  const moduleLessons = allLessons
    .filter((l) => l.moduleId === currentModule.id || currentModule.lessonIds.includes(l.id))
    .sort((a, b) => a.order - b.order)

  const completedModuleLessons = moduleLessons.filter((l) => completedLessons.includes(l.id))
  const totalModuleLessons = moduleLessons.length || currentModule.lessonIds.length || 1
  const lessonsProgressPercent = Math.min(100, Math.round((completedModuleLessons.length / totalModuleLessons) * 100))
  const isModuleFullyCompleted = totalModuleLessons > 0 && completedModuleLessons.length >= totalModuleLessons
  const nextPendingLesson = moduleLessons.find((l) => !completedLessons.includes(l.id)) || moduleLessons[0]

  // Use the assessment questions for the module or fallback to mock
  const rawAssessment = assessments[currentModule.id] || mockAssessments.find((a) => a.moduleId === currentModule.id) || mockAssessments[0]
  const assessment: Assessment = {
    ...rawAssessment,
    moduleId: currentModule.id,
    title: `Avaliação Oficial — ${currentModule.title}`,
  }

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimitMin * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null)
  const [loadingRecovery, setLoadingRecovery] = useState(false)

  // Pedagogical Reflection Form State
  const existingReflection = moduleReflections[currentModule.id]
  const [reflectionKeyLearnings, setReflectionKeyLearnings] = useState(existingReflection?.keyLearnings || '')
  const [reflectionHardestTopic, setReflectionHardestTopic] = useState(existingReflection?.hardestTopic || '')
  const [reflectionConfidence, setReflectionConfidence] = useState<number>(existingReflection?.confidenceRating || 5)
  const [reflectionPrepared, setReflectionPrepared] = useState<boolean>(existingReflection?.preparedToAdvance ?? true)
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(Boolean(existingReflection))

  // Timer countdown
  useEffect(() => {
    if (!isModuleFullyCompleted || isSubmitted || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [isModuleFullyCompleted, isSubmitted, timeLeft])

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
      const plan = moduleCompletionEngine.generateRecoveryPlan(weakTopics, currentModule.id, currentModule.title)
      setRecoveryPlan(plan)
      setLoadingRecovery(false)
    }
  }

  function handleSaveReflection() {
    if (!reflectionKeyLearnings.trim()) {
      toast.error('Preencha o que você mais aprendeu no módulo.')
      return
    }

    submitModuleReflection(currentModule.id, {
      moduleId: currentModule.id,
      keyLearnings: reflectionKeyLearnings,
      hardestTopic: reflectionHardestTopic,
      confidenceRating: reflectionConfidence,
      preparedToAdvance: reflectionPrepared,
    })

    setReflectionSaved(true)
    toast.success('Reflexão pedagógica salva com sucesso! Requisito de conclusão atingido.')
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

  // =========================================================================
  // GATEKEEPER: TELA DE BLOQUEIO QUANDO AS AULAS NÃO FORAM TODAS CONCLUÍDAS
  // =========================================================================
  if (!isModuleFullyCompleted) {
    return (
      <AppShell
        title={`Avaliação Oficial — ${currentModule.title}`}
        subtitle="Prova oficial de certificação e nivelamento pedagógico"
      >
        <div className="mx-auto max-w-4xl space-y-8 pb-16">
          {/* Breadcrumb de Voltar */}
          <div className="flex items-center justify-between">
            <Link
              href="/trilha"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
            </Link>

            <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-bold gap-1.5 px-3 py-1">
              <Clock className="size-3.5" /> Pré-requisito Obrigatório
            </Badge>
          </div>

          {/* Card Principal de Bloqueio com Design Premium */}
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-b from-[#161426] via-[#100f1c] to-[#0a0912] p-8 sm:p-12 shadow-2xl space-y-8">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 size-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            <div className="text-center space-y-4 max-w-2xl mx-auto">
              {/* Ícone de Cadeado Iluminado */}
              <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-900/30 border border-violet-500/40 text-violet-400 shadow-xl shadow-violet-950/50">
                <Target className="size-10 text-violet-300 animate-pulse" />
              </div>

              <div className="space-y-2">
                <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold px-3 py-0.5 text-xs">
                  Banca Examinadora do Mentor Dev
                </Badge>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Avaliação Oficial Bloqueada
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
                  Para liberar a prova avaliativa e testar seu domínio com a inteligência artificial da plataforma, é obrigatório concluir <span className="text-violet-300 font-bold">100% das aulas</span> do módulo <span className="text-white font-bold">{currentModule.title}</span>.
                </p>
              </div>
            </div>

            {/* Painel de Progresso das Aulas */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-violet-400" />
                  Progresso das Aulas do Módulo:
                </span>
                <span className="font-mono font-bold text-violet-300">
                  {completedModuleLessons.length} de {totalModuleLessons} aulas concluídas ({lessonsProgressPercent}%)
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-500 shadow-md shadow-violet-600/40"
                  style={{ width: `${Math.max(5, lessonsProgressPercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium pt-1">
                <span>Faltam {totalModuleLessons - completedModuleLessons.length} aula(s) para liberar a prova</span>
                <span>Nota de corte: {assessment.minScore}% de acertos</span>
              </div>
            </div>

            {/* Chamada para Ação (CTA) Principal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {nextPendingLesson && (
                <Link href={`/aulas/${nextPendingLesson.id}`} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2.5 font-black text-sm px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-purple-600/30 border border-violet-400/30 cursor-pointer"
                  >
                    <ArrowRight className="size-4" /> Continuar Aulas do Curso (Aula {nextPendingLesson.order})
                  </Button>
                </Link>
              )}

              <Link href="/trilha" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-sm px-6 py-6 rounded-2xl bg-white/[0.02] border-white/10 text-zinc-300 hover:text-white hover:border-white/20 cursor-pointer"
                >
                  Explorar Trilha
                </Button>
              </Link>
            </div>

            {/* Grade Informativa: O que será avaliado na Prova */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Sparkles className="size-3.5 text-violet-400" />
                Matérias avaliadas pelo Mentor Dev após a conclusão:
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                  <span className="text-xs font-bold text-white">Algoritmos & Visualg</span>
                  <p className="text-[11px] text-zinc-400">Passos lógicos, variáveis de memória e tipos primitivos.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                  <span className="text-xs font-bold text-white">Operadores & Condicionais</span>
                  <p className="text-[11px] text-zinc-400">Operadores lógicos, relacionais, Se..Então e Escolha..Caso.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                  <span className="text-xs font-bold text-white">Repetições & Matrizes</span>
                  <p className="text-[11px] text-zinc-400">Laços Enquanto, Repita, Para, vetores e matrizes 2D.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={assessment.title} subtitle={`Módulo: ${currentModule.title}`}>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Navigation & Timer Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <Link
            href="/trilha"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para Minha Trilha
          </Link>

          {!isSubmitted ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs font-bold text-violet-300 shadow-sm">
                <Clock className="size-3.5" />
                <span>
                  Tempo: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs bg-white/5 text-zinc-300">
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
                  <div className="space-y-6">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-1">
                        Domínio Comprovado na Avaliação
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        Você demonstrou excelente compreensão de todos os conceitos avaliados neste módulo. Para concluir 100% dos 5 critérios pedagógicos do módulo, preencha sua breve reflexão de aprendizado abaixo.
                      </p>
                    </div>

                    {/* Pedagogical Reflection Section */}
                    <div className="rounded-2xl border border-white/10 bg-[#12111a] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="size-4 text-violet-400" />
                          <h4 className="text-sm font-bold text-white">Reflexão Pedagógica de Conclusão</h4>
                        </div>
                        {reflectionSaved && (
                          <Badge className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="size-3" /> Reflexão Registrada
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-300">
                            1. O que você mais aprendeu de importante neste módulo? *
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Ex: Aprendi a encadear estruturas condicionais e manipular arrays com map/filter..."
                            value={reflectionKeyLearnings}
                            onChange={(e) => setReflectionKeyLearnings(e.target.value)}
                            className="text-xs bg-black/40 border-white/10 text-zinc-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-300">
                            2. Qual conceito você achou mais desafiador ou gostaria de reforçar?
                          </label>
                          <Input
                            placeholder="Ex: Escopo de variáveis, depuração de erros em loops..."
                            value={reflectionHardestTopic}
                            onChange={(e) => setReflectionHardestTopic(e.target.value)}
                            className="text-xs bg-black/40 border-white/10 text-zinc-200"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-zinc-400">Nível de Confiança:</label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReflectionConfidence(star)}
                                  className={`text-sm ${star <= reflectionConfidence ? 'text-amber-400' : 'text-zinc-600'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={handleSaveReflection}
                            className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30"
                          >
                            Salvar Reflexão do Módulo
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={handleRetake} className="gap-2 text-xs rounded-xl border-white/10 text-zinc-300">
                        <RotateCcw className="size-3.5" /> Refazer Avaliação para Treinar
                      </Button>
                      <Link href="/trilha">
                        <Button className="gap-2 font-bold shadow-lg shadow-violet-600/30 bg-violet-600 hover:bg-violet-500 text-white rounded-xl">
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
