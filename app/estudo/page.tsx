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
  Volume2,
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
      title: 'Quiz Rápido de Fixação de Lógica',
      durationMinutes: 5,
      type: 'quiz',
      completed: false,
      actionUrl: '/exercicios',
    },
  ])

  // Focus Pomodoro Timer state
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
      toast.success(`🎉 Ciclo Pomodoro concluído! +${minutesSpent} minutos registrados na sua meta diária.`)
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
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

  // Pomodoro Circular Progress math
  const timerRadius = 88
  const circumference = 2 * Math.PI * timerRadius
  const timerProgress = 1 - timeLeft / timerDuration
  const strokeDashoffset = circumference * (1 - timerProgress)

  return (
    <AppShell
      title="Plano de Estudo Diário"
      subtitle="Organização inteligente do tempo de estudo com cronômetro Pomodoro de foco e metas da IA"
    >
      <div className="space-y-8 pb-16">
        {/* Daily Goal Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold text-xs">
                Meta do Dia
              </Badge>
              <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs gap-1">
                <Flame className="size-3.5 fill-amber-400" /> {streak} dias seguidos
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {todayStudiedMinutes} min <span className="text-sm font-semibold text-zinc-400">de {totalTargetMinutes} min planejados</span>
            </h2>
            <p className="text-xs text-zinc-400">
              {completedCount} de {items.length} blocos de estudo completados hoje.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-400">Progresso da Meta</span>
              <span className="text-violet-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* 2 Cols: Pomodoro Circular Timer (Left) + AI Daily Schedule (Right) */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Pomodoro Focus Timer Card */}
          <Card className="lg:col-span-5 border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Clock className="size-4" /> Timer Pomodoro
              </span>
              <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-300">
                {selectedSessionType}
              </Badge>
            </div>

            {/* Circular Progress Display */}
            <div className="relative mx-auto size-56 sm:size-60 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={timerRadius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={timerRadius}
                  stroke="url(#purpleGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold text-violet-300">
                  {isRunning ? 'Sessão em Andamento' : 'Pausado'}
                </span>
              </div>
            </div>

            {/* Timer Presets */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 25, label: 'Foco (25 min)' },
                { mins: 50, label: 'Intenso (50 min)' },
                { mins: 5, label: 'Pausa (5 min)' },
              ].map((p) => (
                <button
                  key={p.mins}
                  type="button"
                  onClick={() => handleSetTimer(p.mins, p.label)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    timerDuration === p.mins * 60
                      ? 'border-violet-500 bg-violet-950/60 text-white'
                      : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.mins}m
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={`gap-2 font-black text-xs sm:text-sm px-8 py-5 rounded-2xl shadow-xl cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-purple-600/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="size-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-white" /> Iniciar Foco
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsRunning(false)
                  setTimeLeft(timerDuration)
                }}
                className="size-12 rounded-2xl border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
                title="Reiniciar Timer"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </Card>

          {/* AI Recommended Daily Study Plan */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-400" /> Cronograma Recomendado pela IA
                </h3>
                <p className="text-xs text-zinc-400">Atividades sequenciais priorizadas para hoje</p>
              </div>
              <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-bold">
                Otimizado
              </Badge>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    item.completed
                      ? 'border-emerald-500/30 bg-emerald-950/20 opacity-75'
                      : 'border-white/5 bg-[#12111d] hover:border-violet-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`grid size-6 place-items-center rounded-lg border transition-colors cursor-pointer ${
                        item.completed
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-white/20 bg-black/40 hover:border-violet-500'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="size-4" />}
                    </button>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          item.completed ? 'line-through text-zinc-400' : 'text-white'
                        }`}
                      >
                        {idx + 1}. {item.title}
                      </h4>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
                        <Clock className="size-3 text-violet-400" /> {item.durationMinutes} minutos estimados
                      </span>
                    </div>
                  </div>

                  <Link href={item.actionUrl || '/trilha'}>
                    <Button size="sm" variant="ghost" className="text-xs text-violet-400 hover:text-violet-300 font-bold gap-1">
                      Iniciar <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
