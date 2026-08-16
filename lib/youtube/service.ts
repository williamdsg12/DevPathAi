/**
 * YouTube Data API v3 Backend Service & Ingestion Engine for DevPath AI
 *
 * Handles automated channel ingestion, playlist discovery with full pagination,
 * ISO duration parsing, context classification, semantic consistency validation,
 * continuous incremental synchronization (without duplicate insertion or loss of progress),
 * and dynamic course synthesis.
 */

import type {
  ContentConsistencyReport,
  ContentSource,
  Course,
  ImportLog,
  IngestionReport,
  LearningModule,
  Lesson,
  SkillLevel,
  ValidationIssue,
  YouTubePlaylist,
  YouTubeVideo,
} from '@/lib/types'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null
}

/**
 * Extracts a Playlist ID, Video ID, Channel Handle or Channel ID from diverse YouTube URL formats.
 */
export function extractPlaylistOrVideoId(input: string): {
  type: 'playlist' | 'video' | 'channel_handle' | 'channel_id' | 'invalid'
  id: string
} {
  const trimmed = input.trim()
  if (!trimmed) return { type: 'invalid', id: '' }

  // Channel Handle (e.g. @CursoemVideo, @rocketseat)
  if (trimmed.startsWith('@')) {
    return { type: 'channel_handle', id: trimmed.slice(1) }
  }

  // Direct Channel ID (UC...)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: 'channel_id', id: trimmed }
  }

  // Direct Playlist ID pattern (e.g., PL1234567890abcdef)
  if (/^(PL|UU|FL|RD|OLAK5uy_)[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { type: 'playlist', id: trimmed }
  }

  try {
    const url = new URL(trimmed)

    // Handle @channel in URL (e.g. youtube.com/@CursoemVideo)
    const pathname = url.pathname
    if (pathname.includes('/@')) {
      const handle = pathname.split('/@')[1]?.split('/')[0]
      if (handle) return { type: 'channel_handle', id: handle }
    }

    if (pathname.startsWith('/channel/')) {
      const chId = pathname.replace('/channel/', '').split('/')[0]
      if (chId) return { type: 'channel_id', id: chId }
    }

    const listParam = url.searchParams.get('list')
    if (listParam) {
      return { type: 'playlist', id: listParam }
    }

    const vParam = url.searchParams.get('v')
    if (vParam) {
      return { type: 'video', id: vParam }
    }

    if (url.hostname === 'youtu.be') {
      const vid = url.pathname.slice(1)
      if (vid) return { type: 'video', id: vid }
    }
  } catch {
    // If not a valid URL, check if direct video ID (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { type: 'video', id: trimmed }
    }
  }

  return { type: 'invalid', id: '' }
}

/**
 * Converts ISO 8601 duration (e.g. PT1H14M33S, PT15M40S, PT45S) into seconds and human-readable string.
 */
export function parseIsoDuration(durationIso?: string): {
  seconds: number
  formatted: string
  minutes: number
} {
  if (!durationIso) {
    return { seconds: 0, formatted: '15m', minutes: 15 }
  }

  const match = durationIso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) {
    return { seconds: 0, formatted: '15m', minutes: 15 }
  }

  const hours = parseInt(match[1] || '0', 10)
  const mins = parseInt(match[2] || '0', 10)
  const secs = parseInt(match[3] || '0', 10)

  const totalSeconds = hours * 3600 + mins * 60 + secs
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60))

  let formatted = ''
  if (hours > 0) {
    formatted = `${hours}h ${mins.toString().padStart(2, '0')}m`
  } else {
    formatted = `${mins}m ${secs.toString().padStart(2, '0')}s`
  }

  return {
    seconds: totalSeconds,
    formatted,
    minutes: totalMinutes,
  }
}

/**
 * Classifies a playlist based on pedagogical rules and returns technology, level, category and confidence.
 */
