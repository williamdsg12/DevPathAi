import { NextResponse } from 'next/server'
import { fetchAllPlaylistVideos } from '@/lib/youtube/service'
import { checkYouTubeVideoAvailability } from '@/lib/video/normalizer'
import type { VideoAvailabilityStatus } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const playlistId = body.playlistId
    let videoIds: string[] = body.videoIds || []

    if (!playlistId && (!videoIds || videoIds.length === 0)) {
      return NextResponse.json({ error: 'playlistId ou videoIds é obrigatório.' }, { status: 400 })
    }

    // If videoIds not provided, fetch all from playlist
    if (videoIds.length === 0 && playlistId) {
      const { videos } = await fetchAllPlaylistVideos(playlistId)
      videoIds = videos.map((v) => v.youtubeVideoId)
    }

    let availableCount = 0
    let embedDisabledCount = 0
    let removedCount = 0
    let invalidCount = 0
    let temporaryErrorCount = 0

    const results: Array<{
      videoId: string
      status: VideoAvailabilityStatus
      youtubeExists: boolean
      embedAvailable: boolean
      title?: string
      message: string
    }> = []

    // Process up to 5 concurrent checks
    for (let i = 0; i < videoIds.length; i += 5) {
      const chunk = videoIds.slice(i, i + 5)
      const chunkResults = await Promise.all(
        chunk.map(async (vid) => {
          const res = await checkYouTubeVideoAvailability(vid)
          return {
            videoId: vid,
            ...res,
          }
        }),
      )

      for (const r of chunkResults) {
        results.push(r)
        if (r.status === 'available') availableCount++
        else if (r.status === 'embed_disabled' || r.status === 'external_only') embedDisabledCount++
        else if (r.status === 'removed' || r.status === 'private') removedCount++
        else if (r.status === 'invalid_id') invalidCount++
        else temporaryErrorCount++
      }
    }

    return NextResponse.json({
      success: true,
      playlistId,
      totalVideos: videoIds.length,
      availableCount,
      embedDisabledCount,
      removedCount,
      invalidCount,
      temporaryErrorCount,
      results,
      validatedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error validating playlist videos:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao validar vídeos da playlist.' },
      { status: 500 },
    )
  }
}
