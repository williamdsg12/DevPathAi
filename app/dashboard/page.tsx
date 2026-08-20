'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  FolderGit2,
  GraduationCap,
  Layers,
  Map,
  Play,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { StreamingHero } from '@/components/streaming/streaming-hero'
import { CourseCarousel } from '@/components/streaming/course-carousel'
import { CourseModal } from '@/components/streaming/course-modal'
import type { Course } from '@/lib/types'

export default function DashboardPage() {
  const {
    profile,
    activePath,
    allCourses,
    allModules,
    allLessons,
    moduleProgress,
    completedLessons,
    currentModuleId,
    nextPendingLessonId,
    xp,
    level,
    streak,
    projects,
  } = useAppStore()

  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null)

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Desenvolvedor'

  // Current active module and lesson
  const currentModule = allModules.find((m) => m.id === currentModuleId) || allModules[0]
  const currentLesson = allLessons.find((l) => l.id === nextPendingLessonId) || allLessons[0]
  const activeCourse = currentModule
    ? allCourses.find((c) => c.id === currentModule.courseId || c.category === currentModule.phase) || allCourses[0]
    : allCourses[0]

  // Calculate real progress percent for current active course
  const currentCourseLessons = allLessons.filter((l) =>
    allModules.filter((m) => m.courseId === activeCourse?.id || m.phase === activeCourse?.category).some((m) => m.id === l.moduleId)
  )
  const currentCourseCompletedCount = currentCourseLessons.filter((l) => completedLessons.includes(l.id)).length
  const currentCourseProgressPercent =
    currentCourseLessons.length > 0 ? Math.round((currentCourseCompletedCount / currentCourseLessons.length) * 100) : 0

  const isCourseStarted = currentCourseCompletedCount > 0

  // Helper to compute progress for any course
  function getCourseProgress(courseId: string): number {
    const course = allCourses.find((c) => c.id === courseId)
    if (!course) return 0
    const courseMods = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
    const cLessons = allLessons.filter((l) => courseMods.some((m) => m.id === l.moduleId))
    if (cLessons.length === 0) return 0
    const done = cLessons.filter((l) => completedLessons.includes(l.id)).length
    return Math.round((done / cLessons.length) * 100)
  }

  function getNextLessonForCourse(courseId: string): string | undefined {
    const course = allCourses.find((c) => c.id === courseId)
    if (!course) return undefined
    const courseMods = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
    const cLessons = allLessons.filter((l) => courseMods.some((m) => m.id === l.moduleId))
    const next = cLessons.find((l) => !completedLessons.includes(l.id))
    return next?.id || cLessons[0]?.id
  }

  // Course Categorization for Horizontal Carousels
  const continueStudyingCourses = useMemo(() => {
    return allCourses.filter((c) => getCourseProgress(c.id) > 0 && getCourseProgress(c.id) < 100)
  }, [allCourses, completedLessons])

  const recommendedCourses = useMemo(() => {
    return allCourses.filter((c) => c.status === 'ativo')
  }, [allCourses])

  const logicCourses = useMemo(() => {
    return allCourses.filter(
      (c) =>
        c.category.toLowerCase().includes('fundamento') ||
        c.title.toLowerCase().includes('lógica') ||
        c.title.toLowerCase().includes('algoritmo')
    )
  }, [allCourses])

  const frontendCourses = useMemo(() => {
    return allCourses.filter(
      (c) =>
        c.category.toLowerCase().includes('front') ||
        c.technology.toLowerCase().includes('react') ||
        c.technology.toLowerCase().includes('javascript') ||
        c.technology.toLowerCase().includes('web')
    )
  }, [allCourses])

  const backendCourses = useMemo(() => {
    return allCourses.filter(
      (c) =>
        c.category.toLowerCase().includes('back') ||
        c.technology.toLowerCase().includes('node') ||
        c.technology.toLowerCase().includes('sql') ||
        c.technology.toLowerCase().includes('banco')
    )
  }, [allCourses])

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* 1. CINEMATIC HERO (Streaming Style) */}
        {activeCourse && (
          <StreamingHero
            course={activeCourse}
            currentModule={currentModule}
            currentLesson={currentLesson}
            progressPercent={currentCourseProgressPercent}
            totalLessonsCount={currentCourseLessons.length}
            completedLessonsCount={currentCourseCompletedCount}
            userName={firstName}
            isStarted={isCourseStarted}
            onOpenDetails={(course) => setSelectedCourseForModal(course)}
          />
        )}

        {/* 2. CONTINUE ESTUDANDO ROW (If student has active in-progress courses) */}
        {continueStudyingCourses.length > 0 && (
          <CourseCarousel
            id="continue-studying"
            title="Continue Estudando"
            badge="EM ANDAMENTO"
            subtitle="Retome exatamente onde você parou"
            courses={continueStudyingCourses}
            getCourseProgress={getCourseProgress}
            getNextLessonId={getNextLessonForCourse}
            onOpenDetails={(course) => setSelectedCourseForModal(course)}
          />
        )}

        {/* 3. MINHA JORNADA HIGHLIGHT BANNER */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-violet-950/60 via-[#121020] to-[#121020] border border-violet-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-600 text-white text-[10px] font-mono font-bold">
                MINHA JORNADA ATIVA
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                {activePath?.title || 'Trilha Full Stack Developer'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {currentModule ? `Módulo Atual: ${currentModule.title}` : 'Inicie sua trilha personalizada'}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Trilha pedagógica adaptativa estruturada com base no seu diagnóstico. Conclua as aulas e projetos para desbloquear a próxima etapa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link href="/trilha" className="w-full sm:w-auto">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-5 h-10 gap-2 w-full sm:w-auto shadow-lg shadow-violet-950/50">
                <Map className="size-4" /> Ver Mapa da Jornada
              </Button>
            </Link>
          </div>
        </div>

        {/* 4. RECOMENDADOS PARA VOCÊ */}
        <CourseCarousel
          id="recommended"
          title="Recomendados para Você"
          badge="IA DEVPATH"
          subtitle="Cursos selecionados para acelerar seus objetivos profissionais"
          courses={recommendedCourses}
          getCourseProgress={getCourseProgress}
          getNextLessonId={getNextLessonForCourse}
          onOpenDetails={(course) => setSelectedCourseForModal(course)}
        />

        {/* 5. FUNDAMENTOS & LÓGICA */}
        {logicCourses.length > 0 && (
          <CourseCarousel
            id="logic"
            title="Fundamentos & Lógica de Programação"
            subtitle="Base sólida em algoritmos e raciocínio lógico"
            courses={logicCourses}
            getCourseProgress={getCourseProgress}
            getNextLessonId={getNextLessonForCourse}
            onOpenDetails={(course) => setSelectedCourseForModal(course)}
          />
        )}

        {/* 6. FRONT-END & REACT */}
        {frontendCourses.length > 0 && (
          <CourseCarousel
            id="frontend"
            title="Front-end Moderno & React"
            subtitle="Interfaces responsivas, componentes e estados com TypeScript"
            courses={frontendCourses}
            getCourseProgress={getCourseProgress}
            getNextLessonId={getNextLessonForCourse}
            onOpenDetails={(course) => setSelectedCourseForModal(course)}
          />
        )}

        {/* 7. BACK-END & BANCO DE DADOS */}
        {backendCourses.length > 0 && (
          <CourseCarousel
            id="backend"
            title="Back-end & Arquitetura de Software"
            subtitle="APIs REST, Node.js, SQL e boas práticas de engenharia"
            courses={backendCourses}
            getCourseProgress={getCourseProgress}
            getNextLessonId={getNextLessonForCourse}
            onOpenDetails={(course) => setSelectedCourseForModal(course)}
          />
        )}

        {/* 8. DESAFIOS & PROJETOS PRÁTICOS CAROUSEL */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <FolderGit2 className="size-5 text-violet-400" />
                Desafios Práticos & Portfólio
              </h2>
              <p className="text-xs text-zinc-400">
                Construa projetos reais avaliados por rubricas automatizadas
              </p>
            </div>
            <Link href="/projetos">
              <Button variant="ghost" size="sm" className="text-xs text-violet-400 hover:text-violet-300 gap-1">
                Ver todos <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/projetos">
              <div className="p-4 rounded-2xl bg-[#121020] border border-white/10 hover:border-violet-500/40 transition-all group cursor-pointer space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300">
                    JavaScript
                  </Badge>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">+100 XP</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                    Calculadora de IMC Interativa
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    Manipulação do DOM, funções puras e validação de dados em JS moderno.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Dificuldade: Iniciante</span>
                  <span className="text-violet-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Acessar <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/projetos">
              <div className="p-4 rounded-2xl bg-[#121020] border border-white/10 hover:border-violet-500/40 transition-all group cursor-pointer space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-violet-300">
                    React & Tailwind
                  </Badge>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">+150 XP</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                    TaskFlow: Gerenciador de Tarefas
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    Aplicação SPA com estado reativo, filtros e persistência no localStorage.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Dificuldade: Intermediário</span>
                  <span className="text-violet-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Acessar <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/code-lab">
              <div className="p-4 rounded-2xl bg-[#121020] border border-white/10 hover:border-purple-500/40 transition-all group cursor-pointer space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono border-purple-500/30 text-purple-300 bg-purple-950/20">
                    Code Lab
                  </Badge>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">IDE Sandbox</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                    Laboratório de Código Aberto
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    Experimente algoritmos em tempo real com execução in-browser segura.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Ambiente Livre</span>
                  <span className="text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Abrir IDE <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      <CourseModal
        course={selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
      />
    </AppShell>
  )
}
