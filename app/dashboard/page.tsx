'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  FolderGit2,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  Play,
  PlayCircle,
  Plus,
  Repeat,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

export default function DashboardPage() {
  const {
    profile,
    activePath,
    allCourses,
    allModules,
    allLessons,
    moduleProgress,
    moduleStatus,
    isModuleUnlocked,
    getModuleMastery,
    overallProgress,
    xp,
    level,
    streak,
    studiedMinutes,
    currentModuleId,
    nextPendingLessonId,
    completedLessons,
    completedExercises,
    activities,
    projects,
    certificates,
  } = useAppStore()

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Desenvolvedor'

  // Current active module and lesson
  const currentModule = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentModProgress = currentModule ? moduleProgress[currentModule.id] : null
  const currentMastery = currentModule
    ? getModuleMastery(currentModule.id)
    : { totalMastery: 0, lessonsScore: 0, exercisesScore: 0, projectScore: 0, assessmentScore: 0, isUnlocked: false }

  const nextLesson = allLessons.find((l) => l.id === nextPendingLessonId) || allLessons[0]
  const activeCourse = currentModule
    ? allCourses.find((c) => c.id === currentModule.courseId || c.category === currentModule.phase) || allCourses[0]
    : allCourses[0]

  // Next activities for the active module
  const moduleActivities = activities
    .filter((a) => a.moduleId === currentModule?.id && !completedExercises.includes(a.id))
    .slice(0, 3)

  // Dynamic Journey Phases derived directly from real store modules
  const journeyPhases = allModules.map((mod, idx) => {
    const rawStatus = moduleStatus(mod.id)
    const isUnlocked = isModuleUnlocked(mod.id)

    let status: 'completed' | 'in_progress' | 'locked' = 'locked'
    let badge = 'Bloqueado'

    if (rawStatus === 'completed') {
      status = 'completed'
      badge = 'Concluído'
    } else if (rawStatus === 'in-progress' || (isUnlocked && (idx === 0 || mod.id === currentModuleId || rawStatus === 'available'))) {
      status = 'in_progress'
      badge = 'AGORA'
    } else {
      status = 'locked'
      badge = 'Bloqueado'
    }

    const pendingLessonId =
      mod.lessonIds.find((id) => !completedLessons.includes(id)) ||
      mod.lessonIds[0] ||
      'l-logica-1'

    return {
      phaseNumber: idx + 1,
      moduleId: mod.id,
      title: mod.title,
      subtitle: mod.description,
      items: `• ${mod.lessonIds.length} Aulas com Vídeo • Prática • Avaliação`,
      status,
      badge,
      targetLessonId: pendingLessonId,
    }
  })

  // Complementary AI Recommendations (Strictly separate from official curriculum)
  const complementaryRecommendations = [
    {
      title: 'Artigo Prático: Entendendo o Event Loop do JavaScript a Fundo',
      source: 'DevPath Tech Insights',
      type: 'Leitura Técnica',
      duration: '8 min',
      link: '/mentor',
    },
    {
      title: 'Desafio Rápido de Algoritmos: Inversão de Arrays e Recursão',
      source: 'Code Lab Sandbox',
      type: 'Laboratório de Código',
      duration: '15 min',
      link: '/code-lab',
    },
  ]

  const totalModuleLessons = currentModule?.lessonIds.length || 1
  const completedModuleLessons = currentModProgress?.lessonsCompleted || 0
  const currentLessonPercent = Math.min(100, Math.round((completedModuleLessons / totalModuleLessons) * 100))
  const studiedHours = Math.round((studiedMinutes || 180) / 60)

  return (
    <AppShell title="Dashboard" subtitle="Painel educacional de acompanhamento da sua formação">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        {/* =========================================================================
            1. HERO: SAUDAÇÃO & VISÃO DA JORNADA
           ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#12111d] p-6 sm:p-8 lg:p-10 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold px-3 py-0.5 text-xs">
                  Objetivo: {profile?.desiredRole || 'Desenvolvedor Full Stack'}
                </Badge>
                <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-0.5 text-xs gap-1">
                  <Flame className="size-3.5 fill-amber-400" /> {streak} {streak === 1 ? 'dia' : 'dias'} de consistência
                </Badge>
                <Badge variant="secondary" className="text-xs font-mono font-bold bg-white/5 text-zinc-300">
                  Nível {level} • {xp.toLocaleString('pt-BR')} XP
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Olá, {firstName}.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
                Vamos continuar sua jornada. Você está no módulo <strong className="text-white">{currentModule?.title}</strong> com {overallProgress}% de conclusão global da sua formação.
              </p>
            </div>

            <div className="shrink-0">
              <Link href={nextLesson ? `/aulas/${nextLesson.id}` : '/trilha'}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 py-6 px-8 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                >
                  <Play className="size-4 fill-white" />
                  Continuar estudando
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. BLOCO PRINCIPAL: CONTINUAR APRENDENDO (ELEMENTO MAIS IMPORTANTE)
           ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <PlayCircle className="size-4 text-violet-400" /> Continuar Aprendendo
            </h2>
            <span className="text-xs text-zinc-500">Ação principal recomendada</span>
          </div>

          <div className="group rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-[#141322] to-[#12111d] p-6 sm:p-7 transition-all duration-300 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              {/* Info da Aula e Módulo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                <div className="relative aspect-video w-full sm:w-48 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 shadow-md">
                  {nextLesson.thumbnailUrl ? (
                    <Image
                      src={nextLesson.thumbnailUrl}
                      alt={nextLesson.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-violet-950/40 text-violet-400">
                      <BookOpen className="size-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="grid size-11 place-items-center rounded-full bg-violet-600 text-white shadow-xl">
                      <Play className="size-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white font-mono">
                    {nextLesson.durationMin || 20} min
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-violet-400">{activeCourse?.title || 'Formação Oficial'}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{currentModule?.title}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    Aula {nextLesson.order.toString().padStart(2, '0')}: {nextLesson.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {nextLesson.description || 'Assista a esta aula fundamental e resolva as atividades práticas vinculadas.'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <div className="h-2 w-36 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${currentLessonPercent}%` }}
                        className="h-full bg-violet-500 rounded-full"
                      />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-semibold font-mono">
                      {completedModuleLessons}/{totalModuleLessons} aulas ({currentLessonPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Focal */}
              <div className="shrink-0 w-full sm:w-auto">
                <Link href={`/aulas/${nextLesson.id}`}>
                  <Button className="w-full sm:w-auto gap-2 font-bold px-8 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30">
                    <Play className="size-4 fill-white" /> Continuar aula
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. MINHA JORNADA GAMIFICADA (ROADMAP VISUAL DE FASES)
           ========================================================================= */}
        <section className="rounded-3xl border border-white/5 bg-[#12111d] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="size-4.5 text-violet-400" /> Minha Jornada de Formação
              </h2>
              <p className="text-xs text-zinc-400">Trilha sequencial gamificada em 9 fases com desbloqueio contínuo</p>
            </div>
            <Link href="/trilha">
              <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 font-bold gap-1">
                Ver mapa completo <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {journeyPhases.map((phase) => {
              const isDone = phase.status === 'completed'
              const isCurrent = phase.status === 'in_progress'
              const isLocked = phase.status === 'locked'

              return (
                <div
                  key={phase.phaseNumber}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'border-violet-500 bg-gradient-to-br from-violet-950/60 to-[#18152c] ring-2 ring-violet-500/50 shadow-xl'
                      : isDone
                      ? 'border-emerald-500/30 bg-[#12111d] hover:border-emerald-500/50'
                      : 'border-white/5 bg-black/30 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black font-mono text-zinc-400 uppercase">
                        FASE {phase.phaseNumber}
                      </span>
                      <Badge
                        className={`text-[9px] font-bold ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isCurrent
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-zinc-500 border-white/5'
                        }`}
                      >
                        {phase.badge}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-11 place-items-center rounded-2xl text-xs font-black shadow-md ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isCurrent
                            ? 'bg-violet-600 text-white shadow-violet-600/40 animate-pulse'
                            : 'bg-white/5 text-zinc-500'
                        }`}
                      >
                        {isDone ? <Check className="size-5 stroke-[3]" /> : isCurrent ? <Play className="size-4 fill-white" /> : <Lock className="size-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{phase.title}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{phase.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-medium">{phase.items}</span>
                    {!isLocked && (
                      <Link href={`/aulas/${phase.targetLessonId}`} className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5">
                        {isDone ? 'Revisar' : 'Acessar'} <ChevronRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* =========================================================================
            4. PROGRESSO DO ALUNO (MÉTRICAS CONSOLIDADAS)
           ========================================================================= */}
        <section className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Target className="size-4 text-violet-400" /> Progresso Consolidado do Aluno
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="border-white/5 bg-[#12111d] p-4 space-y-1 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Cursos</span>
              <p className="text-xl font-black text-white font-mono">{allCourses.length > 0 ? `1 / ${allCourses.length}` : '—'}</p>
              <p className="text-[10px] text-zinc-500">Em andamento</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-4 space-y-1 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Módulos</span>
              <p className="text-xl font-black text-white font-mono">
                {Object.values(moduleProgress).filter((m) => m.status === 'completed').length} / {allModules.length}
              </p>
              <p className="text-[10px] text-zinc-500">Concluídos</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-4 space-y-1 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Aulas</span>
              <p className="text-xl font-black text-emerald-400 font-mono">
                {completedLessons.length} / {allLessons.length}
              </p>
              <p className="text-[10px] text-zinc-500">Assistidas</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-4 space-y-1 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Atividades</span>
              <p className="text-xl font-black text-cyan-400 font-mono">
                {completedExercises.length} / {activities.length}
              </p>
              <p className="text-[10px] text-zinc-500">Validadas</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-4 space-y-1 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Horas de Estudo</span>
              <p className="text-xl font-black text-violet-400 font-mono">{studiedHours}h</p>
              <p className="text-[10px] text-zinc-500">Dedicadas</p>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            5. PRÓXIMAS ATIVIDADES & RECOMENDADO PARA VOCÊ (IA)
           ========================================================================= */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Próximas Atividades */}
          <div className="rounded-3xl border border-white/5 bg-[#12111d] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" /> Próximas Atividades do Módulo
              </h3>
              <Link href="/exercicios" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                Ver todas &rarr;
              </Link>
            </div>

            {moduleActivities.length > 0 ? (
              <div className="space-y-2.5">
                {moduleActivities.map((act) => (
                  <Link
                    key={act.id}
                    href="/exercicios"
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/40 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{act.title}</p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{act.statement}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase border-white/10 text-zinc-400">
                        {act.difficulty}
                      </Badge>
                      <span className="text-xs font-mono text-violet-400 font-bold">+{act.xpReward} XP</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">Todas as atividades deste módulo foram concluídas!</p>
            )}
          </div>

          {/* Recomendado para Você (IA) — Separado da Trilha Oficial */}
          <div className="rounded-3xl border border-white/5 bg-[#12111d] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="size-4 text-violet-400" /> Recomendado para Você (IA)
              </h3>
              <Badge className="bg-violet-950 text-violet-300 border-violet-500/30 text-[10px]">
                Conteúdo Complementar
              </Badge>
            </div>

            <div className="space-y-2.5">
              {complementaryRecommendations.map((rec, i) => (
                <Link
                  key={i}
                  href={rec.link}
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/40 hover:border-violet-500/30 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="text-xs font-bold text-white truncate">{rec.title}</p>
                    <p className="text-[11px] text-zinc-400">{rec.source} • {rec.duration}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] bg-white/5 text-zinc-400 shrink-0">
                    {rec.type}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
