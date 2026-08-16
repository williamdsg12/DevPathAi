/**
 * Video Normalizer & Availability Diagnostic Engine for DevPath AI.
 *
 * Centralizes YouTube URL extraction, canonical ID resolution,
 * embed URL synthesis and non-intrusive availability checks.
 */

import type { VideoAvailabilityStatus, VideoMetadata, VideoSourceType } from '@/lib/types'

export interface NormalizedVideoResult {
  isValid: boolean
  videoId: string
  externalVideoId: string
  watchUrl: string
  embedUrl: string
  thumbnailUrl: string
  sourceType: VideoSourceType
}

/**
 * Extracts and normalizes the canonical 11-character YouTube Video ID from any URL format.
 */
export function normalizeYouTubeVideoUrl(input?: string | null): NormalizedVideoResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      videoId: '',
      externalVideoId: '',
      watchUrl: '',
      embedUrl: '',
      thumbnailUrl: '',
      sourceType: 'youtube',
    }
  }

  const trimmed = input.trim()

  // 1. Direct 11-character Video ID pattern
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      isValid: true,
      videoId: trimmed,
      externalVideoId: trimmed,
      watchUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${trimmed}?rel=0&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${trimmed}/hqdefault.jpg`,
      sourceType: 'youtube',
    }
  }

  // 2. Parse from diverse YouTube URL patterns
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)

    let extractedId: string | null = null

    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    if (url.searchParams.has('v')) {
      const v = url.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        extractedId = v
      }
    }

    // Shortened URL: youtu.be/VIDEO_ID
    if (!extractedId && (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be'))) {
      const pathId = url.pathname.slice(1).split('/')[0]?.split('?')[0]
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        extractedId = pathId
      }
    }

    // Embed URL: youtube.com/embed/VIDEO_ID or youtube-nocookie.com/embed/VIDEO_ID
    if (!extractedId && url.pathname.includes('/embed/')) {
      const pathId = url.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0]
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        extractedId = pathId
      }
    }

    // Shorts URL: youtube.com/shorts/VIDEO_ID
    if (!extractedId && url.pathname.includes('/shorts/')) {
      const pathId = url.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0]
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        extractedId = pathId
      }
    }

    // Live URL: youtube.com/live/VIDEO_ID
    if (!extractedId && url.pathname.includes('/live/')) {
      const pathId = url.pathname.split('/live/')[1]?.split('/')[0]?.split('?')[0]
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        extractedId = pathId
      }
    }

    if (extractedId) {
      return {
        isValid: true,
        videoId: extractedId,
        externalVideoId: extractedId,
        watchUrl: `https://www.youtube.com/watch?v=${extractedId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${extractedId}?rel=0&enablejsapi=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        sourceType: 'youtube',
      }
    }
  } catch {
    // URL parsing fallback: regex match for 11 chars after v= or embed/ or youtu.be/
    const match = trimmed.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/)
    if (match && match[1]) {
      const vid = match[1]
      return {
        isValid: true,
        videoId: vid,
        externalVideoId: vid,
        watchUrl: `https://www.youtube.com/watch?v=${vid}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${vid}?rel=0&enablejsapi=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        sourceType: 'youtube',
      }
    }
  }

  return {
    isValid: false,
    videoId: trimmed,
    externalVideoId: trimmed,
    watchUrl: trimmed,
    embedUrl: '',
    thumbnailUrl: '',
    sourceType: 'youtube',
  }
}

/**
 * Diagnostic Verification of Video Availability & Embedding Status.
 * Uses official YouTube oEmbed API without consuming Google Cloud quota.
 */
export async function checkYouTubeVideoAvailability(videoIdOrUrl: string): Promise<{
  status: VideoAvailabilityStatus
  youtubeExists: boolean
  embedAvailable: boolean
  title?: string
  authorName?: string
  authorUrl?: string
  thumbnailUrl?: string
  message: string
}> {
  const norm = normalizeYouTubeVideoUrl(videoIdOrUrl)
  if (!norm.isValid) {
    return {
      status: 'invalid_id',
      youtubeExists: false,
      embedAvailable: false,
      message: 'Identificador de vídeo inválido ou mal formatado.',
    }
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(
      norm.videoId,
    )}&format=json`

    const res = await fetch(oembedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'DevPath-AI-Validator/1.0' },
      cache: 'no-store',
    })

    if (res.status === 200) {
      const data = await res.json()
      return {
        status: 'available',
        youtubeExists: true,
        embedAvailable: true,
        title: data.title,
        authorName: data.author_name,
        authorUrl: data.author_url,
        thumbnailUrl: data.thumbnail_url || norm.thumbnailUrl,
        message: 'Vídeo existente e liberado para reprodução no player.',
      }
    }

    if (res.status === 401 || res.status === 403) {
      // Video exists on YouTube, but embedding on 3rd-party domains is restricted by creator
      return {
        status: 'embed_disabled',
        youtubeExists: true,
        embedAvailable: false,
        thumbnailUrl: norm.thumbnailUrl,
        message: 'Vídeo disponível no YouTube, mas com restrição de incorporação pelo canal.',
      }
    }

    if (res.status === 404) {
      return {
        status: 'removed',
        youtubeExists: false,
        embedAvailable: false,
        message: 'Vídeo não encontrado ou excluído do YouTube.',
      }
    }

    return {
      status: 'temporary_error',
      youtubeExists: true,
      embedAvailable: true,
      message: `Resposta inesperada do servidor (${res.status}).`,
    }
  } catch (err: any) {
    // Network or temporary timeout
    return {
      status: 'temporary_error',
      youtubeExists: true,
      embedAvailable: true,
      message: 'Não foi possível verificar no momento (erro de rede/timeout).',
    }
  }
}
