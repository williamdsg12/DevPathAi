/**
 * Database Repository & Persistence Layer for YouTube Courses & Pedagogical Catalog
 *
 * Implements strict relational persistence into PostgreSQL / Supabase:
 * 1. content_sources (Channel / Source)
 * 2. youtube_playlists (Course Playlist)
 * 3. courses (Course Entity)
 * 4. modules (Learning Module)
 * 5. youtube_videos (Canonical Video Entity)
 * 6. lessons (Course Lesson Entity)
 * 7. catalog_audit_logs (Immutable Audit Trail)
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { defaultOfficialCourses, defaultOfficialModules, defaultOfficialLessons, defaultContentSources } from '@/lib/mock-data'
import { resolveCourseThumbnail, getPrimaryYouTubeThumbnail } from '@/lib/youtube/thumbnail-helper'
import type { Course, LearningModule, Lesson, ContentSource, YouTubePlaylist } from '@/lib/types'

export interface PersistCoursePackagePayload {
  course: Course
  modules: LearningModule[]
  lessons: Lesson[]
  playlist?: YouTubePlaylist
  channel?: ContentSource
  adminEmail?: string
}

export interface PersistenceResult {
  success: boolean
  courseId: string
  persistedCounts: {
    courses: number
    modules: number
    lessons: number
    videos: number
    playlists: number
  }
  error?: string
}

/**
 * Persists a complete Course entity, its modules, lessons, playlist and videos into Supabase.
 */