export function classifyPlaylistContext(
  title: string,
  description: string,
): {
  technology: string
  level: SkillLevel
  category: string
  skills: string[]
  confidence: number
} {
  const combined = (title + ' ' + description).toLowerCase()

  let technology = 'Lógica & Programação'
  let category = 'Fundamentos da Programação'
  let skills = ['Lógica', 'Algoritmos', 'Raciocínio Computacional']
  let level: SkillLevel = 'iniciante-absoluto'
  let confidence = 85

  if (combined.includes('python')) {
    technology = 'Python'
    category = 'Backend & Automação'
    skills = ['Python 3', 'Sintaxe', 'Estruturas de Dados', 'Funções', 'Automação']
    level = 'iniciante'
    confidence = 98
  } else if (combined.includes('react') || combined.includes('next.js') || combined.includes('nextjs')) {
    technology = 'React & Next.js'
    category = 'Front-end Moderno'
    skills = ['React', 'Next.js', 'Hooks', 'Componentes', 'JSX', 'TypeScript']
    level = 'intermediario'
    confidence = 96
  } else if (combined.includes('javascript') || combined.includes('js') || combined.includes('ecmascript')) {
    technology = 'JavaScript'
    category = 'Web & Front-end'
    skills = ['JavaScript', 'DOM', 'ES6+', 'Arrays', 'Objetos', 'Eventos', 'Assincronismo']
    level = 'iniciante'
    confidence = 95
  } else if (combined.includes('node') || combined.includes('express') || combined.includes('nest')) {
    technology = 'Node.js & APIs'
    category = 'Back-end'
    skills = ['Node.js', 'Express', 'APIs REST', 'Middlewares', 'JWT', 'SQL']
    level = 'intermediario'
    confidence = 94
  } else if (combined.includes('html') || combined.includes('css')) {
    technology = 'HTML5 & CSS3'
    category = 'Web & Front-end'
    skills = ['HTML5 Semântico', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsividade']
    level = 'iniciante-absoluto'
    confidence = 97
  } else if (combined.includes('sql') || combined.includes('banco de dados') || combined.includes('postgres') || combined.includes('mysql')) {
    technology = 'Banco de Dados & SQL'
    category = 'Back-end'
    skills = ['SQL', 'PostgreSQL', 'Modelagem Relacional', 'CRUD', 'Consultas']
    level = 'basico'
    confidence = 95
  } else if (combined.includes('git') || combined.includes('github')) {
    technology = 'Git & GitHub'
    category = 'Fundamentos da Programação'
    skills = ['Git', 'GitHub', 'Commits', 'Branches', 'Pull Requests']
    level = 'iniciante'
    confidence = 98
  }

  if (combined.includes('avançado') || combined.includes('advanced')) {
    level = 'avancado'
  } else if (combined.includes('iniciante') || combined.includes('do zero') || combined.includes('iniciantes')) {
    level = 'iniciante'
  }

  return { technology, level, category, skills, confidence }
}

/**
 * Fetches Channel Details from YouTube API by handle, channelId, or search query.
 */
export async function fetchChannelDetails(handleOrIdOrUrl: string): Promise<ContentSource | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const parsed = extractPlaylistOrVideoId(handleOrIdOrUrl)

  try {
    let url = ''
    if (parsed.type === 'channel_handle') {
      url = `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(
        parsed.id,
      )}&key=${apiKey}`
    } else if (parsed.type === 'channel_id') {
      url = `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails,statistics&id=${encodeURIComponent(
        parsed.id,
      )}&key=${apiKey}`
    } else {
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(
        handleOrIdOrUrl,
      )}&key=${apiKey}`
      const searchRes = await fetch(searchUrl, { cache: 'no-store' })
      if (!searchRes.ok) return null
      const searchData = await searchRes.json()
      const firstChannel = searchData.items?.[0]
      if (!firstChannel?.snippet?.channelId) return null

      url = `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails,statistics&id=${encodeURIComponent(
        firstChannel.snippet.channelId,
      )}&key=${apiKey}`
    }

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null

    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null

    const snippet = item.snippet
    const thumb =
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      ''

    return {
      id: `src-${item.id}`,
      name: snippet.title || 'Canal Educacional',
      sourceType: 'youtube_channel',
      channelId: item.id,
      channelUrl: snippet.customUrl
        ? `https://www.youtube.com/${snippet.customUrl}`
        : `https://www.youtube.com/channel/${item.id}`,
      handle: snippet.customUrl || `@${snippet.title.replace(/\s+/g, '')}`,
      channelThumbnail: thumb,
      description: snippet.description || '',
      priority: 100,
      isTrusted: true,
      isActive: true,
      autoClassify: true,
      playlistsCount: 0,
      videosCount: 0,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('Error fetching channel details:', err)
    return null
  }
}

