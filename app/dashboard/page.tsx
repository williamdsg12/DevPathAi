'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    { id: 'fundamentos', name: 'Fundamentos', order: 1 },
    { id: 'web', name: 'Desenvolvimento Web', order: 2 },
    { id: 'js', name: 'JavaScript & Lógica Avançada', order: 3 },
    { id: 'frontend', name: 'Front-end Moderno', order: 4 },
    { id: 'backend', name: 'Back-end & Banco de Dados', order: 5 },
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

  return (
    <AppShell title="Dashboard" subtitle="Visão geral da sua evolução diária e jornada na programação">
      <div className="space-y-8 pb-12">
        {/* 1. HERO BANNER: Olá, {Nome} + CTA CONTINUAR ESTUDANDO */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-[#12111a] to-[#0d0c14] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-purple-950/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 font-bold px-3 py-1 text-xs gap-1.5 shadow-sm">
                  <Sparkles className="size-3.5 text-violet-400" />
                  Trilha: {activePath?.title || 'Formação Full Stack'}
                </Badge>
                <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-1 text-xs gap-1">
                  <Flame className="size-3.5 fill-amber-400" /> {streak} {streak === 1 ? 'dia de foco' : 'dias de consistência'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Olá, {firstName} 👋
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
                Continue sua jornada para se tornar um desenvolvedor profissional de alto nível.
              </p>
            </div>

            {/* Main CTA Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href={nextLesson ? `/aulas/${nextLesson.id}` : '/cursos'}
                className="inline-flex"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 text-sm sm:text-base font-black shadow-xl shadow-purple-600/30 py-6 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-300 hover:scale-[1.03] border border-violet-400/30"
                >
                  <Play className="size-4.5 fill-white" />
                  {isFirstDay ? 'INICIAR PRIMEIRA AULA' : 'CONTINUAR ESTUDANDO'}
                  <ArrowRight className="size-4.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* PROGRESSO GLOBAL DA TRILHA */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="size-4 text-violet-400" /> Progresso da Trilha
              </span>
              <span className="text-white text-sm font-black">{overallProgress}% concluído</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
              <div
                style={{ width: `${Math.max(3, overallProgress)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50 transition-all duration-500"
              />
            </div>
          </div>
        </section>

        {/* 2. CARD "CONTINUAR DE ONDE PAROU" (ELEMENTO DE DESTAQUE) */}
        {nextLesson && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Zap className="size-4 text-amber-400" /> Continuar de Onde Parou
              </h2>
              <span className="text-xs text-zinc-500 font-semibold">Aula recomendada agora</span>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#12111a] hover:border-violet-500/40 p-5 sm:p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-950/30">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Thumbnail & Video Info */}
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
                      <div className="grid size-full place-items-center bg-violet-950/30 text-violet-400">
                        <BookOpen className="size-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="grid size-10 place-items-center rounded-full bg-violet-600 text-white shadow-lg">
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

                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {nextLesson.description || 'Assista a esta aula fundamental para avançar no domínio técnico.'}
                    </p>

                    {/* Progress bar in continue card */}
                    <div className="pt-2 flex items-center gap-3">
                      <div className="h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${currentModProgress?.lessonsCompleted ? Math.min(100, Math.round((currentModProgress.lessonsCompleted / (currentModule?.lessonIds.length || 1)) * 100)) : 0}%` }}
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
                    <Button className="w-full sm:w-auto gap-2 font-bold px-6 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-purple-600/25">
                      <Play className="size-4 fill-white" /> CONTINUAR AULA
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. MINHA TRILHA & PRÓXIMA ETAPA (2 COLUNAS) */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Minha Trilha Breakdown (2 Cols) */}
          <Card className="lg:col-span-2 border-white/5 bg-[#12111a] shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="size-4.5 text-violet-400" /> Minha Trilha de Formação
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Evolução sequencial nas fases do seu desenvolvimento
                  </CardDescription>
                </div>
                <Link href="/trilha">
                  <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 gap-1">
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

          {/* Próxima Etapa & DevMentor AI (1 Col) */}
          <div className="space-y-6">
            {/* PRÓXIMA ETAPA */}
            <Card className="border-white/5 bg-[#12111a] shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    {isSuperAdmin ? (
                      <>
                        <Sparkles className="size-3.5 text-violet-400" /> Acesso Administrador
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5 text-zinc-500" /> Próxima Etapa
                      </>
                    )}
                  </CardTitle>
                  {isSuperAdmin && (
                    <Badge className="bg-violet-950/80 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
                      Acesso Livre
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {isSuperAdmin ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-violet-600/20 text-violet-400 text-xs">
                        👑
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Navegação Irrestrita</h4>
                        <p className="text-[11px] text-zinc-400">Você pode pular e inspecionar qualquer módulo ou curso.</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                      {allModules.slice(0, 5).map((m) => (
                        <Link
                          key={m.id}
                          href={m.lessonIds.length > 0 ? `/aulas/${m.lessonIds[0]}` : '/trilha'}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-violet-600/15 border border-white/5 hover:border-violet-500/30 text-xs text-zinc-300 transition-colors"
                        >
                          <span className="truncate font-semibold text-[11px]">{m.title}</span>
                          <ArrowRight className="size-3 text-violet-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : nextLockedModule ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-white/5 text-zinc-400 text-xs">
                        🔒
                      </span>
                      <h4 className="text-sm font-bold text-white">{nextLockedModule.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Conclua o módulo atual ({currentModule?.title}) com aproveitamento para desbloquear esta próxima etapa.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold">
                    🎉 Parabéns! Todos os módulos essenciais do catálogo foram desbloqueados.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* DEVPATH AI MENTOR CARD */}
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-[#12111a] to-[#12111a] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-purple-600/30">
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">DevPath AI Mentor</CardTitle>
                    <CardDescription className="text-[11px] text-violet-300/80">Seu mentor de estudos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 leading-relaxed italic">
                  {isFirstDay
                    ? '"Seja bem-vindo ao DevPath AI! Seu foco inicial deve ser dominar lógica e fundamentos para criar uma base sólida."'
                    : `"${firstName}, você está evoluindo de forma consistente. Lembre-se de praticar os exercícios do módulo para consolidar a fixação!"`}
                </div>
                <Link href="/mentor" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold border-white/10 hover:border-violet-500/50 hover:bg-violet-950/30 text-white">
                    Conversar com o Mentor <ArrowRight className="size-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. MEUS PROJETOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="size-5 text-violet-400" /> Meus Projetos
              </h2>
              <p className="text-xs text-zinc-400">Construa seu portfólio prático enquanto aprende</p>
            </div>
            <Link href="/projetos">
              <Button size="sm" className="gap-1.5 font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white">
                <Plus className="size-3.5" /> Novo Projeto
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-white/5 bg-[#12111a] hover:border-violet-500/30 p-4 space-y-3 transition-colors shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {proj.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(proj.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{proj.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center space-y-2">
                <Code2 className="size-8 mx-auto text-zinc-600" />
                <p className="text-xs font-bold text-zinc-300">Você ainda não submeteu projetos práticos.</p>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Conforme você avançar nos módulos, os projetos de portfólio estarão disponíveis para envio de repositório e deploy.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. DESEMPENHO & ESTATÍSTICAS REAIS */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Target className="size-5 text-violet-400" /> Desempenho & Métricas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-white/5 bg-[#12111a] p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Nota Média</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {averageScore !== null ? `${averageScore}%` : '—'}
              </div>
              <p className="text-[10px] text-zinc-500">
                {assessedModules.length > 0 ? `${assessedModules.length} avaliações realizadas` : 'Nenhuma avaliação ainda'}
              </p>
            </Card>

            <Card className="border-white/5 bg-[#12111a] p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Atividades Feitas</span>
              <div className="text-2xl sm:text-3xl font-black text-violet-400">
                {completedExercises.length}
              </div>
              <p className="text-[10px] text-zinc-500">Exercícios práticos validados</p>
            </Card>

            <Card className="border-white/5 bg-[#12111a] p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Aulas Concluídas</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {completedLessons.length}
              </div>
              <p className="text-[10px] text-zinc-500">De {allLessons.length} aulas disponíveis</p>
            </Card>

            <Card className="border-white/5 bg-[#12111a] p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Dias Estudando</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {streak}
              </div>
              <p className="text-[10px] text-zinc-500">Dias seguidos de consistência</p>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
