'use client'

import React from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { mockAssessments } from '@/lib/mock-data'

export default function AvaliacoesJourneyPage() {
  const { allModules, allLessons, completedLessons, moduleProgress, assessments } = useAppStore()

  const modulesWithAssessmentData = allModules.map((mod, index) => {
    const modLessons = allLessons
      .filter((l) => l.moduleId === mod.id || mod.lessonIds.includes(l.id))
      .sort((a, b) => a.order - b.order)

    const completedModLessons = modLessons.filter((l) => completedLessons.includes(l.id))
    const totalModLessons = modLessons.length || mod.lessonIds.length || 1
    const progressPercent = Math.min(100, Math.round((completedModLessons.length / totalModLessons) * 100))
    const isUnlocked = totalModLessons > 0 && completedModLessons.length >= totalModLessons

    const progress = moduleProgress[mod.id]
    const hasPassed = (progress?.assessmentScore || 0) >= (assessments[mod.id]?.minScore || 70)
    const nextPendingLesson = modLessons.find((l) => !completedLessons.includes(l.id)) || modLessons[0]

    const assessmentMeta = assessments[mod.id] || mockAssessments.find((a) => a.moduleId === mod.id) || {
      minScore: 70,
      timeLimitMin: 20,
      questions: [],
    }

    return {
      module: mod,
      phaseIndex: index + 1,
      lessons: modLessons,
      completedCount: completedModLessons.length,
      totalCount: totalModLessons,
      progressPercent,
      isUnlocked,
      hasPassed,
      score: progress?.assessmentScore || null,
      nextPendingLesson,
      meta: assessmentMeta,
    }
  })

  const totalApproved = modulesWithAssessmentData.filter((m) => m.hasPassed).length
  const activeAvailable = modulesWithAssessmentData.find((m) => m.isUnlocked && !m.hasPassed)

  return (
    <AppShell
      title="Avaliações Oficiais da Trilha"
      subtitle="Banca examinadora com inteligência artificial para certificação e avanço de fase"
    >
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        {/* =========================================================================
            1. BANNER HERO NO MESMO ESTILO DA JORNADA
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-r from-violet-950/60 via-[#12111d] to-[#0a0910] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold px-3 py-0.5 text-xs gap-1.5 shadow-sm">
                  <Sparkles className="size-3 text-violet-400" />
                  Certificação & Nivelamento Oficial
                </Badge>
                <span className="text-xs text-zinc-400 font-medium">
                  Nota mínima: 70% de acertos
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Avaliações de Fim de Fase
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                Conclua 100% das aulas de cada fase para desbloquear a prova oficial. A aprovação gera o certificado com validação pública.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {activeAvailable ? (
                <Link href={`/avaliacoes/${activeAvailable.module.id}`}>
                  <Button className="gap-2 font-black text-xs sm:text-sm px-7 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-purple-600/30 border border-violet-400/30 cursor-pointer">
                    <Target className="size-4" /> Iniciar Prova Atual
                  </Button>
                </Link>
              ) : (
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Aprovações</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {totalApproved} de {modulesWithAssessmentData.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. SEQUÊNCIA DE FASES FORMATO JORNADA
           ========================================================================= */}
        <div className="rounded-3xl border border-white/5 bg-[#0e0d16] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="size-5 text-violet-400" />
              Provas Sequenciais da Formação
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {totalApproved} de {modulesWithAssessmentData.length} fases aprovadas
            </span>
          </div>

          <div className="space-y-4">
            {modulesWithAssessmentData.map((item, idx) => {
              const isFirst = idx === 0

              return (
                <div
                  key={item.module.id}
                  className={`rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
                    item.hasPassed
                      ? 'border-emerald-500/30 bg-gradient-to-r from-[#0d1a13] to-[#0a120e] shadow-lg shadow-emerald-950/20'
                      : item.isUnlocked
                      ? 'border-violet-500/50 bg-gradient-to-r from-[#17132a] to-[#0f0c1c] shadow-xl shadow-violet-950/40 ring-1 ring-violet-500/30'
                      : 'border-white/5 bg-[#12111d]/60 opacity-80 hover:opacity-100 hover:border-white/10'
                  }`}
                >
                  {/* Phase Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-2xl grid place-items-center text-sm font-black shrink-0 ${
                          item.hasPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.isUnlocked
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                            : 'bg-white/5 text-zinc-500 border border-white/5'
                        }`}
                      >
                        {item.hasPassed ? <CheckCircle2 className="size-5" /> : `0${item.phaseIndex}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                            FASE {item.phaseIndex}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {item.module.technology || 'Programação'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {item.module.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.hasPassed ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs gap-1.5 px-3 py-1">
                          <CheckCircle2 className="size-3.5" /> Aprovado ({item.score}%)
                        </Badge>
                      ) : item.isUnlocked ? (
                        <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold text-xs gap-1.5 px-3 py-1 animate-pulse">
                          <Unlock className="size-3.5" /> Prova Liberada
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-xs gap-1.5 px-3 py-1">
                          <Lock className="size-3.5 text-zinc-600" /> Trancada
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <BookOpen className="size-3.5 text-zinc-400" />
                        Aulas Concluídas nesta Fase:
                      </span>
                      <span className="font-mono text-violet-300">
                        {item.completedCount} de {item.totalCount} ({item.progressPercent}%)
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.hasPassed
                            ? 'bg-emerald-500'
                            : item.isUnlocked
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                            : 'bg-zinc-700'
                        }`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer with Action CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                      <span>⏱️ Duração: ~{item.meta.timeLimitMin} min</span>
                      <span>•</span>
                      <span>🎯 Nota de corte: 70%</span>
                    </div>

                    <div>
                      {item.hasPassed ? (
                        <Link href={`/avaliacoes/${item.module.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer rounded-xl"
                          >
                            <RotateCcw className="size-3.5" /> Revisar Resultado da Prova
                          </Button>
                        </Link>
                      ) : item.isUnlocked ? (
                        <Link href={`/avaliacoes/${item.module.id}`}>
                          <Button
                            size="sm"
                            className="font-bold text-xs gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30 cursor-pointer rounded-xl"
                          >
                            <span>Fazer Avaliação Oficial</span>
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/aulas/${item.nextPendingLesson?.id || item.lessons[0]?.id || 'l-logica-1'}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs gap-1.5 border-white/10 text-zinc-300 hover:text-white hover:border-violet-500/40 cursor-pointer rounded-xl"
                          >
                            <Play className="size-3 text-violet-400" /> Continuar Aulas ({item.totalCount - item.completedCount} restantes)
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