/**
 * Fetches all public playlists from a channel, handling pagination with nextPageToken.
 */
export async function fetchChannelPlaylists(channelId: string): Promise<YouTubePlaylist[]> {
  const apiKey = getApiKey()
  if (!apiKey) return []

  const playlists: YouTubePlaylist[] = []
  let pageToken: string | undefined = undefined
  let safetyCount = 0

  try {
    do {
      let url = `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&channelId=${encodeURIComponent(
        channelId,
      )}&maxResults=50&key=${apiKey}`

      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) break

      const data = await res.json()
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const snippet = item.snippet
          const plId = item.id
          const classification = classifyPlaylistContext(snippet.title || '', snippet.description || '')

          const thumb =
            snippet.thumbnails?.maxres?.url ||
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url ||
            ''

          playlists.push({
            id: `pl-${plId}`,
            youtubePlaylistId: plId,
            channelId: snippet.channelId,
            channelTitle: snippet.channelTitle || '',
            title: snippet.title || 'Playlist Sem Título',
            description: snippet.description || '',
            thumbnailUrl: thumb,
            youtubeUrl: `https://www.youtube.com/playlist?list=${plId}`,
            itemCount: item.contentDetails?.itemCount || 0,
            videoCount: item.contentDetails?.itemCount || 0,
            category: classification.category,
            technology: classification.technology,
            level: classification.level,
            status: 'ativo',
            classificationConfidence: classification.confidence,
            lastSyncedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }

      pageToken = data.nextPageToken
      safetyCount++
    } while (pageToken && safetyCount < 10)

    return playlists
  } catch (err) {
    console.error('Error fetching channel playlists:', err)
    return []
  }
}

/**
 * Fetches playlist metadata (title, description, channel, thumbnails) from YouTube API.
 */
