'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  HelpCircle,
  Repeat,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { SpacedReviewItem } from '@/lib/types'

export default function SpacedReviewsPage() {
  const { spacedReviews, completeSpacedReview, difficulties } = useAppStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  const pendingReviews = spacedReviews.filter((r) => !r.completed)
  const activeReview: SpacedReviewItem | undefined = pendingReviews[currentIdx]

  function handleRate(quality: 'hard' | 'good' | 'easy') {
    if (!activeReview) return

    completeSpacedReview(activeReview.id)
    setIsRevealed(false)

    if (quality === 'hard') {
      toast.info('Tópico agendado para revisão amanhã.')
    } else if (quality === 'good') {
      toast.success('Excelente! Próxima revisão em 7 dias. +10 XP')
    } else {
      toast.success('Perfeito! Próxima revisão em 14 dias. +15 XP')
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } })
      } catch {}
    }
  }

  return (
    <AppShell
      title="Sistema de Revisão Espaçada"
      subtitle="Fixação de longo prazo com algoritmos de repetição inteligentes baseados no seu desempenho"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Overview Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Repeat className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Revisões Inteligentes Ativas</h2>
              <p className="text-xs text-muted-foreground">
                Ciclos calculados: <strong>Hoje • 2 dias • 7 dias • 14 dias • 30 dias</strong>
              </p>
            </div>
          </div>

          <Badge className="bg-primary text-primary-foreground font-bold">
            {pendingReviews.length} flashcards para hoje
          </Badge>
        </div>

        {/* Flashcard Workspace */}
        {activeReview ? (
          <Card className="border-border/80 shadow-xl shadow-primary/5 overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                  {activeReview.moduleTitle}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Card {currentIdx + 1} de {pendingReviews.length}
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground pt-1">
                Tópico: {activeReview.topic}
              </span>
            </CardHeader>

            <CardContent className="p-8 space-y-8 text-center">
              {/* Question */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pergunta do Flashcard
                </p>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-relaxed">
                  {activeReview.question}
                </h3>
              </div>

              {/* Reveal Action / Revealed Answer */}
              {!isRevealed ? (
                <Button
                  size="lg"
                  onClick={() => setIsRevealed(true)}
                  className="gap-2 font-bold shadow-lg shadow-primary/20 px-8 py-6 rounded-2xl"
                >
                  <Eye className="size-5" /> Mostrar Resposta Explicada
                </Button>
              ) : (
                <div className="space-y-6 pt-4 border-t border-border animate-in fade-in zoom-in-95 duration-300">
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Resposta & Conceito
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      {activeReview.answer}
                    </p>
                  </div>

                  {/* Rating Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Como foi sua lembrança deste conceito?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleRate('hard')}
                        className="flex-col gap-1 py-6 border-destructive/30 hover:bg-destructive/10 text-destructive"
                      >
                        <span className="text-xs font-bold">Difícil / Esqueci</span>
                        <span className="text-[10px] text-muted-foreground">Rever amanhã</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleRate('good')}
                        className="flex-col gap-1 py-6 border-primary/30 hover:bg-primary/10 text-primary"
                      >
                        <span className="text-xs font-bold">Bom / Lembrei</span>
                        <span className="text-[10px] text-muted-foreground">Rever em 7 dias</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleRate('easy')}
                        className="flex-col gap-1 py-6 border-success/30 hover:bg-success/10 text-success"
                      >
                        <span className="text-xs font-bold">Fácil / Dominei</span>
                        <span className="text-[10px] text-muted-foreground">Rever em 14 dias</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Empty State when finished or no reviews */
          <Card className="border-border/80 shadow-xl p-12 text-center space-y-4">
            <div className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary mx-auto shadow-lg shadow-primary/15">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {spacedReviews.length === 0 ? 'Nenhuma revisão agendada ainda' : 'Todas as revisões de hoje concluídas!'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {spacedReviews.length === 0
                ? 'Conforme você assistir às suas primeiras aulas e concluir exercícios no Módulo 1, a IA criará flashcards para reforçar sua memória de longo prazo.'
                : 'Você manteve sua retenção em dia! Novos flashcards serão gerados conforme você avança nos próximos módulos.'}
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="gap-2 font-bold">
                  Voltar ao Dashboard <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
