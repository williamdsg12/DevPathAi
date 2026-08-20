/**
 * Master Verification Suite: YouTube Content Health Engine & Thumbnail Cascade
 * Tests all 12 mandatory validation scenarios.
 */

import {
  validateVideoHealth,
  auditFullCatalogHealth,
  calculateCourseHealthStatus,
} from '../lib/youtube/content-health'
import {
  getYouTubeThumbnailCascade,
  getPrimaryYouTubeThumbnail,
  resolveCourseThumbnail,
} from '../lib/youtube/thumbnail-helper'
import { normalizeYouTubeVideoUrl } from '../lib/video/normalizer'
import { defaultOfficialCourses, defaultOfficialModules, defaultOfficialLessons } from '../lib/mock-data'
import type { Course, Lesson } from '../lib/types'

async function runYouTubeContentHealthTests() {
  console.log('======================================================================')
  console.log('🛡️ RUNNING YOUTUBE CONTENT HEALTH & THUMBNAIL ENGINE AUDIT')
  console.log('======================================================================\n')

  // --- TEST 1: Public and Embeddable Video ---
  console.log('--- TEST 1: Public and Embeddable Video ---')
  const validNorm = normalizeYouTubeVideoUrl('8mei6uVttho')
  if (!validNorm.isValid || validNorm.videoId !== '8mei6uVttho') {
    throw new Error('Normalizer failed for valid YouTube ID')
  }
  const validResult = await validateVideoHealth('8mei6uVttho', {
    lessonTitle: 'Curso de Algoritmos #01',
    courseTitle: 'Curso de Algoritmos',
  })
  if (validResult.healthStatus !== 'HEALTHY' || !validResult.isEmbeddable) {
    throw new Error(`Expected HEALTHY, got: ${validResult.healthStatus}`)
  }
  console.log(`✓ TEST 1 PASSED: Video 8mei6uVttho is HEALTHY, embeddable: ${validResult.isEmbeddable}`)

  // --- TEST 2: Non-existent / Invalid Video ID ---
  console.log('\n--- TEST 2: Non-existent Video ID ---')
  const invalidResult = await validateVideoHealth('invalid_fake_id_123')
  if (invalidResult.healthStatus !== 'INVALID_ID' && invalidResult.healthStatus !== 'NOT_FOUND') {
    throw new Error(`Expected INVALID_ID/NOT_FOUND, got: ${invalidResult.healthStatus}`)
  }
  console.log(`✓ TEST 2 PASSED: Non-existent video blocked with status: ${invalidResult.healthStatus}`)

  // --- TEST 3: Private Video Filtering ---
  console.log('\n--- TEST 3: Private Video Handling ---')
  const fakePrivateLesson: Lesson = {
    id: 'l-test-private',
    moduleId: 'mod-logica',
    order: 99,
    title: 'Aula Privada Teste',
    type: 'video',
    durationMin: 20,
    description: 'Aula privada',
    videoId: 'dQw4w9WgXcQ_priv',
    availabilityStatus: 'private',
    isUnavailable: true,
  }
  const auditWithPrivate = auditFullCatalogHealth(
    defaultOfficialCourses,
    defaultOfficialModules,
    [...defaultOfficialLessons, fakePrivateLesson]
  )
  if (auditWithPrivate.privateVideos !== 1 || auditWithPrivate.withProblem < 1) {
    throw new Error('Audit did not detect private video')
  }
  console.log(`✓ TEST 3 PASSED: Private video flagged correctly (Count: ${auditWithPrivate.privateVideos})`)

  // --- TEST 4: Non-embeddable Video Filtering ---
  console.log('\n--- TEST 4: Non-embeddable Video Handling ---')
  const fakeNoEmbedLesson: Lesson = {
    id: 'l-test-noembed',
    moduleId: 'mod-logica',
    order: 100,
    title: 'Aula Sem Embed',
    type: 'video',
    durationMin: 15,
    description: 'Aula sem permissão de embed',
    videoId: 'no_embed_video',
    availabilityStatus: 'embed_disabled',
    embedAvailable: false,
    isUnavailable: true,
  }
  const auditWithNoEmbed = auditFullCatalogHealth(
    defaultOfficialCourses,
    defaultOfficialModules,
    [...defaultOfficialLessons, fakeNoEmbedLesson]
  )
  if (auditWithNoEmbed.notEmbeddable !== 1) {
    throw new Error('Audit did not detect embed_disabled video')
  }
  console.log(`✓ TEST 4 PASSED: Non-embeddable video flagged correctly (Count: ${auditWithNoEmbed.notEmbeddable})`)

  // --- TEST 5: Thumbnail Cascade Hierarchy ---
  console.log('\n--- TEST 5: Thumbnail Quality Hierarchy ---')
  const cascade = getYouTubeThumbnailCascade('8mei6uVttho')
  if (
    cascade.length !== 5 ||
    !cascade[0].includes('maxresdefault.jpg') ||
    !cascade[1].includes('sddefault.jpg') ||
    !cascade[2].includes('hqdefault.jpg')
  ) {
    throw new Error('Thumbnail cascade order is invalid')
  }
  console.log(`✓ TEST 5 PASSED: Thumbnail cascade has 5 ordered resolutions (MaxRes -> SD -> HQ -> MQ -> Default)`)

  // --- TEST 6: Primary Thumbnail Resolution ---
  console.log('\n--- TEST 6: Primary Thumbnail Resolution ---')
  const primaryThumb = getPrimaryYouTubeThumbnail('8mei6uVttho', true)
  if (!primaryThumb.includes('hqdefault.jpg')) {
    throw new Error('Primary high-res thumbnail should use hqdefault')
  }
  console.log(`✓ TEST 6 PASSED: Primary thumbnail resolved: ${primaryThumb}`)

  // --- TEST 7: Video Status Change / Revalidation ---
  console.log('\n--- TEST 7: Video Revalidation Detection ---')
  const revalResult = await validateVideoHealth('M2Af7gkbbro')
  if (!revalResult.hasThumbnail || !revalResult.isEmbeddable) {
    throw new Error('Revalidation failed for valid lesson')
  }
  console.log(`✓ TEST 7 PASSED: Revalidation confirmed active for M2Af7gkbbro (Score: ${revalResult.healthScore}%)`)

  // --- TEST 8: Course with Degraded Lesson Receives WARNING ---
  console.log('\n--- TEST 8: Course Health Score with Degraded Lesson ---')
  const mockDegradedLessons: Lesson[] = [
    ...defaultOfficialLessons.filter((l) => l.moduleId === 'mod-logica'),
    fakePrivateLesson,
  ]
  const courseHealth = calculateCourseHealthStatus(defaultOfficialCourses[0], mockDegradedLessons)
  if (courseHealth.status !== 'WARNING' || courseHealth.issues.length === 0) {
    throw new Error(`Expected WARNING, got: ${courseHealth.status}`)
  }
  console.log(`✓ TEST 8 PASSED: Course marked as ${courseHealth.status} (Valid: ${courseHealth.validLessonsCount}/${courseHealth.totalLessonsCount})`)

  // --- TEST 9: Course Thumbnail Inheritance from Valid Lesson ---
  console.log('\n--- TEST 9: Course Thumbnail Inheritance ---')
  const courseWithoutThumb: Course = {
    ...defaultOfficialCourses[0],
    thumbnailUrl: '',
  }
  const resolvedCourseThumb = resolveCourseThumbnail(courseWithoutThumb, defaultOfficialLessons)
  if (!resolvedCourseThumb || !resolvedCourseThumb.includes('img.youtube.com')) {
    throw new Error('Course thumbnail inheritance failed')
  }
  console.log(`✓ TEST 9 PASSED: Course inherited thumbnail from lesson 1: ${resolvedCourseThumb}`)

  // --- TEST 10: Full Catalog Audit Scan ---
  console.log('\n--- TEST 10: Full Production Catalog Audit Scan ---')
  const fullAudit = auditFullCatalogHealth(
    defaultOfficialCourses,
    defaultOfficialModules,
    defaultOfficialLessons
  )
  console.log(`Audit Summary: Total=${fullAudit.totalVideos}, Valid=${fullAudit.validVideos}, Score=${fullAudit.overallHealthScore}%`)
  if (fullAudit.totalVideos === 0 || fullAudit.validVideos !== fullAudit.totalVideos) {
    throw new Error('Official production catalog contains broken default lessons')
  }
  console.log(`✓ TEST 10 PASSED: All ${fullAudit.totalVideos} default lessons in catalog are 100% HEALTHY`)

  // --- TEST 11: Normalizer Protection Against Edge Cases ---
  console.log('\n--- TEST 11: URL Normalizer Robustness ---')
  const testUrls = [
    'https://www.youtube.com/watch?v=8mei6uVttho',
    'https://youtu.be/8mei6uVttho',
    'https://www.youtube.com/embed/8mei6uVttho',
    'https://www.youtube.com/shorts/8mei6uVttho',
    '8mei6uVttho',
  ]
  for (const u of testUrls) {
    const res = normalizeYouTubeVideoUrl(u)
    if (!res.isValid || res.videoId !== '8mei6uVttho') {
      throw new Error(`Normalizer failed for URL: ${u}`)
    }
  }
  console.log(`✓ TEST 11 PASSED: All 5 YouTube URL variations correctly resolved to 8mei6uVttho`)

  // --- TEST 12: Empty / Unavailable Graceful Fallback ---
  console.log('\n--- TEST 12: Graceful Empty State ---')
  const emptyThumb = resolveCourseThumbnail({ ...defaultOfficialCourses[0], thumbnailUrl: '' }, [])
  if (emptyThumb !== '') {
    throw new Error('Expected empty string for course with no thumbnail and no lessons')
  }
  console.log(`✓ TEST 12 PASSED: Graceful empty thumbnail returned without inventing fake AI image`)

  console.log('\n======================================================================')
  console.log('🏆 ALL 12 YOUTUBE CONTENT HEALTH & THUMBNAIL SCENARIOS PASSED 100%')
  console.log('======================================================================')
}

runYouTubeContentHealthTests().catch((err) => {
  console.error('YouTube Content Health Audit Failure:', err)
  process.exit(1)
})
