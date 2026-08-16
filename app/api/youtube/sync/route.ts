import { NextResponse } from 'next/server'
import {
  fetchAllPlaylistVideos,
  fetchPlaylistMetadata,
  syncCoursePlaylist,
} from '@/lib/youtube/service'
import type { Lesson } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const playlistId = body.playlistId
    const courseId = body.courseId || `crs-${playlistId}`
    const existingLessons: Lesson[] = body.existingLessons || []

    if (!playlistId) {
      return NextResponse.json({ error: 'playlistId é obrigatório.' }, { status: 400 })
    }

    const playlistMeta = await fetchPlaylistMetadata(playlistId)
    if (!playlistMeta) {
      return NextResponse.json({ error: 'Playlist não encontrada no YouTube.' }, { status: 404 })
    }

    const syncResult = await syncCoursePlaylist(courseId, playlistId, existingLessons)

    return NextResponse.json({
      success: true,
      playlist: playlistMeta,
      coursePatch: syncResult.updatedCoursePatch,
      modulePatch: syncResult.updatedModulePatch,
      lessons: syncResult.updatedLessons,
      log: syncResult.log,
      syncedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error syncing playlist:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao sincronizar playlist do YouTube.' },
      { status: 500 },
    )
  }
}
