import { NextResponse } from 'next/server'
import { checkYouTubeVideoAvailability, normalizeYouTubeVideoUrl } from '@/lib/video/normalizer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const videoIdOrUrl = body.videoId || body.url || body.externalVideoId

    if (!videoIdOrUrl || typeof videoIdOrUrl !== 'string') {
      return NextResponse.json({ error: 'videoId ou URL é obrigatório.' }, { status: 400 })
    }

    const norm = normalizeYouTubeVideoUrl(videoIdOrUrl)
    const result = await checkYouTubeVideoAvailability(norm.videoId || videoIdOrUrl)

    return NextResponse.json({
      success: true,
      videoId: norm.videoId,
      externalVideoId: norm.externalVideoId,
      watchUrl: norm.watchUrl,
      embedUrl: norm.embedUrl,
      ...result,
      checkedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error validating video:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao validar disponibilidade do vídeo.' },
      { status: 500 },
    )
  }
}
