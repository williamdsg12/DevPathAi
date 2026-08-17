import { NextRequest, NextResponse } from 'next/server'
import { ingestFullChannel } from '@/lib/youtube/service'
import { validateSuperAdminRequest } from '@/lib/auth/rbac'

export async function POST(req: NextRequest) {
  try {
    const auth = validateSuperAdminRequest(req)
    if (!auth.authorized && auth.response) {
      return auth.response
    }

    const body = await req.json()
    const channelInput = body.channelInput || body.url || body.handle

    if (!channelInput || typeof channelInput !== 'string') {
      return NextResponse.json(
        { error: 'URL ou @handle do canal é obrigatório (ex: @CursoemVideo).' },
        { status: 400 },
      )
    }

    const result = await ingestFullChannel(channelInput)
    if (!result) {
      return NextResponse.json(
        { error: 'Canal não encontrado ou sem playlists públicas disponíveis no YouTube.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (err: any) {
    console.error('Error in /api/youtube/channel/ingest:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao processar a ingestão automática do canal.' },
      { status: 500 },
    )
  }
}