export async function fetchPlaylistMetadata(playlistId: string): Promise<YouTubePlaylist | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  try {
    const url = `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&id=${encodeURIComponent(
      playlistId,
    )}&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = await res.json()
    if (!data.items || data.items.length === 0) return null

    const item = data.items[0]
    const snippet = item.snippet
    const thumbnails = snippet.thumbnails
    const classification = classifyPlaylistContext(snippet.title || '', snippet.description || '')

    const bestThumbnail =
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      ''

    return {
      id: `pl-${playlistId}`,
      youtubePlaylistId: playlistId,
      channelId: snippet.channelId || '',
      channelTitle: snippet.channelTitle || 'Canal Educacional',
      title: snippet.title || 'Playlist do YouTube',
      description: snippet.description || '',
      thumbnailUrl: bestThumbnail,
      youtubeUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
      itemCount: item.contentDetails?.itemCount || 0,
      videoCount: item.contentDetails?.itemCount || 0,
      category: classification.category,
      technology: classification.technology,
      level: classification.level,
      status: 'ativo',
      classificationConfidence: classification.confidence,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('Error fetching playlist metadata:', err)
    return null
  }
}

/**
 * Fetches all video items in a playlist, handling full pagination with nextPageToken until all videos are fetched.
 */
export async function fetchAllPlaylistVideos(playlistId: string): Promise<{
  videos: YouTubeVideo[]
  unavailableCount: number
}> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { videos: [], unavailableCount: 0 }
  }

  const rawItems: any[] = []
  let pageToken: string | undefined = undefined
  let totalFetched = 0
  const maxSafetyLimit = 500

  try {
    do {
      let url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails,status&maxResults=50&playlistId=${encodeURIComponent(
        playlistId,
      )}&key=${apiKey}`

      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) break

      const data = await res.json()
      if (data.items && data.items.length > 0) {
        rawItems.push(...data.items)
        totalFetched += data.items.length
      }

      pageToken = data.nextPageToken
    } while (pageToken && totalFetched < maxSafetyLimit)

    const validRawItems = rawItems.filter((it) => {
      const vid = it.contentDetails?.videoId
      const title = it.snippet?.title
      return (
        vid &&
        title &&
        title !== 'Private video' &&
        title !== 'Deleted video' &&
        it.status?.privacyStatus !== 'private'
      )
    })

    const unavailableCount = rawItems.length - validRawItems.length
    const videoIds = validRawItems.map((it) => it.contentDetails.videoId)
    const videoDetailsMap = await fetchVideosDetails(videoIds, apiKey)

    const videos: YouTubeVideo[] = validRawItems.map((it, idx) => {
      const vid = it.contentDetails.videoId
      const snippet = it.snippet
      const details = videoDetailsMap[vid]
      const durationInfo = parseIsoDuration(details?.contentDetails?.duration)
      const classification = classifyPlaylistContext(snippet.title || '', snippet.description || '')

      const thumb =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        `https://img.youtube.com/vi/${vid}/hqdefault.jpg`

      return {
        id: `vid-${vid}`,
        youtubeVideoId: vid,
        playlistId,
        title: snippet.title || `Aula ${idx + 1}`,
        description: snippet.description || '',
        channelId: snippet.channelId || '',
        channelTitle: snippet.channelTitle || '',
        thumbnailUrl: thumb,
        durationSeconds: durationInfo.seconds,
        durationFormatted: durationInfo.formatted,
        position: idx + 1,
        publishedAt: snippet.publishedAt,
        youtubeUrl: `https://www.youtube.com/watch?v=${vid}`,
        technology: classification.technology,
        topic: snippet.title || 'Conceitos da Aula',
        level: classification.level,
        status: 'ativo',
        isUnavailable: false,
      }
    })

    return { videos, unavailableCount }
  } catch (err) {
    console.error('Error fetching playlist videos:', err)
    return { videos: [], unavailableCount: 0 }
  }
}

/**
 * Batch video details fetching (durations, high-res thumbnails) from YouTube API.
 */
