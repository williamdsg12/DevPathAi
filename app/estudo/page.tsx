'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import type { StudyPlanItem } from '@/lib/types'

export default function StudyPlanPage() {
  const {
    todayStudiedMinutes,
    recordStudySession,
    nextPendingLessonId,
    streak,
  } = useAppStore()

  // Daily Study Breakdown Items
  const [items, setItems] = useState<StudyPlanItem[]>([
    {
      id: 'it-1',
      title: 'Assistir Aula do Módulo Atual',
      durationMinutes: 25,
      type: 'lesson',
      completed: false,
      actionUrl: nextPendingLessonId ? `/aulas/${nextPendingLessonId}` : '/trilha',
    },
    {
      id: 'it-2',
      title: 'Resolver 3 Exercícios de Fixação',
      durationMinutes: 20,
      type: 'exercise',
      completed: false,
      actionUrl: '/exercicios',
    },
    {
      id: 'it-3',
      title: 'Prática de Código no Code Lab',
      durationMinutes: 30,
      type: 'practice',
      completed: false,
      actionUrl: '/code-lab',
    },
    {
      id: 'it-4',
      title: 'Revisão Espaçada de Tópicos Anteriores',
      durationMinutes: 10,
      type: 'review',
      completed: false,
      actionUrl: '/revisoes',
    },
    {
      id: 'it-5',
      title: 'Quiz Rápido de Fixação',
      durationMinutes: 5,
      type: 'quiz',
      completed: false,
      actionUrl: '/exercicios',
    },
  ])

  // Focus Timer state
  const [timerDuration, setTimerDuration] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSessionType, setSelectedSessionType] = useState('Foco em Aula')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      const minutesSpent = Math.round(timerDuration / 60)
      recordStudySession(minutesSpent)
      toast.success(`Sessão de estudos concluída! +${minutesSpent} minutos registrados.`)
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } })
      } catch {}
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, timerDuration, recordStudySession])

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    )
  }

  function handleSetTimer(mins: number, label: string) {
    setIsRunning(false)
    setTimerDuration(mins * 60)
    setTimeLeft(mins * 60)
    setSelectedSessionType(label)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const completedCount = items.filter((i) => i.completed).length
  const totalTargetMinutes = 90
  const progressPercent = Math.min(100, Math.round((todayStudiedMinutes / totalTargetMinutes) * 100))

  return (
    <AppShell
      title="Plano de Estudo Diário"
      subtitle="Organização inteligente do tempo de estudo com cronômetro de foco e metas"
    >
      <div className="space-y-8">
        {/* Daily Goal Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-xl shadow-primary/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold">Meta de Hoje</Badge>
              <Badge className="bg-warning/15 text-warning font-bold gap-1">
                <Flame className="size-3.5 fill-warning" /> {streak} dias seguidos
              </Badge>
            </div>
            <h2 className="text-2xl font-black text-foreground">
              {todayStudiedMinutes} min <span className="text-sm font-semibold text-muted-foreground">de {totalTargetMinutes} min planejados</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {items.length} blocos completados hoje.
            </p>
          </div>

          <div className="w-full sm:w-56 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>Progresso da Meta</span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
          </div>
        </div>

        {/* Workspace: Timer & Checklist */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Left Column: Focus Study Timer */}
          <div className="space-y-6">
            <Card className="border-border/80 shadow-xl shadow-primary/5 text-center p-6 space-y-6">
              <div>
                <Badge variant="secondary" className="text-xs font-bold mb-2">
                  {selectedSessionType}
                </Badge>
                <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-foreground">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
              </div>

              {/* Timer Quick Selectors */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { m: 15, label: '15 min (Sprint)' },
                  { m: 25, label: '25 min (Foco)' },
                  { m: 50, label: '50 min (Imersão)' },
                ].map((preset) => (
                  <button
                    key={preset.m}
                    type="button"
                    onClick={() => handleSetTimer(preset.m, preset.label)}
                    className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                      timerDuration === preset.m * 60
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {preset.m}m
                  </button>
                ))}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => setIsRunning((r) => !r)}
                  className={`gap-2 px-8 font-bold shadow-lg ${
                    isRunning ? 'bg-warning hover:bg-warning/90 text-warning-foreground' : 'shadow-primary/25'
                  }`}
                >
                  {isRunning ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />}
                  {isRunning ? 'Pausar' : 'Iniciar Foco'}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsRunning(false)
                    setTimeLeft(timerDuration)
                  }}
                  title="Reiniciar cronômetro"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right 2 Columns: Structured Study Blocks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Cronograma Recomendado da IA para Hoje
              </h3>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`border transition-all ${
                    item.completed
                      ? 'border-success/30 bg-success/[0.03]'
                      : 'border-border/80 bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`grid size-6 shrink-0 place-items-center rounded-full border transition-all ${
                          item.completed
                            ? 'border-success bg-success text-success-foreground'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                      >
                        {item.completed ? <CheckCircle2 className="size-4" /> : null}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="size-3" /> {item.durationMinutes} minutos recomendados
                        </span>
                      </div>
                    </div>

                    <Link href={item.actionUrl}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold shrink-0">
                        Acessar <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
