'use client'

import React from 'react'
import Link from 'next/link'
import { X, Play, Clock, BookOpen, Layers, CheckCircle2, Video, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import type { Course } from '@/lib/types'

interface CourseModalProps {
  course: Course | null
  onClose: () => void
}

export function CourseModal({ course, onClose }: CourseModalProps) {
  const { allModules, allLessons, completedLessons } = useAppStore()

  if (!course) return null

  const courseModules = allModules.filter((m) => m.courseId === course.id || m.phase === course.category)
  const courseLessons = allLessons.filter((l) => courseModules.some((m) => m.id === l.moduleId))

  const playUrl = `/courses/${course.slug}`

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop closer */}
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#0d0c15] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header Backdrop */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black shrink-0">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover brightness-75" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-violet-950 to-purple-900" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c15] via-transparent to-black/40" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 size-9 rounded-full bg-black/70 hover:bg-white text-white hover:text-black grid place-items-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="size-5" />
          </button>

          {/* Title and main CTA over backdrop */}
          <div className="absolute bottom-4 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-600 text-white text-[10px] font-mono font-bold">
                {course.technology}
              </Badge>
              <span className="text-xs font-mono text-zinc-300 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                {course.level}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{course.title}</h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-violet-600/40">
          {/* Action Row & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
              <span className="text-emerald-400 font-bold">★ 4.9 Avaliação</span>
              <span>{course.totalHours || 1} horas no total</span>
              <span>{courseLessons.length || course.lessonsCount || 0} aulas</span>
            </div>

            <Link href={playUrl} onClick={onClose}>
              <Button className="bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl px-5 h-9 gap-1.5 shadow-lg">
                <Play className="size-3.5 fill-black" /> Acessar Curso Completo
              </Button>
            </Link>
          </div>

          {/* Course Synopsis */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Sobre o Curso</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {course.description || `Formação aprofundada em ${course.technology}. Desenvolva projetos reais e domine a stack com orientação pedagógica do DevPath AI.`}
            </p>
          </div>

          {/* Modules and Lessons List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center justify-between">
              <span>Grade Curricular ({courseModules.length || 1} módulos)</span>
              <span className="text-[10px] text-zinc-500 font-normal">Base oficial de aulas</span>
            </h3>

            <div className="space-y-2">
              {courseLessons.slice(0, 10).map((lesson, idx) => {
                const isDone = completedLessons.includes(lesson.id)
                return (
                  <div
                    key={lesson.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between hover:border-violet-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-zinc-500 font-bold shrink-0">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <Video className="size-4 text-violet-400 shrink-0" />
                      <span className="text-xs font-bold text-zinc-200 truncate">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500">{lesson.durationMin || 15}m</span>
                      {isDone && <CheckCircle2 className="size-4 text-emerald-400" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
