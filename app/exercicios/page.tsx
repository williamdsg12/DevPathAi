'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Filter,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { mockExercises } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import type { Exercise } from '@/lib/types'

export default function ExercisesPage() {
  const {
    allModules,
    completedExercises,
    completeExercise,
    recordDifficulty,
    currentModuleId,
  } = useAppStore()

  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [activeExerciseId, setActiveExerciseId] = useState<string>(mockExercises[0]?.id || 'ex-1')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [codeAnswer, setCodeAnswer] = useState<string>('')
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Filter exercises
  const filteredExercises = mockExercises.filter((ex) => {
    const modMatch = selectedModule === 'all' || ex.moduleId === selectedModule
    const diffMatch = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty
    return modMatch && diffMatch
  })

  const currentExercise = mockExercises.find((e) => e.id === activeExerciseId) || mockExercises[0]
  const isAlreadyDone = currentExercise ? completedExercises.includes(currentExercise.id) : false

  function handleSelectOption(idx: number) {
    if (hasSubmitted) return
    setSelectedOption(idx)
  }

  function handleSubmit() {
    if (!currentExercise) return

    if (currentExercise.type === 'multiple_choice') {
      if (selectedOption === null) {
        toast.error('Selecione uma alternativa antes de enviar.')
        return
      }

      const correct = selectedOption === currentExercise.correctOption
      setIsCorrect(correct)
      setHasSubmitted(true)

      if (correct) {
        completeExercise(currentExercise.id)
        toast.success('Parabéns! Resposta correta (+20 XP).')
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } })
        } catch {}
      } else {
        recordDifficulty(currentExercise.title)
        toast.error('Resposta incorreta. Analise a explicação e tente novamente.')
      }
    } else {
      // Code or written
      if (!codeAnswer.trim()) {
        toast.error('Escreva sua resposta ou código.')
        return
      }
      setIsCorrect(true)
      setHasSubmitted(true)
      completeExercise(currentExercise.id)
      toast.success('Exercício concluído! +30 XP')
    }
  }

  function handleReset() {
    setSelectedOption(null)
    setCodeAnswer('')
    setHasSubmitted(false)
    setIsCorrect(null)
  }

  function handleSwitchExercise(id: string) {
    setActiveExerciseId(id)
    handleReset()
  }

  return (
    <AppShell
      title="Central de Exercícios Práticos"
      subtitle="Resolva desafios de fixação com feedback imediato e explicações didáticas"
    >
      <div className="space-y-6">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Filter className="size-4 text-primary" /> Módulo:
            </div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todos os Módulos</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-2">
              Dificuldade:
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todas</option>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          <div className="text-xs font-bold text-primary">
            {completedExercises.length} de {mockExercises.length} concluídos
          </div>
        </div>

        {/* Exercises List & Workspace Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Exercises Sidebar List */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lista de Desafios ({filteredExercises.length})
            </p>

            <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
              {filteredExercises.map((ex, i) => {
                const isSelected = ex.id === activeExerciseId
                const isDone = completedExercises.includes(ex.id)

                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleSwitchExercise(ex.id)}
                    className={`w-full flex items-center justify-between rounded-xl p-3.5 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm'
                        : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                          isDone ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDone ? '✓' : i + 1}
                      </span>
                      <span className="truncate">{ex.prompt}</span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${
                        ex.difficulty === 'facil'
                          ? 'border-success/30 text-success'
                          : ex.difficulty === 'medio'
                          ? 'border-warning/30 text-warning'
                          : 'border-destructive/30 text-destructive'
                      }`}
                    >
                      {ex.difficulty}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Exercise Challenge Box */}
          <div className="lg:col-span-2 space-y-6">
            {currentExercise ? (
              <Card className="border-border/80 shadow-xl shadow-primary/5">
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs uppercase font-bold tracking-wider">
                      Tipo: {currentExercise.type}
                    </Badge>
                    <span className="text-xs font-bold text-primary">
                      +20 XP ao acertar
                    </span>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-bold leading-snug">
                    {currentExercise.prompt}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Multiple Choice / True False Options */}
                  {currentExercise.options && currentExercise.options.length > 0 ? (
                    <div className="space-y-2.5">
                      {currentExercise.options.map((opt, oIdx) => {
                        const isChosen = selectedOption === oIdx
                        let optionStyle = 'border-border bg-card text-muted-foreground hover:border-primary/50'

                        if (hasSubmitted) {
                          if (oIdx === currentExercise.correctIndex) {
                            optionStyle = 'border-success bg-success/10 text-success font-bold ring-1 ring-success'
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'border-destructive bg-destructive/10 text-destructive font-bold ring-1 ring-destructive'
                          }
                        } else if (isChosen) {
                          optionStyle = 'border-primary bg-primary/10 text-foreground ring-1 ring-primary font-medium'
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(oIdx)}
                            className={`w-full flex items-center justify-between rounded-xl border p-4 text-left text-xs sm:text-sm transition-all ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="grid size-6 place-items-center rounded-full bg-muted text-[11px] font-bold">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {hasSubmitted && oIdx === currentExercise.correctIndex ? (
                              <CheckCircle2 className="size-5 text-success shrink-0" />
                            ) : hasSubmitted && isChosen && !isCorrect ? (
                              <XCircle className="size-5 text-destructive shrink-0" />
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* Code / Written Exercise */
                    <div className="space-y-2">
                      <Textarea
                        rows={6}
                        placeholder="Digite o código da solução aqui..."
                        value={codeAnswer}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        className="font-mono text-xs leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Submission and Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={!hasSubmitted && selectedOption === null && !codeAnswer}
                      className="gap-1.5 text-xs text-muted-foreground"
                    >
                      <RotateCcw className="size-3.5" /> Limpar Resposta
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={hasSubmitted && isCorrect === true}
                      className="gap-2 font-bold shadow-md shadow-primary/20"
                    >
                      {hasSubmitted && isCorrect ? 'Concluído ✓' : 'Confirmar Resposta'}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  {/* Detailed Pedagogical Explanation Box */}
                  {hasSubmitted ? (
                    <div
                      className={`rounded-2xl border p-5 space-y-2 mt-4 transition-all ${
                        isCorrect
                          ? 'border-success/30 bg-success/5'
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="size-5 text-success" />
                        ) : (
                          <XCircle className="size-5 text-destructive" />
                        )}
                        <h4 className={`text-sm font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                          {isCorrect ? 'Parabéns, você acertou!' : 'Ops, não foi dessa vez!'}
                        </h4>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {currentExercise.explanation}
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={`/mentor?q=${encodeURIComponent(`Não entendi este exercício: "${currentExercise.prompt}"`)}`}
                        >
                          <Button variant="outline" size="sm" className="text-xs gap-1.5">
                            <Sparkles className="size-3.5 text-primary" /> Tirar Dúvida com DevMentor AI
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
