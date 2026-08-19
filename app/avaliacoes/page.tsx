'use client'

import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/lib/store'
import { mockAssessments } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Target,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Trophy,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react'

export default function AvaliacoesHubPage() {
  const { allModules, allLessons, completedLessons, moduleProgress, assessments } = useAppStore()

  // Calculate overall stats
  let totalEvaluations = allModules.length
  let approvedCount = 0
  let availableCount = 0
  let lockedCount = 0

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

    if (hasPassed) {
      approvedCount++
    } else if (isUnlocked) {
      availableCount++
    } else {
      lockedCount++
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

  return (
    <AppShell
      title="Central de Avaliações Oficiais"
      subtitle="Banca examinadora com inteligência artificial para certificação e avanço de fase"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Banner de Apresentação e Estatísticas */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-[#141224] via-[#100f1c] to-[#0a0912] p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="space-y-3 lg:col-span-8">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold px-3 py-1 text-xs">
                  <Sparkles className="size-3 mr-1 text-violet-400" /> Nivelamento Pedagógico Oficial
                </Badge>
                <Badge variant="outline" className="text-zinc-400 text-xs">
                  Critério de Corte: 70%
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Avaliações Oficiais de Fim de Módulo
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl font-medium">
                Cada fase da sua formação possui uma prova oficial elaborada pela banca examinadora do <span className="text-violet-300 font-bold">Mentor Dev</span>. Para realizar a avaliação de um módulo, você deve <span className="text-white font-bold">concluir 100% das suas aulas</span>.
              </p>
            </div>

            {/* Mini Cards de Métricas */}
            <div className="grid grid-cols-3 gap-3 lg:col-span-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{approvedCount}</div>
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Aprovadas</div>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-violet-300 font-mono">{availableCount}</div>
                <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider mt-0.5">Disponíveis</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-zinc-500 font-mono">{lockedCount}</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Trancadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Avaliações por Módulo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Target className="size-5 text-violet-400" />
              Provas Oficiais da Sua Trilha de Desenvolvimento
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {allModules.length} módulos na formação
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {modulesWithAssessmentData.map((item) => {
              return (
                <div
                  key={item.module.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between ${
                    item.hasPassed
                      ? 'border-emerald-500/30 bg-gradient-to-b from-[#0f1f17] to-[#0c1410] shadow-lg shadow-emerald-950/20'
                      : item.isUnlocked
                      ? 'border-violet-500/40 bg-gradient-to-b from-[#18142a] to-[#100d1d] shadow-xl shadow-violet-950/40 ring-1 ring-violet-500/20'
                      : 'border-white/5 bg-[#0e0d16]/80 opacity-90 hover:opacity-100 hover:border-white/10'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold uppercase tracking-wider border-white/10 text-zinc-400"
                      >
                        Fase {item.phaseIndex} • {item.module.phase.toUpperCase()}
                      </Badge>

                      {item.hasPassed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1.5 px-3 py-1">
                          <CheckCircle2 className="size-3.5" /> Aprovado ({item.score}%)
                        </Badge>
                      ) : item.isUnlocked ? (
                        <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold text-xs gap-1.5 px-3 py-1 animate-pulse">
                          <Unlock className="size-3.5" /> Liberada para Prova
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs gap-1.5 px-3 py-1">
                          <Lock className="size-3.5 text-zinc-500" /> Trancada
                        </Badge>
                      )}
                    </div>

                    {/* Module Title & Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                        {item.module.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-medium">
                        {item.module.description}
                      </p>
                    </div>

                    {/* Progress Bar of Course Lessons */}
                    <div className="space-y-2 rounded-xl border border-white/5 bg-black/30 p-3.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-300 flex items-center gap-1.5">
                          <BookOpen className="size-3.5 text-zinc-400" />
                          Aulas Concluídas:
                        </span>
                        <span className="font-mono text-violet-300">
                          {item.completedCount} / {item.totalCount} ({item.progressPercent}%)
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

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                        <span>Tempo: ~{item.meta.timeLimitMin} min</span>
                        <span>Mínimo: {item.meta.minScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="pt-5 mt-2 border-t border-white/5 flex items-center justify-between gap-3">
                    {item.hasPassed ? (
                      <>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                          <Trophy className="size-4" /> Certificado liberado
                        </span>
                        <Link href={`/avaliacoes/${item.module.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            <RotateCcw className="size-3.5" /> Revisar Prova
                          </Button>
                        </Link>
                      </>
                    ) : item.isUnlocked ? (
                      <>
                        <span className="text-xs text-violet-300 font-bold flex items-center gap-1.5">
                          <Sparkles className="size-4 text-violet-400" /> Prova pronta
                        </span>
                        <Link href={`/avaliacoes/${item.module.id}`}>
                          <Button
                            size="sm"
                            className="font-bold text-xs gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30 cursor-pointer"
                          >
                            Iniciar Avaliação <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 text-amber-400/80" />
                          Faltam {item.totalCount - item.completedCount} aula(s)
                        </span>
                        <Link href={`/aulas/${item.nextPendingLesson?.id || item.lessons[0]?.id || 'l-logica-1'}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs gap-1.5 border-white/10 text-zinc-300 hover:text-white hover:border-violet-500/40 cursor-pointer"
                          >
                            <Play className="size-3 text-violet-400" /> Assistir Aulas
                          </Button>
                        </Link>
                      </>
                    )}
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