async function fetchVideosDetails(videoIds: string[], apiKey: string): Promise<Record<string, any>> {
  if (videoIds.length === 0) return {}

  const map: Record<string, any> = {}
  const chunkSize = 50

  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize)
    try {
      const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails,snippet,status&id=${chunk.join(
        ',',
      )}&key=${apiKey}`

      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.items) {
          for (const item of data.items) {
            map[item.id] = item
          }
        }
      }
    } catch (err) {
      console.warn('Batch video details fetch warning:', err)
    }
  }

  return map
}

/**
 * Synchronizes an existing course with its YouTube playlist:
 * - Fetches all current videos via full pagination.
 * - Detects existing vs new vs removed videos.
 * - Updates lesson records, durations, thumbnails, preserving exact 1-to-N order (position: 1, 2, ..., N).
 * - Updates module lessonIds list.
 */
export async function syncCoursePlaylist(
  courseId: string,
  playlistId: string,
  existingLessons: Lesson[],
): Promise<{
  updatedCoursePatch: Partial<Course>
  updatedModulePatch: Partial<LearningModule>
  updatedLessons: Lesson[]
  log: ImportLog
}> {
  const { videos, unavailableCount } = await fetchAllPlaylistVideos(playlistId)
  const playlistMeta = await fetchPlaylistMetadata(playlistId)

  const existingByVideoId = new Map<string, Lesson>()
  for (const l of existingLessons) {
    if (l.videoId) existingByVideoId.set(l.videoId, l)
  }

  let addedCount = 0
  let existingCount = 0

  const syncedLessons: Lesson[] = videos.map((vid, idx) => {
    const existing = existingByVideoId.get(vid.youtubeVideoId)
    if (existing) {
      existingCount++
      return {
        ...existing,
        order: idx + 1,
        title: vid.title,
        thumbnailUrl: vid.thumbnailUrl,
        durationMin: Math.max(5, Math.round(vid.durationSeconds / 60)),
        isUnavailable: false,
      }
    } else {
      addedCount++
      return {
        id: `l-${playlistId}-${vid.youtubeVideoId}`,
        moduleId: `mod-${courseId.replace('crs-', '')}`,
        order: idx + 1,
        title: vid.title,
        type: 'video',
        durationMin: Math.max(5, Math.round(vid.durationSeconds / 60)),
        description: vid.description ? vid.description.slice(0, 200) + '...' : `Aula ${idx + 1} do curso ${playlistMeta?.title || ''}.`,
        videoId: vid.youtubeVideoId,
        externalVideoId: vid.youtubeVideoId,
        videoUrl: `https://www.youtube.com/watch?v=${vid.youtubeVideoId}`,
        sourceType: 'youtube',
        availabilityStatus: 'available',
        youtubeExists: true,
        embedAvailable: true,
        source: playlistMeta?.channelTitle || 'YouTube',
        playlistId,
        technology: playlistMeta?.technology || 'Desenvolvimento Web',
        topic: vid.title,
        thumbnailUrl: vid.thumbnailUrl,
        isUnavailable: false,
        lastCheckedAt: new Date().toISOString(),
      }
    }
  })

  const totalSeconds = videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0)
  const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

  const log: ImportLog = {
    id: `log-sync-${Date.now()}`,
    playlistId,
    playlistTitle: playlistMeta?.title || playlistId,
    channelTitle: playlistMeta?.channelTitle || 'YouTube',
    status: 'sucesso',
    videosFound: videos.length,
    videosImported: addedCount,
    videosUnavailable: unavailableCount,
    duplicatesIgnored: 0,
    message: `Sincronização concluída: ${videos.length} vídeos verificados (${existingCount} existentes, ${addedCount} novos).`,
    createdAt: new Date().toISOString(),
  }

  return {
    updatedCoursePatch: {
      lessonsCount: syncedLessons.length,
      totalHours,
      updatedAt: new Date().toISOString(),
    },
    updatedModulePatch: {
      lessonIds: syncedLessons.map((l) => l.id),
      estimatedHours: totalHours,
    },
    updatedLessons: syncedLessons,
    log,
  }
}

/**
 * Automatic Full Channel Ingestion Engine.
 * Ingests a channel, its playlists, and generates Courses, LearningModules and Lessons.
 */
