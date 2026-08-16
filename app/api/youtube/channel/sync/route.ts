import { NextResponse } from 'next/server'
import {
  fetchChannelDetails,
  fetchChannelPlaylists,
} from '@/lib/youtube/service'
import type { IngestionReport } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const channelId = body.channelId || body.handle

    if (!channelId) {
      return NextResponse.json({ error: 'channelId ou handle é obrigatório.' }, { status: 400 })
    }

    const channel = await fetchChannelDetails(channelId)
    if (!channel || !channel.channelId) {
      return NextResponse.json({ error: 'Canal não encontrado no YouTube.' }, { status: 404 })
    }

    const playlists = await fetchChannelPlaylists(channel.channelId)

    const report: IngestionReport = {
      channelName: channel.name,
      channelHandle: channel.handle || channel.name,
      playlistsFound: playlists.length,
      playlistsImported: playlists.length,
      videosFound: playlists.reduce((acc, p) => acc + p.itemCount, 0),
      videosImported: playlists.reduce((acc, p) => acc + p.itemCount, 0),
      duplicatesIgnored: 0,
      unavailableCount: 0,
      autoApprovedCount: playlists.filter((p) => p.classificationConfidence >= 90).length,
      pendingReviewCount: playlists.filter((p) => p.classificationConfidence < 90).length,
      coursesGenerated: playlists.length,
      ingestedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      channel: {
        ...channel,
        playlistsCount: playlists.length,
        lastSyncedAt: new Date().toISOString(),
      },
      playlists,
      report,
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
