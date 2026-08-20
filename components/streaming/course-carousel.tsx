'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { StreamingCourseCard } from './streaming-course-card'
import type { Course } from '@/lib/types'

interface CourseCarouselProps {
  id: string
  title: string
  subtitle?: string
  badge?: string
  courses: Course[]
  getCourseProgress?: (courseId: string) => number
  getNextLessonId?: (courseId: string) => string | undefined
  onOpenDetails?: (course: Course) => void
}

export function CourseCarousel({
  id,
  title,
  subtitle,
  badge,
  courses,
  getCourseProgress,
  getNextLessonId,
  onOpenDetails,
}: CourseCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  function updateArrowState() {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
  }

  useEffect(() => {
    updateArrowState()
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', updateArrowState)
      window.addEventListener('resize', updateArrowState)
      return () => {
        el.removeEventListener('scroll', updateArrowState)
        window.removeEventListener('resize', updateArrowState)
      }
    }
  }, [courses])

  function scroll(direction: 'left' | 'right') {
    if (!containerRef.current) return
    const scrollAmount = containerRef.current.clientWidth * 0.75
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!courses || courses.length === 0) return null

  return (
    <section className="relative group/carousel py-2 select-none" aria-labelledby={`heading-${id}`}>
      {/* Category Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 mb-3">
        <div className="flex items-center gap-2.5">
          <h2 id={`heading-${id}`} className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-600/20 text-violet-300 border border-violet-500/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow Button (Desktop) */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-[#09090e] via-[#09090e]/80 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer hidden md:flex"
            aria-label="Rolar para a esquerda"
          >
            <div className="size-9 rounded-full bg-black/80 hover:bg-violet-600 text-white grid place-items-center shadow-lg border border-white/10 transition-transform active:scale-95">
              <ChevronLeft className="size-5" />
            </div>
          </button>
        )}

        {/* Scrollable Cards Track */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden px-4 sm:px-6 md:px-8 pb-3 pt-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => {
            const progress = getCourseProgress ? getCourseProgress(course.id) : 0
            const nextLessonId = getNextLessonId ? getNextLessonId(course.id) : undefined

            return (
              <div key={course.id} className="snap-start">
                <StreamingCourseCard
                  course={course}
                  progressPercent={progress}
                  currentLessonId={nextLessonId}
                  onOpenDetails={onOpenDetails}
                />
              </div>
            )
          })}
        </div>

        {/* Right Arrow Button (Desktop) */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-[#09090e] via-[#09090e]/80 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer hidden md:flex"
            aria-label="Rolar para a direita"
          >
            <div className="size-9 rounded-full bg-black/80 hover:bg-violet-600 text-white grid place-items-center shadow-lg border border-white/10 transition-transform active:scale-95">
              <ChevronRight className="size-5" />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
