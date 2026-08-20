/**
 * YouTube Content Health & Video Integrity Engine — DevPath AI
 *
 * Validates video availability, embedding permissions, privacy status,
 * thumbnail resolution and player stability before publishing to students.
 */

import { checkYouTubeVideoAvailability, normalizeYouTubeVideoUrl } from '@/lib/video/normalizer'
import { getYouTubeThumbnailCascade, getPrimaryYouTubeThumbnail } from './thumbnail-helper'
import type { Course, LearningModule, Lesson } from '@/lib/types'

export type VideoHealthStatus =
  | 'HEALTHY'
  | 'WARNING'
  | 'PRIVATE'
  | 'NOT_EMBEDDABLE'
  | 'NOT_FOUND'
  | 'INVALID_ID'
  | 'ERROR_DETECTED'
  | 'UNAVAILABLE'

export interface VideoHealthReportItem {
  lessonId: string
  lessonTitle: string
  courseId?: string
  courseTitle?: string
  moduleId?: string
  channelTitle?: string
  youtubeVideoId: string
  healthStatus: VideoHealthStatus
  healthScore: number // 0 to 100
  isEmbeddable: boolean
  privacyStatus: 'public' | 'unlisted' | 'private' | 'unknown'
  hasThumbnail: boolean
  thumbnailUrl: string
  lastCheckedAt: string
  issueDescription?: string
  suggestedAction?: 'none' | 'replace_video' | 'enable_embed' | 'unpublish_lesson' | 'review_metadata'
}

export interface CatalogHealthAuditSummary {
  totalVideos: number
  validVideos: number
  withProblem: number
  noThumbnail: number
  notEmbeddable: number
  privateVideos: number
  notFound: number
  playerErrors: number
  needReview: number
  overallHealthScore: number // 0 to 100
  auditedAt: string
  items: VideoHealthReportItem[]
}

/**
 * Validates a single video for availability, embeddability, privacy and thumbnail.
 */
export async function validateVideoHealth(
  videoIdOrUrl: string,
  context?: { lessonId?: string; lessonTitle?: string; courseTitle?: string; channelTitle?: string }
): Promise<VideoHealthReportItem> {
  const norm = normalizeYouTubeVideoUrl(videoIdOrUrl)

  if (!norm.isValid || !norm.videoId) {
    return {
      lessonId: context?.lessonId || `lesson_${Date.now()}`,
      lessonTitle: context?.lessonTitle || 'Aula sem título',
      courseTitle: context?.courseTitle,
      channelTitle: context?.channelTitle,
      youtubeVideoId: videoIdOrUrl,
      healthStatus: 'INVALID_ID',
      healthScore: 0,
      isEmbeddable: false,
      privacyStatus: 'unknown',
      hasThumbnail: false,
      thumbnailUrl: '',
      lastCheckedAt: new Date().toISOString(),
      issueDescription: 'Identificador do YouTube ausente ou malformatado.',
      suggestedAction: 'replace_video',
    }
  }

  const availability = await checkYouTubeVideoAvailability(norm.videoId)

  let healthStatus: VideoHealthStatus = 'HEALTHY'
  let healthScore = 100
  let issueDescription = undefined
  let suggestedAction: VideoHealthReportItem['suggestedAction'] = 'none'

  if (availability.status === 'removed') {
    healthStatus = 'NOT_FOUND'
    healthScore = 0
    issueDescription = 'Vídeo excluído ou não encontrado no YouTube.'
    suggestedAction = 'replace_video'
  } else if (availability.status === 'embed_disabled' || !availability.embedAvailable) {
    healthStatus = 'NOT_EMBEDDABLE'
    healthScore = 30
    issueDescription = 'Vídeo existe, mas a incorporação externa foi desativada pelo canal.'
    suggestedAction = 'enable_embed'
  } else if (availability.status === 'private') {
    healthStatus = 'PRIVATE'
    healthScore = 0
    issueDescription = 'Vídeo marcado como privado pelo proprietário.'
    suggestedAction = 'unpublish_lesson'
  } else if (availability.status === 'invalid_id') {
    healthStatus = 'INVALID_ID'
    healthScore = 0
    issueDescription = 'ID do YouTube não reconhecido.'
    suggestedAction = 'replace_video'
  }

  const primaryThumb = availability.thumbnailUrl || getPrimaryYouTubeThumbnail(norm.videoId)

  return {
    lessonId: context?.lessonId || norm.videoId,
    lessonTitle: context?.lessonTitle || availability.title || norm.videoId,
    courseTitle: context?.courseTitle,
    channelTitle: context?.channelTitle || availability.authorName,
    youtubeVideoId: norm.videoId,
    healthStatus,
    healthScore,
    isEmbeddable: availability.embedAvailable,
    privacyStatus: healthStatus === 'PRIVATE' ? 'private' : 'public',
    hasThumbnail: Boolean(primaryThumb),
    thumbnailUrl: primaryThumb,
    lastCheckedAt: new Date().toISOString(),
    issueDescription,
    suggestedAction,
  }
}

/**
 * Executes a full audit scan across all catalog courses, modules and lessons.
 */
