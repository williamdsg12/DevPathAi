import { NextResponse } from 'next/server'
import { ingestFullChannel } from '@/lib/youtube/service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const channelId = body.channelId || body.handle || body.url

    if (!channelId) {
      return NextResponse.json({ error: 'channelId ou handle é obrigatório.' }, { status: 400 })
    }

    const result = await ingestFullChannel(channelId)
    if (!result) {
      return NextResponse.json({ error: 'Canal não encontrado ou sem playlists públicas disponíveis no YouTube.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ...result,
      syncedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error syncing channel:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao sincronizar canal no YouTube.' },
      { status: 500 },
    )
  }
}