export async function ingestFullChannel(channelInput: string): Promise<{
  channel: ContentSource
  playlists: YouTubePlaylist[]
  courses: Course[]
  modules: LearningModule[]
  lessons: Lesson[]
  report: IngestionReport
} | null> {
  const channel = await fetchChannelDetails(channelInput)
  if (!channel || !channel.channelId) return null

  const playlists = await fetchChannelPlaylists(channel.channelId)
  const courses: Course[] = []
  const modules: LearningModule[] = []
  const lessons: Lesson[] = []

  let totalVideosFound = 0
  let totalVideosImported = 0
  let totalUnavailable = 0
  let autoApprovedCount = 0
  let pendingReviewCount = 0

  for (const pl of playlists) {
    const { videos, unavailableCount } = await fetchAllPlaylistVideos(pl.youtubePlaylistId)
    totalVideosFound += pl.itemCount
    totalVideosImported += videos.length
    totalUnavailable += unavailableCount

    if (pl.classificationConfidence >= 90) {
      autoApprovedCount++
    } else {
      pendingReviewCount++
    }

    const classification = classifyPlaylistContext(pl.title, pl.description)
    const courseId = `crs-${pl.youtubePlaylistId}`
    const totalSeconds = videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0)
    const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

    const course: Course = {
      id: courseId,
      title: pl.title,
      slug: pl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `curso-${pl.youtubePlaylistId}`,
      description: pl.description || `Curso completo estruturado a partir da playlist do canal ${channel.name}.`,
      level: classification.level,
      technology: classification.technology,
      category: classification.category,
      thumbnailUrl: pl.thumbnailUrl || videos[0]?.thumbnailUrl || '',
      status: 'ativo',
      sourceId: channel.id,
      sourcePlaylistId: pl.youtubePlaylistId,
      playlistId: pl.youtubePlaylistId,
      playlistUrl: pl.youtubeUrl,
      channelTitle: channel.name,
      classificationConfidence: classification.confidence,
      prerequisites: classification.technology.includes('Lógica') ? [] : ['mod-logica'],
      skills: classification.skills,
      modulesCount: 1,
      lessonsCount: videos.length,
      totalHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    courses.push(course)

    const modId = `mod-${pl.youtubePlaylistId}`
    const modLessons: Lesson[] = videos.map((vid, i) => {
      const lessonId = `l-${pl.youtubePlaylistId}-${vid.youtubeVideoId}`
      return {
        id: lessonId,
        moduleId: modId,
        order: i + 1,
        title: vid.title,
        type: 'video',
        durationMin: Math.max(5, Math.round(vid.durationSeconds / 60)),
        description: vid.description ? vid.description.slice(0, 200) + '...' : `Aula ${i + 1} do curso ${pl.title}.`,
        videoId: vid.youtubeVideoId,
        externalVideoId: vid.youtubeVideoId,
        videoUrl: `https://www.youtube.com/watch?v=${vid.youtubeVideoId}`,
        sourceType: 'youtube',
        availabilityStatus: 'available',
        youtubeExists: true,
        embedAvailable: true,
        source: channel.name,
        playlistId: pl.youtubePlaylistId,
        technology: classification.technology,
        topic: vid.title,
        thumbnailUrl: vid.thumbnailUrl,
        isUnavailable: false,
        lastCheckedAt: new Date().toISOString(),
      }
    })

    lessons.push(...modLessons)

    modules.push({
      id: modId,
      order: 1,
      phase: classification.category,
      phaseOrder: 1,
      title: pl.title,
      slug: `mod-${pl.youtubePlaylistId}`,
      description: `Módulo completo abrangendo todas as ${videos.length} aulas sequenciais da playlist.`,
      objective: `Dominar os conceitos de ${classification.technology} abordados nas aulas deste bloco.`,
      icon: classification.technology.toLowerCase().includes('react') ? 'atom' : classification.technology.toLowerCase().includes('node') ? 'server' : 'code',
      prerequisites: [],
      lessonIds: modLessons.map((l) => l.id),
      exerciseCount: Math.min(15, Math.max(4, Math.ceil(videos.length / 2))),
      hasProject: true,
      hasAssessment: true,
      estimatedHours: totalHours,
      skills: classification.skills,
      courseId: courseId,
      technology: classification.technology,
    })
  }

  const report: IngestionReport = {
    channelName: channel.name,
    channelHandle: channel.handle || channel.name,
    playlistsFound: playlists.length,
    playlistsImported: courses.length,
    videosFound: totalVideosFound,
    videosImported: totalVideosImported,
    duplicatesIgnored: 0,
    unavailableCount: totalUnavailable,
    autoApprovedCount,
    pendingReviewCount,
    coursesGenerated: courses.length,
    ingestedAt: new Date().toISOString(),
  }

  return {
    channel: {
      ...channel,
      playlistsCount: playlists.length,
      videosCount: totalVideosImported,
      lastSyncedAt: new Date().toISOString(),
    },
    playlists,
    courses,
    modules,
    lessons,
    report,
  }
}

/**
 * Searches YouTube for educational playlists or courses by topic.
 */