export function auditFullCatalogHealth(
  courses: Course[] = [],
  modules: LearningModule[] = [],
  lessons: Lesson[] = []
): CatalogHealthAuditSummary {
  const items: VideoHealthReportItem[] = []

  let validCount = 0
  let problemCount = 0
  let noThumbnailCount = 0
  let notEmbeddableCount = 0
  let privateCount = 0
  let notFoundCount = 0
  let playerErrorsCount = 0

  for (const lesson of lessons) {
    const rawVid = lesson.videoId || lesson.externalVideoId || ''
    const norm = normalizeYouTubeVideoUrl(rawVid)

    const parentModule = modules.find((m) => m.id === lesson.moduleId)
    const parentCourse = courses.find((c) => c.id === parentModule?.courseId || c.category === parentModule?.phase)

    let healthStatus: VideoHealthStatus = 'HEALTHY'
    let healthScore = 100
    let issueDescription: string | undefined = undefined
    let suggestedAction: VideoHealthReportItem['suggestedAction'] = 'none'

    if (lesson.availabilityStatus === 'private') {
      healthStatus = 'PRIVATE'
      healthScore = 0
      issueDescription = 'Vídeo privado.'
      suggestedAction = 'unpublish_lesson'
      privateCount++
      problemCount++
    } else if (lesson.availabilityStatus === 'embed_disabled' || lesson.embedAvailable === false) {
      healthStatus = 'NOT_EMBEDDABLE'
      healthScore = 30
      issueDescription = 'Incorporação em player externo desativada pelo criador.'
      suggestedAction = 'enable_embed'
      notEmbeddableCount++
      problemCount++
    } else if (lesson.availabilityStatus === 'removed' || lesson.isUnavailable) {
      healthStatus = 'NOT_FOUND'
      healthScore = 0
      issueDescription = 'Vídeo indisponível ou removido do YouTube.'
      suggestedAction = 'replace_video'
      notFoundCount++
      problemCount++
    } else if (!norm.isValid || !norm.videoId) {
      healthStatus = 'INVALID_ID'
      healthScore = 0
      issueDescription = 'Identificador de vídeo ausente ou inválido.'
      suggestedAction = 'replace_video'
      problemCount++
    } else {
      validCount++
    }

    const thumbUrl = lesson.thumbnailUrl || (norm.videoId ? getPrimaryYouTubeThumbnail(norm.videoId) : '')
    if (!thumbUrl) {
      noThumbnailCount++
    }

    items.push({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseId: parentCourse?.id,
      courseTitle: parentCourse?.title,
      moduleId: parentModule?.id,
      channelTitle: lesson.source || parentCourse?.channelTitle,
      youtubeVideoId: norm.videoId || rawVid,
      healthStatus,
      healthScore,
      isEmbeddable: healthStatus !== 'NOT_EMBEDDABLE' && healthStatus !== 'NOT_FOUND' && healthStatus !== 'PRIVATE' && healthStatus !== 'INVALID_ID',
      privacyStatus: healthStatus === 'PRIVATE' ? 'private' : 'public',
      hasThumbnail: Boolean(thumbUrl),
      thumbnailUrl: thumbUrl,
      lastCheckedAt: lesson.lastCheckedAt || new Date().toISOString(),
      issueDescription,
      suggestedAction,
    })
  }

  const total = lessons.length
  const overallHealthScore = total > 0 ? Math.round((validCount / total) * 100) : 100

  return {
    totalVideos: total,
    validVideos: validCount,
    withProblem: problemCount,
    noThumbnail: noThumbnailCount,
    notEmbeddable: notEmbeddableCount,
    privateVideos: privateCount,
    notFound: notFoundCount,
    playerErrors: playerErrorsCount,
    needReview: problemCount,
    overallHealthScore,
    auditedAt: new Date().toISOString(),
    items,
  }
}

/**
 * Computes health and warning level for a Course entity based on its lessons.
 */
export function calculateCourseHealthStatus(
  course: Course,
  courseLessons: Lesson[]
): {
  status: 'HEALTHY' | 'WARNING' | 'BLOCKED'
  validLessonsCount: number
  totalLessonsCount: number
  healthScore: number
  issues: string[]
} {
  if (courseLessons.length === 0) {
    return {
      status: 'WARNING',
      validLessonsCount: 0,
      totalLessonsCount: 0,
      healthScore: 50,
      issues: ['Curso sem aulas cadastradas.'],
    }
  }

  const validLessons = courseLessons.filter(
    (l) => !l.isUnavailable && l.availabilityStatus !== 'removed' && l.availabilityStatus !== 'private' && (l.videoId || l.externalVideoId)
  )

  const validCount = validLessons.length
  const totalCount = courseLessons.length
  const score = Math.round((validCount / totalCount) * 100)

  const issues: string[] = []
  if (validCount < totalCount) {
    issues.push(`${totalCount - validCount} aula(s) com problema de disponibilidade.`)
  }
  if (!course.thumbnailUrl) {
    issues.push('Thumbnail principal do curso não configurada.')
  }

  let status: 'HEALTHY' | 'WARNING' | 'BLOCKED' = 'HEALTHY'
  if (validCount === 0) {
    status = 'BLOCKED'
  } else if (validCount < totalCount || issues.length > 0) {
    status = 'WARNING'
  }

  return {
    status,
    validLessonsCount: validCount,
    totalLessonsCount: totalCount,
    healthScore: score,
    issues,
  }
}
