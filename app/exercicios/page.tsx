'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Filter,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  BookOpen,
  ChevronRight,
  Flame,
  Check,
  AlertCircle,
  RefreshCw,
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
      subtitle="Exercícios práticos, desafios de código e fixação profunda vinculados a cada aula"
    >
      <div className="space-y-8 pb-16">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-[#141226] via-[#100f1c] to-[#0d0c17] p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
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
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12111a] border border-white/10 w-fit">
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
                className={`text-xs font-bold rounded-xl px-4 transition-all ${
                  tabFilter === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Module, Difficulty & Type Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111a] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todos os Módulos</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111a] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todas Dificuldades</option>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#12111a] border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-violet-500"
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
              <div className="rounded-2xl border border-white/10 bg-[#12111a] p-8 text-center space-y-3">
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
                        ? 'border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/50 shadow-lg shadow-violet-950/50'
                        : 'border-white/5 bg-[#12111a] hover:border-violet-500/30 hover:bg-[#151422]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-violet-400 tracking-wider">
                        {act.technology || 'Lógica'}
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
              <Card className="border-white/10 bg-[#12111a] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
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
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {currentActivity.title}
                    </h3>
                  </div>

                  {isAlreadyDone && (
                    <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs gap-1.5 py-1 px-3">
                      <CheckCircle2 className="size-4" /> Concluída
                    </Badge>
                  )}
                </div>

                {/* Origin Lesson Reference */}
                {relatedLesson && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-violet-400" />
                      <span>
                        Aula Relacionada: <strong className="text-zinc-200">{relatedLesson.title}</strong>
                      </span>
                    </div>
                    <Link
                      href={`/aulas/${relatedLesson.id}`}
                      className="text-violet-400 hover:text-violet-300 font-bold inline-flex items-center gap-1"
                    >
                      Ver Aula <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                )}

                {/* Pedagogical Statement & Objective */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#161424] border border-violet-500/20 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    <h5 className="text-[11px] font-extrabold uppercase text-violet-400 tracking-wider mb-1">
                      Enunciado da Atividade
                    </h5>
                    {currentActivity.statement}
                  </div>

                  {currentActivity.objective && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Target className="size-3.5 text-violet-400 flex-shrink-0" />
                      <strong>Objetivo de Aprendizagem:</strong> {currentActivity.objective}
                    </p>
                  )}
                </div>

                {/* Solver Interface based on Type */}
                {currentActivity.type === 'multiple_choice' || currentActivity.type === 'true_false' ? (
                  /* Multiple Choice / True False Options */
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                      Selecione a alternativa correta:
                    </h5>
                    <div className="space-y-2.5">
                      {(currentActivity.options || []).map((opt, idx) => {
                        const isSelected = selectedOption === idx
                        return (
                          <div
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500 shadow-md text-white'
                                : 'border-white/5 bg-black/30 hover:border-white/20 text-zinc-300'
                            }`}
                          >
                            <div
                              className={`size-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-600 text-white'
                                  : 'border-white/20 bg-white/5 text-zinc-400'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Code Practice / Bug Fix / Mini Challenge Editor */
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Code2 className="size-3.5 text-violet-400" /> Editor de Código da Atividade
                      </h5>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetCode}
                        className="text-[11px] font-bold text-zinc-400 hover:text-white rounded-lg h-7 gap-1"
                      >
                        <RotateCcw className="size-3" /> Restaurar Inicial
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/70 p-1">
                      <Textarea
                        value={codeAnswer || currentActivity.codeStarter || ''}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        placeholder="// Escreva sua solução em código aqui..."
                        className="font-mono text-xs sm:text-sm text-emerald-300 min-h-[220px] bg-transparent border-0 focus-visible:ring-0 resize-y p-3"
                      />
                    </div>
                  </div>
                )}

                {/* Progressive Hints & Feedback Section */}
                {showHintLevel >= 1 && currentActivity.hint && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Lightbulb className="size-4" /> Dica Pedagógica (Tentativa 1)
                    </div>
                    <p className="leading-relaxed font-medium">{currentActivity.hint}</p>
                  </div>
                )}

                {showHintLevel >= 2 && currentActivity.detailedGuidance && (
                  <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/30 text-violet-200 text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-violet-400">
                      <Sparkles className="size-4" /> Orientação Guiada (Tentativa 2+)
                    </div>
                    <p className="leading-relaxed font-medium">{currentActivity.detailedGuidance}</p>
                  </div>
                )}

                {lastSubmissionResult && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                      lastSubmissionResult.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {lastSubmissionResult.isCorrect ? (
                        <>
                          <CheckCircle2 className="size-4 text-emerald-400" /> Resposta Correta!
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-4 text-rose-400" /> Tente Novamente
                        </>
                      )}
                    </div>
                    <p className="font-medium">{lastSubmissionResult.feedback}</p>
                    {lastSubmissionResult.isCorrect && currentActivity.explanation && (
                      <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-300">
                        <strong>Explicação Conceitual:</strong> {currentActivity.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHintLevel((lvl) => (lvl >= 2 ? 0 : lvl + 1))}
                      className="rounded-xl border-white/10 text-xs font-bold gap-1.5 text-zinc-300 hover:text-white"
                    >
                      <Lightbulb className="size-3.5 text-amber-400" />
                      {showHintLevel === 0 ? 'Ver Dica' : showHintLevel === 1 ? 'Ver Guia Avançado' : 'Ocultar Dicas'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isGenerating}
                      onClick={handleGenerateMoreActivities}
                      className="rounded-xl text-xs font-bold text-violet-400 hover:text-violet-300 hover:bg-violet-950/40 gap-1.5"
                    >
                      <RefreshCw className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      Gerar Mais com IA
                    </Button>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs px-6 py-5 shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                  >
                    <Play className="size-4 fill-white" /> Enviar Resposta
                  </Button>
                </div>

                {/* Attempts History */}
                {currentAttempts.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <h6 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                      Histórico de Tentativas nesta Atividade ({currentAttempts.length})
                    </h6>
                    <div className="space-y-1.5">
                      {currentAttempts.map((att, i) => (
                        <div
                          key={att.id || i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            {att.isCorrect ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="size-3.5 text-rose-400" />
                            )}
                            <span className="font-bold text-zinc-300">Tentativa {att.attemptNumber}</span>
                            <span className="text-zinc-500 font-medium truncate max-w-[300px]">
                              {typeof att.answer === 'number' ? `Opção ${String.fromCharCode(65 + att.answer)}` : att.answer}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {new Date(att.submittedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}
