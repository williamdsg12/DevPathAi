import { NextResponse } from 'next/server'
import {
  fetchChannelDetails,
  fetchChannelPlaylists,
} from '@/lib/youtube/service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const channelInput = body.channelInput || body.url || body.handle

    if (!channelInput || typeof channelInput !== 'string') {
      return NextResponse.json(
        { error: 'URL ou Handle do canal é obrigatório (ex: @CursoemVideo ou link do YouTube).' },
        { status: 400 },
      )
    }

    // 1. Fetch Channel Details (Title, Description, Custom URL, ID)
    const channel = await fetchChannelDetails(channelInput)
    if (!channel || !channel.channelId) {
      return NextResponse.json(
        { error: 'Canal não encontrado no YouTube. Verifique o @handle ou link fornecido.' },
        { status: 404 },
      )
    }

    // 2. Fetch All Public Playlists from Channel with Full Pagination
    const playlists = await fetchChannelPlaylists(channel.channelId)

    return NextResponse.json({
      success: true,
      channel,
      playlists,
      totalPlaylists: playlists.length,
    })
  } catch (err: any) {
    console.error('Error in /api/youtube/channel:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao consultar o canal no YouTube.' },
      { status: 500 },
    )
  }
}
