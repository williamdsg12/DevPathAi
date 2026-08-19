'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Play,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Video,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { progressionEngine } from '@/lib/pedagogy/progression-engine'
import type { LessonMissionDetails } from '@/lib/pedagogy/progression-engine'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  const {
    allCourses,
    allModules,
    allLessons,
    activities,
    completedLessons,
    completedActivities,
    getCourseProgressDetails,
    getLessonMissionDetails,
    isLessonUnlocked,
  } = useAppStore()

  const course = allCourses.find((c) => c.slug === slug || c.id === slug)
  const courseModules = useMemo(() => {
    return course ? allModules.filter((m) => m.courseId === course.id || m.phase === course.category) : []
  }, [course, allModules])

  const courseLessons = useMemo(() => {
    return courseModules
      .flatMap((m) => allLessons.filter((l) => m.lessonIds.includes(l.id)))
      .sort((a, b) => a.order - b.order)
  }, [courseModules, allLessons])

  // Real, dynamic course progress details
  const courseProgress = useMemo(() => {
    if (!course) return null
    return getCourseProgressDetails(course.id)
  }, [course, getCourseProgressDetails])

  if (!course || !courseProgress) {
    return (
      <AppShell title="Curso não Encontrado" subtitle="O curso solicitado não está disponível no catálogo">
        <div className="space-y-6">
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 rounded-3xl bg-[#12111a] space-y-4">
            <h3 className="text-lg font-bold text-white">Curso não encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              O curso que você tentou acessar não existe ou foi removido do catálogo.
            </p>
            <Link href="/cursos">
              <Button size="sm" className="font-bold text-xs gap-2 bg-violet-600 hover:bg-violet-500 text-white">
                <ArrowLeft className="size-3.5" /> Voltar ao Catálogo
              </Button>
            </Link>
          </Card>
        </div>
      </AppShell>
    )
  }

  const primaryModule = courseModules[0]
  const assessmentHref = `/avaliacoes/${primaryModule?.id || course.id}`

  // Locate the active index in the sequence
  const activeMissionIndex = useMemo(() => {
    for (let i = 0; i < courseLessons.length; i++) {
      const l = courseLessons[i]
      const isVid = completedLessons.includes(l.id)
      const reqAct = progressionEngine.doesLessonRequireActivity(l, activities)
      const isAct = reqAct
        ? progressionEngine.hasCompletedLessonActivity(l, completedActivities, activities, courseLessons)
        : true
      if (!isVid || !isAct) return i
    }
    return courseLessons.length - 1
  }, [courseLessons, completedLessons, activities, completedActivities])

  return (
    <AppShell title={course.title} subtitle={`Jornada de Formação em ${course.technology} • ${course.category}`}>
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para o Catálogo de Cursos
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 1. HERO HEADER — ESTATÍSTICAS REAIS & CTA PRINCIPAL DA ETAPA ATIVA        */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111a] to-[#0d0c14] p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-600 text-white font-extrabold text-xs border-0 px-3 py-1">
                  {course.technology}
                </Badge>
                <Badge variant="secondary" className="bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs capitalize">
                  Nível: {course.level}
                </Badge>
                {courseProgress.isCourseCompleted && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold gap-1 px-3 py-1">
                    <Trophy className="size-3.5" /> Curso Concluído & Aprovado
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {course.description}
              </p>

              {/* Real Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Target className="size-3.5 text-violet-400" />
                    Progresso Real da Jornada:
                  </span>
                  <span className="font-mono text-violet-300 font-bold">
                    {courseProgress.completedLessonsCount} de {courseProgress.totalLessons} missões ({courseProgress.progressPercent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(4, courseProgress.progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Metric Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-300">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Missões</span>
                  <strong className="text-sm text-white font-black">{courseProgress.totalLessons}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Atividades</span>
                  <strong className="text-sm text-white font-black">{courseProgress.completedActivitiesCount}/{courseProgress.totalActivities}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Carga Horária</span>
                  <strong className="text-sm text-white font-black">{course.totalHours}h</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Avaliação Final</span>
                  <strong className="text-sm text-white font-black">Nota Mínima: {courseProgress.passingScore}%</strong>
                </div>
              </div>
            </div>

            {/* Smart Next Step Action Card */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full md:w-auto bg-black/40 border border-white/10 p-5 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400">
                Sua Próxima Ação:
              </span>
              <p className="text-xs text-zinc-200 font-semibold max-w-[240px] text-left md:text-right">
                {courseProgress.nextRecommendedStep.title}
              </p>

              <Link href={courseProgress.nextRecommendedStep.href} className="w-full sm:w-auto mt-2">
                <Button size="lg" className="w-full sm:w-auto gap-2 font-black text-xs px-6 py-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-purple-600/30">
                  <Play className="size-4 fill-white" />
                  {courseProgress.nextRecommendedStep.actionLabel}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TRILHA VISUAL DE MISSÕES SEQUENCIAIS (DEVMEDIA-INSPIRED CONCEPT)       */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="size-5 text-violet-400" /> Trilha de Missões de Aprendizagem
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Estrutura por missões: Cada etapa combina o vídeo da aula e a prática correspondente em tela própria.
              </p>
            </div>

            <Badge variant="outline" className="text-[11px] font-bold text-zinc-400 border-white/10 self-start sm:self-auto">
              {courseProgress.completedSteps} de {courseProgress.totalSteps} etapas concluídas
            </Badge>
          </div>

          {/* Sequential Mission Cards */}
          <div className="space-y-5">
            {courseLessons.map((lesson, idx) => {
              const mission = getLessonMissionDetails(lesson.id, courseLessons)
              if (!mission) return null

              const isCurrentActive = idx === activeMissionIndex && !mission.isActivityCompleted
              const reqAct = progressionEngine.doesLessonRequireActivity(lesson, activities)
              const isVidDone = completedLessons.includes(lesson.id)
              const isActDone = reqAct
                ? progressionEngine.hasCompletedLessonActivity(lesson, completedActivities, activities, courseLessons)
                : true
              const isMissionDone = isVidDone && isActDone

              const lessonActs = activities.filter((a) => a.lessonId === lesson.id)
              const primaryAct = lessonActs[0]
              const activityHref = primaryAct ? `/exercicios/${primaryAct.id}` : `/exercicios?lessonId=${lesson.id}`

              return (
                <div
                  key={lesson.id}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                    isMissionDone
                      ? 'border-emerald-500/20 bg-[#0f141a]'
                      : isCurrentActive
                      ? 'border-violet-500/60 bg-[#161226] ring-1 ring-violet-500/50 shadow-2xl shadow-violet-950/40'
                      : mission.isUnlocked
                      ? 'border-white/10 bg-[#100f1c]'
                      : 'border-white/5 bg-[#0d0c14]/70 opacity-70'
                  }`}
                >
                  {/* Mission Card Top Bar */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Header Row: Step Badge + 'Você está aqui' + Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        {/* Step Number Circle */}
                        <div
                          className={`size-10 rounded-2xl grid place-items-center text-xs sm:text-sm font-black shrink-0 ${
                            isMissionDone
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCurrentActive
                              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/40 ring-1 ring-violet-400'
                              : mission.isUnlocked
                              ? 'bg-white/10 text-white'
                              : 'bg-white/5 text-zinc-600'
                          }`}
                        >
                          {isMissionDone ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-wider text-violet-400">
                              {idx + 1}ª Missão
                            </span>
                            {isCurrentActive && (
                              <Badge className="bg-violet-600 text-white text-[10px] font-black px-2.5 py-0.5 border-0 animate-pulse">
                                • Você está aqui
                              </Badge>
                            )}
                            {isMissionDone && (
                              <Badge className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-500/30">
                                Missão Concluída (+{mission.totalXp} XP)
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors mt-0.5">
                            {lesson.title}
                          </h3>
                        </div>
                      </div>

                      {/* Top Action Button */}
                      <div className="shrink-0 self-start sm:self-auto">
                        {mission.isUnlocked ? (
                          <Link href={mission.ctaHref}>
                            <Button
                              size="sm"
                              className={`font-bold text-xs px-5 py-4 rounded-xl transition-all cursor-pointer ${
                                isMissionDone
                                  ? 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                                  : isVidDone && reqAct && !isActDone
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-950/50'
                                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                              }`}
                            >
                              <span>{mission.ctaText}</span>
                              <ArrowRight className="size-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="font-bold text-xs px-5 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-600 cursor-not-allowed"
                          >
                            <Lock className="size-3.5 mr-1.5" /> Bloqueada
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Sub-steps in this mission (Video + Practical Activity) */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-1">
                      {/* Step 1: Video Lesson */}
                      <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-xl bg-violet-950/60 border border-violet-500/30 grid place-items-center text-violet-400 shrink-0">
                            <Video className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              Vídeo: {lesson.title}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {lesson.durationMin || 20} min • +50 XP
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold shrink-0 ${
                            isVidDone
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : mission.isUnlocked
                              ? 'bg-violet-950/60 text-violet-300 border border-violet-500/30'
                              : 'bg-white/5 text-zinc-600 border-white/5'
                          }`}
                        >
                          {isVidDone ? '✓ Assistido' : mission.isUnlocked ? 'Disponível' : 'Bloqueado'}
                        </Badge>
                      </div>

                      {/* Step 2: Practical Activity (Separate Screen) */}
                      <div className="rounded-2xl border border-white/5 bg-black/30 p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-xl bg-amber-950/60 border border-amber-500/30 grid place-items-center text-amber-400 shrink-0">
                            <Zap className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              Atividade: {primaryAct?.title || 'Exercícios de Fixação'}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {reqAct ? 'Prática em tela própria • +25 XP' : 'Não exigida (Demonstrativa)'}
                            </span>
                          </div>
                        </div>

                        {reqAct ? (
                          mission.isUnlocked && isVidDone && !isActDone ? (
                            <Link href={activityHref}>
                              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse cursor-pointer hover:bg-amber-500/30">
                                ⚡ Fazer Atividade →
                              </Badge>
                            </Link>
                          ) : (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-bold shrink-0 ${
                                isActDone
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/5 text-zinc-600 border-white/5'
                              }`}
                            >
                              {isActDone ? '✓ Concluída' : 'Bloqueada'}
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-zinc-500 border-white/5 shrink-0">
                            Opcional
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Block reason explanation */}
                    {!mission.isUnlocked && mission.blockReason && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-1">
                        <Lock className="size-3 shrink-0" />
                        <span>{mission.blockReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ========================================================================= */}
          {/* MENTORIA CALLOUT CARD (DEVMEDIA INSPIRED 1:1 CALLOUT)                     */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#1f160a] via-[#14100b] to-[#0d0a07] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 grid place-items-center shrink-0">
                <MessageSquare className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    MENTORIA TÉCNICA PEDAGÓGICA
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-300 text-[9px] font-black border-0">
                    IA PROFESSORA
                  </Badge>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  Travou em algum exercício desta missão?
                </h4>
                <p className="text-xs text-zinc-300 font-medium max-w-lg leading-relaxed">
                  Tire dúvidas técnicas em tempo real com a IA Professora e receba orientações passo a passo para destravar seu raciocínio.
                </p>
              </div>
            </div>

            <Link href="/mentor" className="shrink-0">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-amber-950/50">
                <Bot className="size-4 mr-1.5" /> Falar com o Mentor
              </Button>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* 3. AVALIAÇÃO FINAL DO CURSO — ETAPA FINAL OBRIGATÓRIA                     */}
          {/* ========================================================================= */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 space-y-4 transition-all ${
              courseProgress.isCourseCompleted
                ? 'border-emerald-500/30 bg-gradient-to-r from-[#0f1f17] to-[#0c1410] shadow-xl'
                : courseProgress.canTakeAssessment
                ? 'border-violet-500/40 bg-gradient-to-r from-violet-950/40 via-[#18142a] to-[#100d1d] shadow-2xl shadow-violet-950/50 ring-1 ring-violet-500/30'
                : 'border-white/5 bg-[#0e0d16]/80 opacity-80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs font-bold px-3 py-1 ${
                      courseProgress.isCourseCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : courseProgress.canTakeAssessment
                        ? 'bg-violet-600 text-white border-0 animate-pulse'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    <Trophy className="size-3 mr-1" />
                    ETAPA FINAL OBRIGATÓRIA
                  </Badge>
                  <Badge variant="outline" className="text-zinc-400 text-xs font-mono">
                    Nota Mínima: {courseProgress.passingScore}%
                  </Badge>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white">
                  Avaliação Oficial de Conclusão do Curso
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                  {courseProgress.isCourseCompleted
                    ? `Parabéns! Você concluiu todas as etapas e foi aprovado com ${courseProgress.assessmentScore}% na avaliação oficial.`
                    : courseProgress.canTakeAssessment
                    ? 'Todas as missões foram concluídas! A banca examinadora da IA gerou a prova final equilibrada cobrindo todos os tópicos deste curso.'
                    : 'A avaliação final será desbloqueada automaticamente assim que você concluir 100% das missões e atividades obrigatórias deste curso.'}
                </p>
              </div>

              <div className="shrink-0">
                {courseProgress.isCourseCompleted ? (
                  <Link href="/certificados">
                    <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-emerald-950/50">
                      <Award className="size-4 mr-1.5" />
                      Visualizar Certificado
                    </Button>
                  </Link>
                ) : courseProgress.canTakeAssessment ? (
                  <Link href={assessmentHref}>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs px-8 py-5 rounded-xl shadow-xl shadow-violet-950/50 cursor-pointer">
                      <span>Iniciar Avaliação Oficial</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="w-full sm:w-auto border border-white/5 bg-white/[0.02] text-zinc-500 font-bold text-xs px-6 py-5 rounded-xl cursor-not-allowed"
                  >
                    <Lock className="size-4 mr-1.5" />
                    Bloqueada
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
