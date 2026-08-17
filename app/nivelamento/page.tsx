'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { placementQuestions } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import type { PlacementResult } from '@/lib/types'

export default function PlacementTestPage() {
  const router = useRouter()
  const { completePlacement, profile } = useAppStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [result, setResult] = useState<PlacementResult | null>(null)

  const currentQ = placementQuestions[currentIdx]
  const totalQ = placementQuestions.length
  const progressPercent = Math.round(((currentIdx + 1) / totalQ) * 100)

  function handleSelect(optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }))
  }

  function handleNext() {
    if (answers[currentIdx] === undefined) {
      toast.error('Por favor, selecione uma resposta antes de prosseguir.')
      return
    }

    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      // Calculate Score and Topic-by-Topic Knowledge Map
      let correct = 0
      const strong: string[] = []
      const weak: string[] = []
      const topicScores: Record<string, number> = {}

      placementQuestions.forEach((q, idx) => {
        const userChoice = answers[idx]
        const isCorrect = userChoice === q.correctIndex
        if (isCorrect) {
          correct++
          if (!strong.includes(q.topic)) strong.push(q.topic)
        } else {
          if (!weak.includes(q.topic)) weak.push(q.topic)
        }
        topicScores[q.categoryKey || q.topic] = isCorrect ? 100 : 25
      })

      const score = Math.round((correct / totalQ) * 100)
      const declaredLevel = profile?.userJourneyState || 'iniciante'

      const knowledgeMap = {
        logic: topicScores['logic'] ?? (answers[0] === 1 ? 100 : 25),
        algorithms: topicScores['algorithms'] ?? (answers[1] === 1 ? 100 : 25),
        html: topicScores['html'] ?? (answers[2] === 1 ? 100 : 25),
        css: topicScores['css'] ?? (answers[3] === 1 ? 100 : 25),
        javascript: topicScores['javascript'] ?? (answers[4] === 2 ? 100 : 25),
        git: topicScores['git'] ?? (answers[5] === 1 ? 100 : 25),
        databases: topicScores['databases'] ?? (answers[6] === 2 ? 100 : 25),
        apis: topicScores['apis'] ?? (answers[7] === 1 ? 100 : 25),
      }

      let level = 'iniciante-absoluto'
      if (score >= 85) level = 'intermediario'
      else if (score >= 65) level = 'basico'
      else if (score >= 40) level = 'iniciante'

      const mandatoryLogic = score < 65 || knowledgeMap.logic < 65
      const startingStage = mandatoryLogic ? 'LOGIC_AND_PROGRAMMING_FOUNDATIONS' : 'ADVANCED_ENTRY'

      const placementData: PlacementResult = {
        score,
        overallScore: score,
        level,
        declaredLevel,
        knowledgeMap,
        topicScores,
        strongTopics: strong.length ? strong : ['Conceitos fundamentais'],
        weakTopics: weak.length ? weak : ['Nenhuma fraqueza crítica detectada'],
        startingStage,
        mandatoryLogic,
        recommendations: [
          mandatoryLogic
            ? 'Regra Pedagógica dos 65%: Sua formação iniciará obrigatoriamente por Fundamentos de Lógica e Algoritmos.'
            : 'Aproveitamento sólido! O motor adaptativo validou seus fundamentos e estruturou um ponto de entrada customizado.',
        ],
      }

      setResult(placementData)
      completePlacement(placementData)
      setIsFinished(true)

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        })
      } catch {
        // ignore
      }
    }
  }

  function handleGoToGeneratePath() {
    toast.success('Diagnóstico concluído! Gerando sua trilha personalizada...')
    router.push('/criando-trilha')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between pb-6">
        <Logo />
        {!isFinished ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Questão {currentIdx + 1} de {totalQ}
            </span>
            <div className="w-28 sm:w-36">
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        ) : null}
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center">
        {!isFinished && currentQ ? (
          <Card className="border-border/80 shadow-2xl shadow-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Brain className="size-3.5 text-primary" />
                  Tópico: {currentQ.topic}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Teste Diagnóstico IA
                </span>
              </div>
              <CardTitle className="pt-3 text-lg sm:text-xl font-bold leading-snug">
                {currentQ.prompt}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answers[currentIdx] === oIdx
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(oIdx)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : null}
                  </button>
                )
              })}

              <div className="pt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                >
                  Anterior
                </Button>
                <Button onClick={handleNext} className="gap-2 shadow-md shadow-primary/20">
                  {currentIdx === totalQ - 1 ? 'Concluir Teste' : 'Próxima Questão'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : result ? (
          /* Result Summary Card */
          <Card className="border-border/80 shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <Trophy className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Diagnóstico Concluído com Sucesso!</h2>
                    <p className="text-xs text-muted-foreground">A IA analisou seu perfil e identificou seu nível inicial.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl border border-primary/30 bg-card p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Sua Pontuação</p>
                    <p className="text-2xl font-black text-primary">{result.score}%</p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6 p-6">
              {/* Pedagogical Rule 65% Banner */}
              <div className={`rounded-xl border p-4 ${
                result.mandatoryLogic
                  ? 'border-blue-500/30 bg-blue-500/[0.06] text-blue-400'
                  : 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Brain className="size-4" />
                  {result.mandatoryLogic ? 'Regra Pedagógica dos 65% (Ponto de Partida Obrigatório)' : 'Validação de Fundamentos (Ponto de Entrada Avançado)'}
                </p>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {result.mandatoryLogic
                    ? `Seu aproveitamento diagnóstico foi de ${result.score}% (abaixo do limiar de 65% ou com base de lógica a fortalecer). A primeira etapa da sua trilha será obrigatoriamente Lógica de Programação e Algoritmos antes de avançar para a tecnologia-alvo.`
                    : `Parabéns! Seu aproveitamento de ${result.score}% superou o limiar de 65% e comprovou domínio prévio nos fundamentos de lógica. O motor personalizará seu ponto de partida.`}
                </p>
              </div>

              {/* Knowledge Map Grid */}
              {result.knowledgeMap ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mapa de Conhecimento por Competência
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Lógica</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.logic}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Algoritmos</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.algorithms}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">HTML5</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.html}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">CSS3</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.css}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">JavaScript</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.javascript}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Git/GitHub</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.git}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">SQL / Banco</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.databases}%</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">APIs / Backend</p>
                      <p className="text-sm font-bold text-foreground">{result.knowledgeMap.apis}%</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="size-4" /> Pontos Fortes
                  </p>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {result.strongTopics?.map((t) => (
                      <li key={t} className="flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-success" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5 mb-2">
                    <Sparkles className="size-4" /> Foco de Evolução
                  </p>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {result.weakTopics?.map((t) => (
                      <li key={t} className="flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-warning" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Parecer da IA & Próximos Passos
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Com base no seu teste, determinamos seu ponto de partida como{' '}
                  <strong className="text-foreground capitalize">{result.level}</strong>. Agora a IA gerará sua trilha individual estruturada a partir do catálogo real.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleGoToGeneratePath}
                className="w-full gap-2 shadow-xl shadow-primary/25 text-base font-bold py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Gerar Minha Trilha Personalizada
                <ArrowRight className="size-5" />
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-3xl pt-6 text-center text-xs text-muted-foreground">
        DevPath AI — Nivelamento adaptativo por Inteligência Artificial.
      </footer>
    </div>
  )
}
