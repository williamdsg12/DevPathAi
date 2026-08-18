'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Filter,
  Flame,
  HelpCircle,
  Lightbulb,
  Play,
  RefreshCw,
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
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import type { LearningActivity, ActivityType, ActivityDifficulty } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Múltipla Escolha',
  true_false: 'Verdadeiro ou Falso',
  fill_gap: 'Preencher Lacunas',
  find_bug: 'Encontrar o Bug',
  fix_code: 'Corrigir Código',
  write_code: 'Escrever Código',
  code: 'Prática de Código',
  practical_challenge: 'Desafio Prático',
  mini_project: 'Mini Projeto',
  module_project: 'Projeto de Módulo',
}

export default function ExercisesPage() {
  const {
    activities,
    completedActivities,
    submitActivityAnswer,
    activityAttempts,
    generateActivitiesForLesson,
    generateActivitiesForModule,
    allModules,
    allLessons,
    currentModuleId,
    isSuperAdmin,
  } = useAppStore()

  const [tabFilter, setTabFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [activeActivityId, setActiveActivityId] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [codeAnswer, setCodeAnswer] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHintLevel, setShowHintLevel] = useState<number>(0)
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{
    isCorrect: boolean
    feedback: string
    hint?: string
    xpEarned: number
  } | null>(null)

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const isDone = completedActivities.includes(act.id)
      if (tabFilter === 'pending' && isDone) return false
      if (tabFilter === 'completed' && !isDone) return false

      const modMatch = selectedModule === 'all' || act.moduleId === selectedModule
      const diffMatch = selectedDifficulty === 'all' || act.difficulty === selectedDifficulty
      const typeMatch = selectedType === 'all' || act.type === selectedType
      return modMatch && diffMatch && typeMatch
    })
  }, [activities, completedActivities, tabFilter, selectedModule, selectedDifficulty, selectedType])

  // Current active activity
  const currentActivity: LearningActivity | undefined = useMemo(() => {
    if (activeActivityId) {
      const found = activities.find((a) => a.id === activeActivityId)
      if (found) return found
    }
    return filteredActivities[0] || activities[0]
  }, [activeActivityId, activities, filteredActivities])

  const currentAttempts = currentActivity ? activityAttempts[currentActivity.id] || [] : []
  const isAlreadyDone = currentActivity ? completedActivities.includes(currentActivity.id) : false
  const relatedLesson = allLessons.find((l) => l.id === currentActivity?.lessonId)
  const relatedModule = allModules.find((m) => m.id === currentActivity?.moduleId)

  function handleSelectActivity(id: string) {
    setActiveActivityId(id)
    setSelectedOption(null)
    const act = activities.find((a) => a.id === id)
    setCodeAnswer(act?.codeStarter || '')
    setLastSubmissionResult(null)
    setShowHintLevel(0)
  }

  function handleOptionClick(idx: number) {
    setSelectedOption(idx)
  }

  function handleSubmit() {
    if (!currentActivity) return

    let answerPayload: string | number
    if (currentActivity.type === 'multiple_choice' || currentActivity.type === 'true_false') {
      if (selectedOption === null) {
        toast.error('Selecione uma alternativa antes de enviar.')
        return
      }
      answerPayload = selectedOption
    } else {
      if (!codeAnswer.trim()) {
        toast.error('Insira seu código ou resposta para enviar.')
        return
      }
      answerPayload = codeAnswer.trim()
    }

    const res = submitActivityAnswer(currentActivity.id, answerPayload, 60)
    setLastSubmissionResult(res)

    if (res.isCorrect) {
      toast.success(`Excelente! Atividade concluída com sucesso (+${res.xpEarned} XP).`)
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
      } catch {}
    } else {
      toast.error('Resposta incorreta. Leia a dica pedagógica e tente novamente!')
      if (res.attemptNumber === 1) {
        setShowHintLevel(1)
      } else if (res.attemptNumber >= 2) {
        setShowHintLevel(2)
      }
    }
  }

  function handleResetCode() {
    if (currentActivity?.codeStarter) {
      setCodeAnswer(currentActivity.codeStarter)
      toast.info('Código restaurado para o estado inicial.')
    } else {
      setCodeAnswer('')
    }
  }

  async function handleGenerateMoreActivities() {
    if (!currentActivity?.moduleId) return
    setIsGenerating(true)
    try {
      if (currentActivity.lessonId) {
        await generateActivitiesForLesson(currentActivity.lessonId)
        toast.success('Novas atividades pedagógicas geradas com sucesso para esta aula!')
      } else {
        await generateActivitiesForModule(currentActivity.moduleId)
        toast.success('Atividades geradas com sucesso para todo o módulo!')
      }
    } catch {
      toast.error('Erro ao gerar atividades.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppShell
      title="Atividades Pedagógicas"
      subtitle="Exercícios práticos, desafios de código e fixação profunda vinculados a cada módulo"
    >
      <div className="space-y-8 pb-16">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/50 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold text-xs">
                  Pedagogia Ativa & IA
                </Badge>
                <Badge className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  Zero Enunciados Vazios
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Laboratório de Atividades Práticas
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                Cada exercício é estruturado pedagogicamente para consolidar os conceitos da aula correspondente, com sistema progressivo de dicas e feedback de raciocínio lógico.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-center sm:text-right shadow-inner">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Concluídas</span>
                <p className="text-2xl font-black text-violet-400 font-mono">
                  {completedActivities.length} / {activities.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12111d] border border-white/10 w-fit">
            {[
              { id: 'all', label: 'Todas as Atividades' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'completed', label: 'Concluídas' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setTabFilter(tab.id as 'all' | 'pending' | 'completed')}
                className={`text-xs font-bold rounded-xl px-4 transition-all cursor-pointer ${
                  tabFilter === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Module, Difficulty & Type Dropdowns (Exclusively Clean Programming Topics) */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111d] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todos os Módulos de Programação</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111d] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todas Dificuldades</option>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111d] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="multiple_choice">Múltipla Escolha</option>
              <option value="code">Prática de Código</option>
              <option value="write_code">Escrever Código</option>
              <option value="fix_code">Corrigir Código</option>
              <option value="find_bug">Encontrar Bug</option>
            </select>
          </div>
        </div>

        {/* Two Columns: Activities Cards List (Left) + Interactive Pedagogical Solver (Right) */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: List of Activities */}
          <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredActivities.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#12111d] p-8 text-center space-y-3">
                <Target className="size-8 text-zinc-500 mx-auto" />
                <p className="text-sm font-bold text-zinc-400">Nenhuma atividade encontrada com estes filtros.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTabFilter('all')
                    setSelectedModule('all')
                    setSelectedDifficulty('all')
                    setSelectedType('all')
                  }}
                  className="rounded-xl border-white/10 text-xs font-bold"
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isSelected = act.id === currentActivity?.id
                const isDone = completedActivities.includes(act.id)
                const attemptsCount = (activityAttempts[act.id] || []).length

                return (
                  <div
                    key={act.id}
                    onClick={() => handleSelectActivity(act.id)}
                    className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500/50 shadow-lg shadow-violet-950/50'
                        : 'border-white/5 bg-[#12111d] hover:border-violet-500/30 hover:bg-[#161424]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-violet-400 tracking-wider">
                        {act.technology || 'Lógica & Algoritmos'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase font-bold bg-white/5 border border-white/5 text-zinc-400"
                        >
                          {act.difficulty}
                        </Badge>
                        {isDone ? (
                          <CheckCircle2 className="size-3.5 text-emerald-400" />
                        ) : (
                          attemptsCount > 0 && <span className="text-[9px] font-mono text-amber-400">{attemptsCount} tent.</span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1 group-hover:text-violet-300 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 font-medium leading-relaxed">
                      {act.statement}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-500">
                      <span className="truncate max-w-[150px]">{TYPE_LABELS[act.type] || act.type}</span>
                      <span className="font-mono text-violet-400 font-bold">+{act.xpReward} XP</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Column: Interactive Pedagogical Solver */}
          {currentActivity ? (
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-white/10 bg-[#12111d] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-violet-600 text-white text-[10px] font-black border-0">
                        +{currentActivity.xpReward} XP
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-300 font-bold">
                        {TYPE_LABELS[currentActivity.type] || currentActivity.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400 font-bold">
                        {currentActivity.difficulty.toUpperCase()}
                      </Badge>
                      {currentActivity.skillName && (
                        <span className="text-[11px] font-semibold text-zinc-400">
                          🎯 {currentActivity.skillName}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {currentActivity.title}
                    </h2>
                  </div>

                  {isAlreadyDone && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold gap-1">
                      <CheckCircle2 className="size-3.5" /> Concluído
                    </Badge>
                  )}
                </div>

                {/* Enunciado da Questão */}
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    {currentActivity.statement}
                  </p>

                  {/* Contextual Code Block if present */}
                  {currentActivity.codeContext && (
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-violet-200 overflow-x-auto shadow-inner">
                      <pre>{currentActivity.codeContext}</pre>
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {(currentActivity.type === 'multiple_choice' || currentActivity.type === 'true_false') &&
                  currentActivity.options && (
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Selecione a alternativa correta:
                      </label>
                      <div className="space-y-2">
                        {currentActivity.options.map((opt, idx) => {
                          const isPicked = selectedOption === idx
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleOptionClick(idx)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                isPicked
                                  ? 'border-violet-500 bg-violet-950/60 text-white ring-1 ring-violet-400/40 shadow-lg shadow-violet-950/40'
                                  : 'border-white/5 bg-black/30 text-zinc-300 hover:text-white hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`grid size-6 place-items-center rounded-lg text-xs font-bold font-mono ${
                                    isPicked ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isPicked && <Check className="size-4 text-violet-400" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                {/* Code Editor solver for coding challenges */}
                {(currentActivity.type === 'code' ||
                  currentActivity.type === 'write_code' ||
                  currentActivity.type === 'fix_code' ||
                  currentActivity.type === 'find_bug') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Sua Solução de Código:
                      </label>
                      <button
                        type="button"
                        onClick={handleResetCode}
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" /> Restaurar Código Inicial
                      </button>
                    </div>
                    <Textarea
                      rows={8}
                      value={codeAnswer}
                      onChange={(e) => setCodeAnswer(e.target.value)}
                      placeholder="// Digite sua solução de código aqui..."
                      className="font-mono text-xs bg-black/60 border-white/10 rounded-2xl text-violet-200 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Hints and Feedback Drawer */}
                {lastSubmissionResult && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                      lastSubmissionResult.isCorrect
                        ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
                        : 'border-rose-500/30 bg-rose-950/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {lastSubmissionResult.isCorrect ? (
                        <>
                          <CheckCircle2 className="size-4.5 text-emerald-400" />
                          <span>Resposta Correta! +{lastSubmissionResult.xpEarned} XP</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-4.5 text-rose-400" />
                          <span>Resposta Incorreta</span>
                        </>
                      )}
                    </div>
                    <p className="text-zinc-300 font-medium">{lastSubmissionResult.feedback}</p>
                  </div>
                )}

                {/* Pedagogical Hint Progressive System */}
                {showHintLevel > 0 && currentActivity.hints && (
                  <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <Lightbulb className="size-4 text-amber-400" />
                      <span>Dica Pedagógica da IA (Nível {showHintLevel}):</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-medium">
                      {currentActivity.hints[showHintLevel - 1] || currentActivity.hints[0]}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {currentActivity.hints && currentActivity.hints.length > 0 && showHintLevel < currentActivity.hints.length && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHintLevel((l) => l + 1)}
                        className="text-xs font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      >
                        <Lightbulb className="size-3.5 mr-1" /> Pedir Dica ({showHintLevel}/{currentActivity.hints.length})
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-5 rounded-xl shadow-lg shadow-purple-600/30"
                  >
                    <span>Enviar Resposta</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center text-zinc-500">
              Selecione uma atividade à esquerda para começar.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
