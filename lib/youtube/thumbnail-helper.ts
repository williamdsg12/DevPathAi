/**
 * YouTube Thumbnail Cascade & Resolver Engine — DevPath AI
 *
 * Implements strict resolution hierarchy:
 * maxresdefault (1280x720) -> sddefault (640x480) -> hqdefault (480x360) -> mqdefault (320x180) -> default (120x90)
 *
 * Provides fallback cascade without generating fake/fictitious AI images.
 */

import { normalizeYouTubeVideoUrl } from '@/lib/video/normalizer'
import type { Course, Lesson, ThumbnailQuality } from '@/lib/types'

export const THUMBNAIL_QUALITIES: Array<{ quality: ThumbnailQuality; filename: string; width: number }> = [
  { quality: 'maxres', filename: 'maxresdefault.jpg', width: 1280 },
  { quality: 'standard', filename: 'sddefault.jpg', width: 640 },
  { quality: 'high', filename: 'hqdefault.jpg', width: 480 },
  { quality: 'medium', filename: 'mqdefault.jpg', width: 320 },
  { quality: 'default', filename: 'default.jpg', width: 120 },
]

/**
 * Returns ordered array of thumbnail fallback URLs for a given YouTube Video ID.
 */
export function getYouTubeThumbnailCascade(videoIdOrUrl: string): string[] {
  const norm = normalizeYouTubeVideoUrl(videoIdOrUrl)
  const vid = norm.videoId
  if (!vid) return []

  return [
    `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${vid}/sddefault.jpg`,
    `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${vid}/default.jpg`,
  ]
}

/**
 * Resolves the primary thumbnail URL for a given YouTube Video ID.
 * Defaults to hqdefault (480x360) which is guaranteed by YouTube for all uploaded videos.
 */
export function getPrimaryYouTubeThumbnail(videoIdOrUrl: string, preferHighRes = true): string {
  const norm = normalizeYouTubeVideoUrl(videoIdOrUrl)
  if (!norm.isValid || !norm.videoId) return ''

  if (preferHighRes) {
    return `https://img.youtube.com/vi/${norm.videoId}/hqdefault.jpg`
  }
  return `https://img.youtube.com/vi/${norm.videoId}/mqdefault.jpg`
}

/**
 * Resolves the best authentic thumbnail for a Course entity:
 * 1. If course.thumbnailUrl is a valid URL, returns it.
 * 2. If missing, attempts to inherit from the first valid lesson in the course.
 * 3. If no valid lesson exists, returns empty string for graceful neutral placeholder.
 */
export function resolveCourseThumbnail(course: Course, courseLessons: Lesson[] = []): string {
  if (course.thumbnailUrl && course.thumbnailUrl.trim() !== '') {
    return course.thumbnailUrl.trim()
  }

  // Inherit thumbnail from the first valid lesson with a YouTube Video ID
  const firstValidLesson = courseLessons.find((l) => (l.videoId || l.externalVideoId) && !l.isUnavailable)
  const vid = firstValidLesson?.videoId || firstValidLesson?.externalVideoId
  if (vid) {
    return getPrimaryYouTubeThumbnail(vid, true)
  }

  return ''
}
