import { NextRequest, NextResponse } from 'next/server'
import { ingestFullChannel } from '@/lib/youtube/service'
import { validateSuperAdminRequest } from '@/lib/auth/rbac'
import { persistCoursePackageToDatabase } from '@/lib/catalog/db-repository'

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
    if (!result || result.courses.length === 0) {
      return NextResponse.json(
        { error: 'Canal não encontrado ou sem playlists públicas disponíveis no YouTube.' },
        { status: 404 },
      )
    }

    // Persist all discovered courses to the database on the server
    for (const course of result.courses) {
      const courseMods = result.modules.filter((m) => m.courseId === course.id || m.phase === course.category)
      const courseLessons = result.lessons.filter((l) => courseMods.some((m) => m.id === l.moduleId))
      const coursePl = result.playlists.find((p) => p.youtubePlaylistId === course.playlistId)

      await persistCoursePackageToDatabase({
        course,
        modules: courseMods,
        lessons: courseLessons,
        playlist: coursePl,
        channel: result.channel,
        adminEmail: auth.userEmail,
      })
    }

    return NextResponse.json({
      success: true,
      persistedToDatabase: true,
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
