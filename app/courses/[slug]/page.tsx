'use client'

import { use } from 'react'
import Link from 'next/link'
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
  PlayCircle,
  Sparkles,
  Tv,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { getIcon } from '@/lib/module-icons'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  const { allCourses, allModules, allLessons, completedLessons } = useAppStore()

  const course = allCourses.find((c) => c.slug === slug || c.id === slug)
  const courseModules = course ? allModules.filter((m) => m.courseId === course.id || m.phase === course.category) : []
  const firstLessonId = courseModules[0]?.lessonIds[0] || (allLessons[0]?.id ?? '')

  if (!course) {
    return (
      <AppShell title="Curso não Encontrado" subtitle="O curso solicitado não está disponível no catálogo">
        <div className="space-y-6">
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed rounded-3xl bg-muted/10 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Curso não encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-md">
              O curso que você tentou acessar não existe ou foi removido do catálogo.
            </p>
            <Link href="/cursos">
              <Button size="sm" className="font-bold text-xs gap-2">
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
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar para o Catálogo de Cursos
          </Link>
        </div>

        {/* Hero Course Header Card */}
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-card to-card p-6 sm:p-8 shadow-xl shadow-primary/5">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold text-xs">
                  {course.technology}
                </Badge>
                <Badge variant="secondary" className="font-bold text-xs capitalize">
                  Nível: {course.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Fonte: {course.channelTitle || 'YouTube Oficial'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground">{course.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <div className="rounded-2xl border border-border bg-card p-3 text-center sm:text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Carga Horária</span>
                <p className="text-2xl font-black text-primary">{course.totalHours}h</p>
                <p className="text-[11px] text-muted-foreground">{course.lessonsCount} aulas • {course.modulesCount} módulos</p>
              </div>

              <Link href={`/aulas/${firstLessonId}`}>
                <Button size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-xl shadow-primary/20 py-6 px-8 rounded-2xl">
                  <PlayCircle className="size-5" /> Iniciar Curso Agora <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Modules and Lessons Syllabus */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" /> Grade Curricular & Módulos
          </h2>

          <div className="space-y-4">
            {courseModules.map((mod, modIdx) => {
              const lessons = allLessons.filter((l) => mod.lessonIds.includes(l.id))
              const Icon = getIcon(mod.icon)

              return (
                <Card key={mod.id} className="border-border/80 shadow-md overflow-hidden">
                  <CardHeader className="bg-muted/30 p-4 sm:p-5 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Módulo {modIdx + 1}
                          </span>
                          <CardTitle className="text-base font-bold">{mod.title}</CardTitle>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-xs">
                        {lessons.length} aulas • {mod.estimatedHours}h
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 divide-y divide-border/40">
                    {lessons.map((lesson, lessonIdx) => {
                      const isDone = completedLessons.includes(lesson.id)
                      return (
                        <div
                          key={lesson.id}
                          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs hover:bg-muted/20 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`grid size-6 place-items-center rounded-full text-[10px] font-bold shrink-0 ${
                                isDone ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isDone ? '✓' : lessonIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{lesson.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                              <Clock className="size-3" /> {lesson.durationMin}m
                            </span>
                            <Link href={`/aulas/${lesson.id}`}>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-semibold gap-1">
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
