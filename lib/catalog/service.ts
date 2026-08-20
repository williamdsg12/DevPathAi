/**
 * Catalog & Content Management Domain Service — DevPath AI
 *
 * Core engine for querying, updating, deduplicating, and auditing
 * courses, modules, lessons, skills, and prerequisite relationships.
 */

import { logger } from '@/lib/logger'
import {
  type Course,
  type LearningModule,
  type Lesson,
  type ContentState,
  type CatalogAuditLog,
} from '@/lib/types'

export interface CatalogFilterOptions {
  technology?: string
  level?: string
  category?: string
  status?: string
  contentState?: ContentState
  searchQuery?: string
  limit?: number
  offset?: number
}

export interface CatalogStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalModules: number
  totalLessons: number
  totalDurationHours: number
  uniqueTechnologies: string[]
  uniqueChannels: string[]
}

/**
 * Deduplication Engine
 * Removes exact video and slug duplicates by canonical identifier.
 */
export function deduplicateCatalogItems<T extends { id: string }>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    const key = keyFn(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  return result
}

/**
 * Validates course pedagogical completeness
 */
export function validateCourseCompleteness(course: Course, modules: LearningModule[], lessons: Lesson[]): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!course.title || course.title.trim().length < 3) {
    issues.push('Título do curso muito curto ou ausente.')
  }
  if (!course.slug || !/^[a-z0-9-]+$/.test(course.slug)) {
    issues.push('Slug do curso inválido (deve conter apenas letras minúsculas, números e hífens).')
  }

  const courseModules = modules.filter((m) => m.courseId === course.id)
  if (courseModules.length === 0) {
    issues.push('O curso não possui nenhum módulo vinculado.')
  }

  const moduleIds = new Set(courseModules.map((m) => m.id))
  const courseLessons = lessons.filter((l) => moduleIds.has(l.moduleId))
  if (courseLessons.length === 0) {
    issues.push('O curso não possui nenhuma aula vinculada aos seus módulos.')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

/**
 * Calculates comprehensive catalog statistics
 */
export function calculateCatalogStats(
  courses: Course[],
  modules: LearningModule[],
  lessons: Lesson[]
): CatalogStats {
  const totalCourses = courses.length
  const publishedCourses = courses.filter((c) => c.status === 'ativo').length
  const draftCourses = courses.filter((c) => c.status !== 'ativo').length
  const totalModules = modules.length
  const totalLessons = lessons.length
  const totalDurationHours = courses.reduce((acc, c) => acc + (c.totalHours || 0), 0)

  const uniqueTechnologies = Array.from(new Set(courses.map((c) => c.technology).filter(Boolean)))
  const uniqueChannels = Array.from(new Set(courses.map((c) => c.channelTitle).filter(Boolean))) as string[]

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalModules,
    totalLessons,
    totalDurationHours,
    uniqueTechnologies,
    uniqueChannels,
  }
}