export async function persistCoursePackageToDatabase(
  payload: PersistCoursePackagePayload
): Promise<PersistenceResult> {
  const client = createServerSupabaseClient()
  const course = payload.course
  const modules = payload.modules || []
  const lessons = payload.lessons || []
  const pl = payload.playlist
  const ch = payload.channel
  const adminEmail = payload.adminEmail || 'system@devpath.ai'

  if (!client) {
    return {
      success: false,
      courseId: course.id,
      persistedCounts: { courses: 0, modules: 0, lessons: 0, videos: 0, playlists: 0 },
      error: 'Supabase client is not configured or offline.',
    }
  }

  try {
    // 1. Persist Content Source (if provided)
    if (ch && ch.id) {
      const sourcePayload = {
        id: ch.id,
        name: ch.name,
        source_type: ch.sourceType || 'youtube_channel',
        channel_id: ch.channelId || ch.id,
        channel_url: ch.channelUrl || `https://www.youtube.com/@${ch.handle || ch.name}`,
        handle: ch.handle || `@${ch.name}`,
        description: ch.description || '',
        channel_thumbnail: ch.channelThumbnail || '',
        priority: ch.priority || 100,
        is_trusted: ch.isTrusted ?? true,
        is_active: ch.isActive ?? true,
        auto_classify: ch.autoClassify ?? true,
        playlists_count: ch.playlistsCount || 1,
        videos_count: ch.videosCount || lessons.length,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await client.from('content_sources').upsert(sourcePayload)
    }

    // 2. Persist YouTube Playlist (if provided or referenced)
    const playlistId = pl?.youtubePlaylistId || course.playlistId || (course.id.startsWith('crs-') ? course.id.replace('crs-', '') : course.id)
    if (playlistId) {
      const playlistPayload = {
        id: playlistId,
        youtube_playlist_id: playlistId,
        channel_id: ch?.channelId || ch?.id || pl?.channelId || null,
        channel_title: pl?.channelTitle || ch?.name || course.channelTitle || 'YouTube',
        title: pl?.title || course.title,
        description: pl?.description || course.description || '',
        thumbnail_url: pl?.thumbnailUrl || course.thumbnailUrl || getPrimaryYouTubeThumbnail(lessons[0]?.videoId || ''),
        youtube_url: pl?.youtubeUrl || course.playlistUrl || `https://www.youtube.com/playlist?list=${playlistId}`,
        item_count: pl?.itemCount || lessons.length,
        video_count: pl?.videoCount || lessons.length,
        category: pl?.category || course.category || 'Fundamentos da Programação',
        technology: pl?.technology || course.technology || 'Desenvolvimento Web',
        level: pl?.level || course.level || 'iniciante',
        status: pl?.status || course.status || 'ativo',
        classification_confidence: pl?.classificationConfidence || 100,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await client.from('youtube_playlists').upsert(playlistPayload)
    }

    // 3. Persist Course Entity
    const courseThumbnail = resolveCourseThumbnail(course, lessons)
    const coursePayload = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      level: course.level,
      technology: course.technology,
      category: course.category,
      thumbnail_url: courseThumbnail,
      status: course.status || 'ativo',
      channel_title: course.channelTitle || ch?.name || 'Curso em Vídeo',
      playlist_id: playlistId || null,
      playlist_url: course.playlistUrl || (playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : null),
      modules_count: modules.length || course.modulesCount || 1,
      lessons_count: lessons.length || course.lessonsCount || 0,
      total_hours: course.totalHours || Math.max(1, Math.round(lessons.reduce((acc, l) => acc + (l.durationMin || 15), 0) / 60)),
      prerequisites: course.prerequisites || [],
      skills: course.skills || [course.technology],
      content_state: 'publicado',
      canonical_url: course.playlistUrl || null,
      author_channel: course.channelTitle || ch?.name || null,
      updated_at: new Date().toISOString(),
    }
    const { error: courseErr } = await client.from('courses').upsert(coursePayload)
    if (courseErr) {
      throw new Error(`Erro ao persistir curso no banco: ${courseErr.message}`)
    }

    // 4. Persist Modules
    for (const mod of modules) {
      const modulePayload = {
        id: mod.id,
        course_id: course.id,
        order_index: mod.order || 1,
        phase: mod.phase || course.category,
        phase_order: mod.phaseOrder || 1,
        title: mod.title,
        slug: `${course.slug}-${mod.order || 1}`,
        description: mod.description || '',
        objective: mod.objective || '',
        icon: mod.icon || 'code',
        has_project: mod.hasProject ?? false,
        has_assessment: mod.hasAssessment ?? true,
        estimated_hours: mod.estimatedHours || 10,
        skills: mod.skills || [course.technology],
        updated_at: new Date().toISOString(),
      }
      const { error: modErr } = await client.from('modules').upsert(modulePayload)
      if (modErr) {
        console.warn(`[db-repository] Notice on module upsert: ${modErr.message}`)
      }
    }

    // 5. Persist YouTube Videos & Lessons in Chunks
    const chunkSize = 50
    for (let i = 0; i < lessons.length; i += chunkSize) {
      const chunk = lessons.slice(i, i + chunkSize)

      // 5a. Videos table
      const videosPayload = chunk.map((l) => ({
        id: `vid-${l.videoId || l.externalVideoId || l.id}`,
        youtube_video_id: l.videoId || l.externalVideoId || l.id,
        playlist_id: playlistId || null,
        title: l.title,
        description: l.description || '',
        channel_id: ch?.channelId || null,
        channel_title: l.source || course.channelTitle || 'YouTube',
        thumbnail_url: l.thumbnailUrl || (l.videoId ? getPrimaryYouTubeThumbnail(l.videoId) : null),
        duration_seconds: (l.durationMin || 15) * 60,
        position: l.order,
        youtube_url: l.videoUrl || (l.videoId ? `https://www.youtube.com/watch?v=${l.videoId}` : ''),
        technology: l.technology || course.technology,
        topic: l.topic || l.title,
        level: course.level,
        status: l.isUnavailable ? 'indisponivel' : 'ativo',
        is_unavailable: l.isUnavailable ?? false,
        updated_at: new Date().toISOString(),
      }))
      await client.from('youtube_videos').upsert(videosPayload)

      // 5b. Lessons table
      const lessonsPayload = chunk.map((l) => ({
        id: l.id,
        course_id: course.id,
        module_id: l.moduleId || modules[0]?.id || `mod-${course.id}`,
        playlist_id: playlistId || null,
        order_index: l.order,
        title: l.title,
        slug: `${course.slug}-aula-${l.order}`,
        type: l.type || 'video',
        duration_min: l.durationMin || 15,
        description: l.description || '',
        video_id: l.videoId || l.externalVideoId || null,
        external_video_id: l.externalVideoId || l.videoId || null,
        video_url: l.videoUrl || (l.videoId ? `https://www.youtube.com/watch?v=${l.videoId}` : null),
        source_label: l.source || course.channelTitle || 'Curso em Vídeo',
        source_type: l.sourceType || 'youtube',
        thumbnail_url: l.thumbnailUrl || (l.videoId ? getPrimaryYouTubeThumbnail(l.videoId) : null),
        availability_status: l.availabilityStatus || (l.isUnavailable ? 'removed' : 'available'),
        youtube_exists: l.youtubeExists ?? !l.isUnavailable,
        embed_available: l.embedAvailable ?? true,
        last_checked_at: l.lastCheckedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      const { error: lessonErr } = await client.from('lessons').upsert(lessonsPayload)
      if (lessonErr) {
        console.warn(`[db-repository] Notice on lesson upsert chunk: ${lessonErr.message}`)
      }
    }

    // 6. Record Audit Log
    try {
      await client.from('catalog_audit_logs').insert({
        action: 'create',
        target_type: 'course',
        target_id: course.id,
        target_title: course.title,
        admin_email: adminEmail,
        details: `Curso "${course.title}" persistido com ${modules.length} módulos e ${lessons.length} aulas.`,
        changes: {
          lessonsCount: lessons.length,
          modulesCount: modules.length,
          playlistId,
          technology: course.technology,
        },
      })
    } catch {
      // Non-blocking audit log notice
    }

    return {
      success: true,
      courseId: course.id,
      persistedCounts: {
        courses: 1,
        modules: modules.length,
        lessons: lessons.length,
        videos: lessons.length,
        playlists: playlistId ? 1 : 0,
      },
    }
  } catch (err: any) {
    console.error('[db-repository] Persistence failure:', err)
    return {
      success: false,
      courseId: course.id,
      persistedCounts: { courses: 0, modules: 0, lessons: 0, videos: 0, playlists: 0 },
      error: err.message || 'Erro inesperado ao salvar curso no banco de dados.',
    }
  }
}

/**
 * Loads the complete authentic catalog from Supabase database.
 * If database is empty, seeds the official verified courses into Supabase.
 */
export async function fetchCatalogFromDatabase(): Promise<{
  courses: Course[]
  modules: LearningModule[]
  lessons: Lesson[]
  playlists: YouTubePlaylist[]
  sources: ContentSource[]
}> {
  const client = createServerSupabaseClient()
  if (!client) {
    return {
      courses: defaultOfficialCourses,
      modules: defaultOfficialModules,
      lessons: defaultOfficialLessons,
      playlists: [],
      sources: defaultContentSources,
    }
  }

  try {
    const [coursesRes, modulesRes, lessonsRes, playlistsRes, sourcesRes] = await Promise.all([
      client.from('courses').select('*').order('created_at', { ascending: false }),
      client.from('modules').select('*').order('order_index', { ascending: true }),
      client.from('lessons').select('*').order('order_index', { ascending: true }),
      client.from('youtube_playlists').select('*').order('created_at', { ascending: false }),
      client.from('content_sources').select('*').order('priority', { ascending: false }),
    ])

    let courses = coursesRes.data || []
    let modules = modulesRes.data || []
    let lessons = lessonsRes.data || []
    let playlists = playlistsRes.data || []
    let sources = sourcesRes.data || []

    // If database is completely empty, seed the official courses
    if (courses.length === 0) {
      console.log('[db-repository] Database is empty. Seeding official courses into Supabase...')
      await seedInitialCatalogToDatabase()

      return {
        courses: defaultOfficialCourses,
        modules: defaultOfficialModules,
        lessons: defaultOfficialLessons,
        playlists: [],
        sources: defaultContentSources,
      }
    }

    // Map DB columns to domain entities
    const domainCourses: Course[] = courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description || '',
      level: c.level || 'iniciante',
      technology: c.technology || 'Lógica & Programação',
      category: c.category || 'Fundamentos da Programação',
      thumbnailUrl: c.thumbnail_url || '',
      status: c.status || 'ativo',
      channelTitle: c.channel_title || 'Curso em Vídeo',
      playlistId: c.playlist_id || undefined,
      playlistUrl: c.playlist_url || undefined,
      modulesCount: c.modules_count || 1,
      lessonsCount: c.lessons_count || 0,
      totalHours: c.total_hours || 1,
      prerequisites: c.prerequisites || [],
      skills: c.skills || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }))

    const domainModules: LearningModule[] = modules.map((m: any) => ({
      id: m.id,
      courseId: m.course_id || undefined,
      order: m.order_index || 1,
      phase: m.phase || 'Fundamentos da Programação',
      phaseOrder: m.phase_order || 1,
      title: m.title,
      technology: m.title.includes('JavaScript') ? 'JavaScript' : m.title.includes('HTML') ? 'HTML5 & CSS3' : 'Lógica & Algoritmos',
      description: m.description || '',
      objective: m.objective || '',
      icon: m.icon || 'code',
      prerequisites: [],
      lessonIds: lessons.filter((l: any) => l.module_id === m.id).map((l: any) => l.id),
      exerciseCount: 10,
      hasProject: m.has_project ?? false,
      hasAssessment: m.has_assessment ?? true,
      estimatedHours: m.estimated_hours || 10,
      skills: m.skills || [],
    }))

    const domainLessons: Lesson[] = lessons.map((l: any) => ({
      id: l.id,
      moduleId: l.module_id,
      order: l.order_index || 1,
      title: l.title,
      type: l.type || 'video',
      durationMin: l.duration_min || 15,
      description: l.description || '',
      videoId: l.video_id || l.external_video_id || undefined,
      externalVideoId: l.external_video_id || l.video_id || undefined,
      videoUrl: l.video_url || (l.video_id ? `https://www.youtube.com/watch?v=${l.video_id}` : undefined),
      source: l.source_label || 'Curso em Vídeo (Gustavo Guanabara)',
      sourceType: l.source_type || 'youtube',
      playlistId: l.playlist_id || undefined,
      technology: domainCourses.find((c) => c.id === l.course_id)?.technology || 'Lógica & Algoritmos',
      topic: l.title,
      thumbnailUrl: l.thumbnail_url || (l.video_id ? getPrimaryYouTubeThumbnail(l.video_id) : undefined),
      availabilityStatus: l.availability_status || 'available',
      youtubeExists: l.youtube_exists ?? true,
      embedAvailable: l.embed_available ?? true,
      lastCheckedAt: l.last_checked_at || new Date().toISOString(),
      isUnavailable: l.availability_status === 'removed' || l.availability_status === 'private',
    }))

    const domainPlaylists: YouTubePlaylist[] = playlists.map((p: any) => ({
      id: p.id,
      youtubePlaylistId: p.youtube_playlist_id || p.id,
      channelId: p.channel_id || undefined,
      channelTitle: p.channel_title || 'YouTube',
      title: p.title,
      description: p.description || '',
      thumbnailUrl: p.thumbnail_url || '',
      youtubeUrl: p.youtube_url || `https://www.youtube.com/playlist?list=${p.youtube_playlist_id || p.id}`,
      itemCount: p.item_count || 0,
      videoCount: p.video_count || 0,
      category: p.category || 'Fundamentos da Programação',
      technology: p.technology || 'Desenvolvimento Web',
      level: p.level || 'iniciante',
      status: p.status || 'ativo',
      classificationConfidence: p.classification_confidence || 100,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))

    const domainSources: ContentSource[] = sources.map((s: any) => ({
      id: s.id,
      name: s.name,
      sourceType: s.source_type || 'youtube_channel',
      channelId: s.channel_id || s.id,
      channelUrl: s.channel_url || '',
      handle: s.handle || `@${s.name}`,
      channelThumbnail: s.channel_thumbnail || '',
      description: s.description || '',
      priority: s.priority || 100,
      isTrusted: s.is_trusted ?? true,
      isActive: s.is_active ?? true,
      autoClassify: s.auto_classify ?? true,
      playlistsCount: s.playlists_count || 0,
      videosCount: s.videos_count || 0,
      lastSyncedAt: s.last_synced_at,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }))

    return {
      courses: domainCourses,
      modules: domainModules,
      lessons: domainLessons,
      playlists: domainPlaylists,
      sources: domainSources,
    }
  } catch (err: any) {
    console.error('[db-repository] Error fetching catalog from Supabase:', err)
    return {
      courses: defaultOfficialCourses,
      modules: defaultOfficialModules,
      lessons: defaultOfficialLessons,
      playlists: [],
      sources: defaultContentSources,
    }
  }
}

/**
 * Seeds the verified default official catalog into the Supabase database.
 */
export async function seedInitialCatalogToDatabase(): Promise<boolean> {
  try {
    for (const course of defaultOfficialCourses) {
      const courseModules = defaultOfficialModules.filter(
        (m) => m.courseId === course.id || m.phase === course.category
      )
      const courseLessons = defaultOfficialLessons.filter((l) =>
        courseModules.some((m) => m.id === l.moduleId)
      )

      await persistCoursePackageToDatabase({
        course,
        modules: courseModules,
        lessons: courseLessons,
        channel: defaultContentSources[0],
      })
    }
    return true
  } catch (err) {
    console.error('[db-repository] Seed failure:', err)
    return false
  }
}
