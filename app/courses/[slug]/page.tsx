'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  GraduationCap,
  Layers,
  Play,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  const { allCourses, allModules, allLessons, completedLessons } = useAppStore()

  const course = allCourses.find((c) => c.slug === slug || c.id === slug)
  const courseModules = course ? allModules.filter((m) => m.courseId === course.id || m.phase === course.category) : []
  
  // All lessons in this course
  const courseLessons = courseModules.flatMap((m) => allLessons.filter((l) => m.lessonIds.includes(l.id)))
  const completedInCourse = courseLessons.filter((l) => completedLessons.includes(l.id)).length
  const progressPercent = courseLessons.length > 0 ? Math.round((completedInCourse / courseLessons.length) * 100) : 0
  const firstLessonId = courseLessons[0]?.id || (allLessons[0]?.id ?? '')

  if (!course) {
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

  return (
    <AppShell title={course.title} subtitle={`Formação em ${course.technology} • ${course.category}`}>
      <div className="space-y-8 pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para o Catálogo de Cursos
          </Link>
        </div>

        {/* Hero Course Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#12111a] to-[#0d0c14] p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-600 text-white font-extrabold text-xs border-0 px-2.5 py-0.5">
                  {course.technology}
                </Badge>
                <Badge variant="secondary" className="bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs capitalize">
                  Nível: {course.level}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                  {course.channelTitle || 'YouTube Oficial'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {course.description}
              </p>

              {/* Progress and quick stats */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-300">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Módulos</span>
                  <strong className="text-sm text-white font-black">{courseModules.length}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Aulas</span>
                  <strong className="text-sm text-white font-black">{courseLessons.length}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Duração</span>
                  <strong className="text-sm text-white font-black">{course.totalHours}h</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Progresso</span>
                  <strong className="text-sm text-violet-400 font-mono font-black">{progressPercent}%</strong>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex flex-col sm:items-end gap-4 shrink-0 w-full md:w-auto">
              <Link href={`/aulas/${firstLessonId}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2.5 font-black text-sm px-8 py-6 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-purple-600/30">
                  <Play className="size-4.5 fill-white" />
                  {progressPercent > 0 ? 'CONTINUAR CURSO' : 'INICIAR CURSO AGORA'}
                  <ArrowRight className="size-4.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Grade Curricular / Módulos do Curso */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="size-5 text-violet-400" /> Grade Curricular & Módulos
          </h2>

          <div className="space-y-4">
            {courseModules.map((mod, modIdx) => {
              const lessons = allLessons.filter((l) => mod.lessonIds.includes(l.id))
              const Icon = getIcon(mod.icon)
              const modCompletedCount = lessons.filter((l) => completedLessons.includes(l.id)).length

              return (
                <Card key={mod.id} className="border-white/5 bg-[#12111a] shadow-xl overflow-hidden rounded-3xl">
                  <CardHeader className="bg-white/[0.02] p-5 sm:p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/30">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400">
                            Módulo {modIdx + 1}
                          </span>
                          <CardTitle className="text-base font-bold text-white">{mod.title}</CardTitle>
                        </div>
                      </div>

                      <Badge variant="secondary" className="bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold">
                        {modCompletedCount}/{lessons.length} aulas concluídas
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 divide-y divide-white/5">
                    {lessons.map((lesson, lessonIdx) => {
                      const isDone = completedLessons.includes(lesson.id)
                      return (
                        <div
                          key={lesson.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs hover:bg-white/[0.02] px-3 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`grid size-7 place-items-center rounded-lg text-xs font-bold shrink-0 ${
                                isDone ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-500 border border-white/5'
                              }`}
                            >
                              {isDone ? '✓' : lessonIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate text-xs sm:text-sm">{lesson.title}</p>
                              <p className="text-[11px] text-zinc-400 truncate">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="size-3" /> {lesson.durationMin}m
                            </span>
                            <Link href={`/aulas/${lesson.id}`}>
                              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold text-violet-400 hover:text-white hover:bg-violet-600 gap-1 rounded-lg">
                                Assistir <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
