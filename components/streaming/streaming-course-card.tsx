'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Clock, BookOpen, Sparkles, CheckCircle2, ChevronRight, Info, ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getYouTubeThumbnailCascade } from '@/lib/youtube/thumbnail-helper'
import type { Course } from '@/lib/types'

interface StreamingCourseCardProps {
  course: Course
  progressPercent?: number
  currentLessonId?: string
  onOpenDetails?: (course: Course) => void
}

export function StreamingCourseCard({
  course,
  progressPercent = 0,
  currentLessonId,
  onOpenDetails,
}: StreamingCourseCardProps) {
  const isStarted = progressPercent > 0
  const playUrl = currentLessonId ? `/aulas/${currentLessonId}` : `/courses/${course.slug}`

  // Thumbnail Cascade Fallback State
  const fallbackList = course.playlistId || course.thumbnailUrl ? getYouTubeThumbnailCascade(course.thumbnailUrl || course.playlistId || '') : []
  const [currentThumbIndex, setCurrentThumbIndex] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const currentSrc = course.thumbnailUrl || fallbackList[currentThumbIndex] || ''

  function handleImageError() {
    if (currentThumbIndex < fallbackList.length - 1) {
      setCurrentThumbIndex((prev) => prev + 1)
    } else {
      setImgError(true)
    }
  }

  return (
    <div className="group relative flex-none w-[260px] sm:w-[290px] md:w-[320px] rounded-2xl overflow-hidden bg-[#121020] border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-950/40 select-none flex flex-col justify-between">
      {/* Thumbnail Container with Ambient Overlay */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/80">
        {/* Loading Skeleton */}
        {!imgLoaded && !imgError && currentSrc && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}

        {currentSrc && !imgError ? (
          <img
            src={currentSrc}
            alt={course.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          /* Honest Professional Placeholder — Not an ugly grey box */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-950/40 to-black p-4 text-center border-b border-white/5">
            <div className="size-10 rounded-xl bg-violet-600/20 border border-violet-500/30 grid place-items-center mb-2">
              <BookOpen className="size-5 text-violet-400" />
            </div>
            <span className="text-xs font-bold text-white line-clamp-1">{course.title}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Thumbnail oficial indisponível</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121020] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <Badge
            variant="outline"
            className="text-[9px] font-mono uppercase font-bold tracking-wider bg-black/75 backdrop-blur-md border-white/15 text-violet-300"
          >
            {course.technology}
          </Badge>
          <span className="text-[10px] font-mono text-zinc-300 font-bold bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            {course.level}
          </span>
        </div>

        {/* Center Hover Play Button */}
        <Link
          href={playUrl}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]"
          aria-label={`Estudar curso ${course.title}`}
        >
          <div className="size-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white grid place-items-center shadow-xl shadow-violet-950/80 transition-transform duration-200 hover:scale-110">
            <Play className="size-5 fill-white ml-0.5" />
          </div>
        </Link>

        {/* Bottom Progress Bar if started */}
        {isStarted && (
          <div className="absolute bottom-0 inset-x-0">
            <div className="h-1.5 w-full bg-black/60">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-medium text-zinc-300 truncate max-w-[170px]">
              {course.channelTitle || 'DevPath Oficial'}
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
              <Clock className="size-3 text-zinc-400" />
              <span>{course.totalHours || 1}h</span>
            </div>
          </div>

          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-violet-300 transition-colors">
            {course.title}
          </h3>

          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
            {course.description || `Formação completa e estruturada em ${course.technology}.`}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-400">
            {course.lessonsCount || 0} aulas
          </span>

          <div className="flex items-center gap-1.5">
            {onOpenDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenDetails(course)
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Mais Informações"
              >
                <Info className="size-3.5" />
              </button>
            )}
            <Link href={playUrl}>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 group-hover:translate-x-0.5 transition-transform"
              >
                <span>{isStarted ? 'Continuar' : 'Acessar'}</span>
                <ChevronRight className="size-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
