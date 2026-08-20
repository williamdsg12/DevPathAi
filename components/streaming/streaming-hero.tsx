'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Info, Sparkles, Clock, BookOpen, Layers, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Course, LearningModule, Lesson } from '@/lib/types'

interface StreamingHeroProps {
  course: Course
  currentModule?: LearningModule
  currentLesson?: Lesson
  progressPercent: number
  totalLessonsCount: number
  completedLessonsCount: number
  userName?: string
  isStarted: boolean
  onOpenDetails?: (course: Course) => void
}

export function StreamingHero({
  course,
  currentModule,
  currentLesson,
  progressPercent,
  totalLessonsCount,
  completedLessonsCount,
  userName = 'Desenvolvedor',
  isStarted,
  onOpenDetails,
}: StreamingHeroProps) {
  const playUrl = currentLesson ? `/aulas/${currentLesson.id}` : `/courses/${course.slug}`

  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[480px] md:min-h-[520px] rounded-3xl overflow-hidden bg-[#09090e] border border-white/10 shadow-2xl mb-8 flex flex-col justify-end">
      {/* Background Backdrop Image with Multi-Layer Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-violet-950/80 via-purple-950/50 to-black" />
        )}

        {/* Ambient Dark Gradients (Netflix Style) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-[#09090e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090e] via-[#09090e]/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 md:p-12 max-w-2xl space-y-4">
        {/* Dynamic Tag / Status Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {isStarted ? (
            <Badge className="bg-violet-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 shadow-lg shadow-violet-950/50">
              ▶ Continue sua jornada
            </Badge>
          ) : (
            <Badge className="bg-emerald-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 shadow-lg shadow-emerald-950/50 flex items-center gap-1">
              <Sparkles className="size-3" /> Recomendado para seu nível
            </Badge>
          )}

          <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/15 text-zinc-300 text-[10px] font-mono">
            {course.technology}
          </Badge>

          <span className="text-[11px] font-mono text-zinc-400">
            {course.level.toUpperCase()} • {course.totalHours || 1}H
          </span>
        </div>

        {/* Course Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
          {course.title}
        </h1>

        {/* Short Synopsis */}
        <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
          {course.description || `Aprenda ${course.technology} do zero ao avançado com metodologia prática e acompanhamento do Mentor IA.`}
        </p>

        {/* Real Progress Box (If course started) */}
        {isStarted && (
          <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 max-w-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span className="truncate max-w-[260px]">
                {currentLesson ? `Aula: ${currentLesson.title}` : 'Progresso geral'}
              </span>
              <span className="font-mono text-violet-400">{progressPercent}% concluído</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Action Buttons (Play & More Info) */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href={playUrl}>
            <Button
              size="lg"
              className="bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm rounded-xl px-6 h-11 gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="size-4 fill-black" />
              {isStarted ? 'Continuar Estudando' : 'Iniciar Curso'}
            </Button>
          </Link>

          {onOpenDetails && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onOpenDetails(course)}
              className="bg-zinc-800/80 hover:bg-zinc-700/80 text-white font-bold text-xs sm:text-sm rounded-xl px-5 h-11 border-white/10 gap-2 backdrop-blur-md cursor-pointer"
            >
              <Info className="size-4 text-zinc-300" />
              Mais Informações
            </Button>
          )}

          <Link href="/trilha">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="text-zinc-300 hover:text-white text-xs sm:text-sm rounded-xl px-4 h-11 gap-1.5"
            >
              Ver Minha Trilha
              <ChevronRight className="size-4 text-zinc-500" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