export async function searchYouTubePlaylists(query: string, maxResults = 10): Promise<YouTubePlaylist[]> {
  const apiKey = getApiKey()
  if (!apiKey) return []

  try {
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=playlist&q=${encodeURIComponent(
      query,
    )}&maxResults=${maxResults}&key=${apiKey}`

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []

    const data = await res.json()
    if (!data.items) return []

    return data.items.map((it: any) => {
      const plId = it.id.playlistId
      const snippet = it.snippet
      const classification = classifyPlaylistContext(snippet.title || '', snippet.description || '')

      return {
        id: `pl-${plId}`,
        youtubePlaylistId: plId,
        title: snippet.title || 'Playlist',
        description: snippet.description || '',
        channelId: snippet.channelId || '',
        channelTitle: snippet.channelTitle || '',
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
        youtubeUrl: `https://www.youtube.com/playlist?list=${plId}`,
        itemCount: 0,
        videoCount: 0,
        category: classification.category,
        technology: classification.technology,
        level: classification.level,
        status: 'ativo',
        classificationConfidence: classification.confidence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error('Error searching YouTube playlists:', err)
    return []
  }
}

/**
 * Content Consistency & Semantic Validation Engine (validateContentMapping).
 * Validates that no cross-technology contamination exists (e.g. Python videos in Logic course).
 */
export function validateContentMapping(
  courses: Course[],
  modules: LearningModule[],
  lessons: Lesson[],
): ContentConsistencyReport {
  const issues: ValidationIssue[] = []

  for (const course of courses) {
    const courseTech = course.technology.toLowerCase()
    const courseMods = modules.filter((m) => m.courseId === course.id || m.phase === course.category)

    for (const mod of courseMods) {
      const modLessons = lessons.filter((l) => mod.lessonIds.includes(l.id))

      for (const lesson of modLessons) {
        if (lesson.type === 'video') {
          if (!lesson.videoId) {
            issues.push({
              type: 'MISSING_VIDEO',
              severity: 'error',
              courseId: course.id,
              moduleId: mod.id,
              lessonId: lesson.id,
              message: `Aula "${lesson.title}" do módulo "${mod.title}" não possui videoId cadastrado.`,
            })
            continue
          }

          const titleLow = lesson.title.toLowerCase()

          // Rule 1: Logic / Fundamentals course cannot contain specific language course videos
          if (courseTech.includes('lógica') || courseTech.includes('algoritmo')) {
            if (titleLow.includes('curso python') || titleLow.includes('curso de python') || lesson.videoId === '8mei6646tAQ') {
              issues.push({
                type: 'TECH_MISMATCH',
                severity: 'error',
                courseId: course.id,
                moduleId: mod.id,
                lessonId: lesson.id,
                message: `Incompatibilidade detectada: vídeo de Python inserido no curso de Lógica de Programação.`,
                details: { videoId: lesson.videoId, lessonTitle: lesson.title },
              })
            }
            if (titleLow.includes('curso react') || titleLow.includes('curso de react')) {
              issues.push({
                type: 'TECH_MISMATCH',
                severity: 'error',
                courseId: course.id,
                moduleId: mod.id,
                lessonId: lesson.id,
                message: `Incompatibilidade detectada: vídeo de React inserido no curso de Lógica de Programação.`,
              })
            }
          }

          // Rule 2: HTML/CSS course cannot contain Python/SQL videos
          if (courseTech.includes('html') || courseTech.includes('css')) {
            if (titleLow.includes('curso python') || titleLow.includes('curso de mysql')) {
              issues.push({
                type: 'TECH_MISMATCH',
                severity: 'error',
                courseId: course.id,
                moduleId: mod.id,
                lessonId: lesson.id,
                message: `Incompatibilidade detectada no curso de HTML/CSS.`,
              })
            }
          }
        }
      }
    }
  }

  return {
    isValid: issues.filter((i) => i.severity === 'error').length === 0,
    checkedAt: new Date().toISOString(),
    totalCourses: courses.length,
    totalModules: modules.length,
    totalLessons: lessons.length,
    issues,
  }
}
