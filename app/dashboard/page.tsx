'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
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
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function DashboardPage() {
  const {
    profile,
    activePath,
    allCourses,
    allModules,
    allLessons,
    moduleProgress,
    moduleStatus,
    getModuleMastery,
    dailyStudyPlan,
    overallProgress,
    xp,
    level,
    streak,
    studiedMinutes,
    todayStudiedMinutes,
    weeklyStudyRecords,
    currentModuleId,
    nextPendingLessonId,
    difficulties,
    spacedReviews,
    completedLessons,
    completedExercises,
    projects,
    isSuperAdmin,
  } = useAppStore()

  const [greeting, setGreeting] = useState('Olá')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('Bom dia')
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde')
    else setGreeting('Boa noite')
  }, [])

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

  // Calculate next locked step in trail
  const lockedModules = allModules.filter((m) => moduleStatus(m.id) === 'locked')
  const nextLockedModule = lockedModules[0]

  // Calculate phase progression
  const phases = [
    { id: 'fundamentos', name: 'Nível 01 — Fundamentos & Algoritmos', order: 1 },
    { id: 'ferramentas', name: 'Nível 02 — Git & Workflow Dev', order: 2 },
    { id: 'web', name: 'Nível 03 — HTML5, CSS3 & Layouts', order: 3 },
    { id: 'js', name: 'Nível 04 — JavaScript Moderno (ES6+)', order: 4 },
    { id: 'fullstack', name: 'Nível 05 — React, Node & APIs REST', order: 5 },
    { id: 'carreira', name: 'Nível 06 — Projetos de Mercado & Portfólio', order: 6 },
  ]

  const phaseProgress = phases.map((phase) => {
    const phaseMods = allModules.filter((m) => m.phaseOrder === phase.order || m.phase?.toLowerCase().includes(phase.id))
    if (phaseMods.length === 0) return { ...phase, progress: 0, count: 0 }
    const totalLessons = phaseMods.reduce((acc, m) => acc + m.lessonIds.length, 0)
    const completed = phaseMods.reduce((acc, m) => {
      const p = moduleProgress[m.id]
      return acc + (p?.lessonsCompleted || 0)
    }, 0)
    const pct = totalLessons > 0 ? Math.min(100, Math.round((completed / totalLessons) * 100)) : 0
    return { ...phase, progress: pct, count: phaseMods.length }
  })

  // Calculate average assessment score
  const assessedModules = Object.values(moduleProgress).filter(
    (p) => p.assessmentScore !== null && p.assessmentScore !== undefined,
  )
  const averageScore =
    assessedModules.length > 0
      ? Math.round(
          assessedModules.reduce((acc, p) => acc + (p.assessmentScore || 0), 0) / assessedModules.length,
        )
      : null

  const isFirstDay = completedLessons.length === 0
  const dailyTargetMinutes = dailyStudyPlan?.totalMinutes || 45
  const dailyGoalPercent = Math.min(100, Math.round((todayStudiedMinutes / dailyTargetMinutes) * 100))

  // Simulated activity matrix (GitHub contributions heatmap style)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const activityWeeks = [
    [0, 1, 2, 0, 1, 3, 2],
    [1, 2, 1, 2, 3, 1, 0],
    [2, 3, 2, 1, 3, 2, 1],
    [1, 2, 3, streak > 0 ? 3 : 0, streak > 0 ? 2 : 0, 1, 0],
  ]

  return (
    <AppShell title="Dashboard" subtitle="Visão geral da sua evolução diária e jornada na programação">
      <div className="space-y-8 pb-16">
        {/* 1. HERO BANNER: Saudação Dinâmica + Continuar Trilha */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-[#12111d] to-[#0a0910] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-purple-950/25">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold px-3 py-1 text-xs gap-1.5 shadow-sm">
                  <Sparkles className="size-3.5 text-violet-400" />
                  Trilha: {activePath?.title || 'Formação Full Stack JavaScript'}
                </Badge>
                <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-1 text-xs gap-1">
                  <Flame className="size-3.5 fill-amber-400" /> {streak} {streak === 1 ? 'dia de foco' : 'dias de consistência'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {greeting}, {firstName} 👋
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                Seu cronograma de hoje está calibrado para consolidar os fundamentos e avançar rumo à sua carreira dev profissional.
              </p>
            </div>

            {/* Main CTA Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link href={nextLesson ? `/aulas/${nextLesson.id}` : '/cursos'} className="inline-flex">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 text-xs sm:text-sm font-black shadow-xl shadow-purple-600/35 py-6 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-300 hover:scale-105 border border-violet-400/40 cursor-pointer"
                >
                  <Play className="size-4 fill-white" />
                  {isFirstDay ? 'INICIAR PRIMEIRA AULA' : 'CONTINUAR ESTUDANDO'}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* PROGRESSO GLOBAL DA TRILHA */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="size-4 text-violet-400" /> Progresso Global da Trilha
              </span>
              <span className="text-white text-sm font-mono font-black">{overallProgress}% concluído</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
              <div
                style={{ width: `${Math.max(4, overallProgress)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50 transition-all duration-500"
              />
            </div>
          </div>
        </section>

        {/* 2. CARD "CONTINUAR DE ONDE PAROU" (ELEMENTO DE MÁXIMO DESTAQUE) */}
        {nextLesson && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Zap className="size-4 text-amber-400" /> Continuar de Onde Parou
              </h2>
              <span className="text-xs text-zinc-500 font-semibold">Aula recomendada agora</span>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-violet-500/20 hover:border-violet-500/50 bg-[#12111d] p-5 sm:p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-950/30">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Thumbnail & Video Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="relative aspect-video w-full sm:w-52 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 shadow-md">
                    {nextLesson.thumbnailUrl ? (
                      <Image
                        src={nextLesson.thumbnailUrl}
                        alt={nextLesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-violet-950/30 text-violet-400">
                        <BookOpen className="size-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="grid size-12 place-items-center rounded-full bg-violet-600 text-white shadow-xl shadow-purple-600/50 group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white font-mono">
                      {nextLesson.durationMin || 25} min
                    </span>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                        {activeCourse?.title || 'Formação DevPath'}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-semibold text-zinc-400">
                        {currentModule?.title || 'Módulo Atual'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                      Aula {nextLesson.order.toString().padStart(2, '0')} — {nextLesson.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {nextLesson.description || 'Assista a esta aula fundamental e realize os exercícios práticos para fixar o conceito.'}
                    </p>

                    {/* Progress bar in continue card */}
                    <div className="pt-2 flex items-center gap-3">
                      <div className="h-2 w-36 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{
                            width: `${
                              currentModProgress?.lessonsCompleted
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (currentModProgress.lessonsCompleted / (currentModule?.lessonIds.length || 1)) *
                                        100
                                    )
                                  )
                                : 0
                            }%`,
                          }}
                          className="h-full bg-violet-500 rounded-full"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-semibold">
                        {nextLesson.durationMin || 20} min restantes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Continue Action */}
                <div className="shrink-0 w-full sm:w-auto">
                  <Link href={`/aulas/${nextLesson.id}`}>
                    <Button className="w-full sm:w-auto gap-2 font-bold px-7 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/30">
                      <Play className="size-4 fill-white" /> CONTINUAR AULA
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. MINHA TRILHA (FASES) & PRÓXIMA ETAPA */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Minha Trilha Breakdown (2 Cols) */}
          <Card className="lg:col-span-2 border-white/5 bg-[#12111d] shadow-xl rounded-3xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="size-4.5 text-violet-400" /> Minha Trilha de Formação
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Evolução sequencial nas etapas do seu desenvolvimento
                  </CardDescription>
                </div>
                <Link href="/trilha">
                  <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 gap-1 font-bold">
                    Ver trilha completa <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="space-y-4">
                {phaseProgress.map((phase) => (
                  <div key={phase.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-200">{phase.name}</span>
                      <span className="text-violet-400 font-mono">{phase.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(0, phase.progress)}%` }}
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DevMentor AI Quick Card & Próxima Etapa (1 Col) */}
          <div className="space-y-6">
            {/* DEVMENTOR AI CARD */}
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#12111d] to-[#12111d] shadow-xl rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-purple-600/30">
                    <Bot className="size-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">DevMentor AI</CardTitle>
                    <CardDescription className="text-[11px] text-violet-300/80">Tutor 24/7 Contextualizado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-300 leading-relaxed font-medium italic">
                  {isFirstDay
                    ? '"Olá! Seu foco agora é dominar lógica e algoritmos para destravar os próximos módulos com máxima confiança."'
                    : `"${firstName}, seu aproveitamento no módulo ${currentModule.title} está consistente. Pergunte-me qualquer dúvida!"`}
                </div>
                <Link href="/mentor" className="block">
                  <Button className="w-full text-xs font-bold bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200">
                    Conversar com o Mentor <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* PRÓXIMA ETAPA */}
            <Card className="border-white/5 bg-[#12111d] shadow-xl rounded-3xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Lock className="size-3.5 text-zinc-500" /> Próximo Desbloqueio
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400">
                    Trilha Sequencial
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-2">
                {nextLockedModule ? (
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white">{nextLockedModule.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Conclua as aulas e exercícios do módulo atual para liberar esta próxima etapa.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold">
                    🎉 Todos os módulos da sua trilha estão desbloqueados!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. ATIVIDADE & HEATMAP ESTILO GITHUB CONTRIBUTIONS */}
        <section className="rounded-3xl border border-white/5 bg-[#12111d] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="size-4.5 text-amber-400" /> Consistência & Histórico de Estudos
              </h2>
              <p className="text-xs text-zinc-400">Frequência semanal de dedicação e atividades concluídas</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Menos</span>
              <span className="size-3 rounded-sm bg-white/5" />
              <span className="size-3 rounded-sm bg-violet-950" />
              <span className="size-3 rounded-sm bg-violet-700" />
              <span className="size-3 rounded-sm bg-violet-500" />
              <span>Mais</span>
            </div>
          </div>

          <div className="pt-2 overflow-x-auto">
            <div className="grid grid-flow-col gap-2 w-max min-w-full">
              {daysOfWeek.map((day, dayIdx) => (
                <div key={day} className="flex flex-col gap-2 items-center">
                  <span className="text-[10px] font-mono text-zinc-500">{day}</span>
                  {activityWeeks.map((week, weekIdx) => {
                    const intensity = week[dayIdx]
                    return (
                      <div
                        key={weekIdx}
                        title={`Nível de atividade: ${intensity}`}
                        className={`size-5 rounded-md transition-colors ${
                          intensity === 3
                            ? 'bg-violet-500 shadow-sm shadow-violet-500/50'
                            : intensity === 2
                            ? 'bg-violet-700'
                            : intensity === 1
                            ? 'bg-violet-950/80 border border-violet-500/30'
                            : 'bg-white/5'
                        }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. DESEMPENHO & MÉTRICAS */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Target className="size-5 text-violet-400" /> Desempenho & Métricas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-white/5 bg-[#12111d] p-5 space-y-2 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Nota Média</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {averageScore !== null ? `${averageScore}%` : '—'}
              </div>
              <p className="text-[10px] text-zinc-500">
                {assessedModules.length > 0 ? `${assessedModules.length} avaliações realizadas` : 'Nenhuma avaliação ainda'}
              </p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-5 space-y-2 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Atividades Feitas</span>
              <div className="text-2xl sm:text-3xl font-black text-violet-400 font-mono">
                {completedExercises.length}
              </div>
              <p className="text-[10px] text-zinc-500">Exercícios práticos validados</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-5 space-y-2 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Aulas Concluídas</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {completedLessons.length}
              </div>
              <p className="text-[10px] text-zinc-500">De {allLessons.length} aulas disponíveis</p>
            </Card>

            <Card className="border-white/5 bg-[#12111d] p-5 space-y-2 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Dias de Foco</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {streak}
              </div>
              <p className="text-[10px] text-zinc-500">Dias seguidos de consistência</p>
            </Card>
          </div>
        </section>

        {/* 6. MEUS PROJETOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="size-5 text-violet-400" /> Meus Projetos de Portfólio
              </h2>
              <p className="text-xs text-zinc-400">Aplicações práticas desenvolvidas nos módulos</p>
            </div>
            <Link href="/projetos">
              <Button size="sm" className="gap-1.5 font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-xl">
                <Plus className="size-3.5" /> Novo Projeto
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-white/5 bg-[#12111d] hover:border-violet-500/30 p-5 space-y-3 transition-colors shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-white/5">
                      {proj.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(proj.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center space-y-2">
                <Code2 className="size-8 mx-auto text-zinc-600" />
                <p className="text-xs font-bold text-zinc-300">Você ainda não submeteu projetos práticos.</p>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Ao concluir os módulos obrigatórios, os desafios de projetos reais de portfólio estarão disponíveis.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
