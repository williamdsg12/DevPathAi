/**
 * Streaming Experience & Learning Hub Types — DevPath AI
 */

import type { Course, LearningModule, Lesson } from '@/lib/types'

export interface StreamingHeroData {
  course: Course
  currentModule?: LearningModule
  currentLesson?: Lesson
  progressPercent: number
  totalLessons: number
  completedLessonsCount: number
  reasonText?: string
  isStarted: boolean
}

export interface CarouselRowData {
  id: string
  title: string
  subtitle?: string
  badge?: string
  courses: Course[]
}
