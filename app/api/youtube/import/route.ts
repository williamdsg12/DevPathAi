import { NextRequest, NextResponse } from 'next/server'
import {
  extractPlaylistOrVideoId,
  importSinglePlaylistPipeline,
  ingestFullChannel,
} from '@/lib/youtube/service'
import { validateSuperAdminRequest } from '@/lib/auth/rbac'
import { persistCoursePackageToDatabase } from '@/lib/catalog/db-repository'

export async function POST(req: NextRequest) {
  try {
    const auth = validateSuperAdminRequest(req)
    if (!auth.authorized && auth.response) {
      return auth.response
    }

    const body = await req.json()
    const urlOrId = body.url || body.playlistId || body.playlistUrl || body.channelInput

    if (!urlOrId || typeof urlOrId !== 'string') {
      return NextResponse.json({ error: 'URL ou ID da playlist/canal é obrigatório.' }, { status: 400 })
    }

    const parsed = extractPlaylistOrVideoId(urlOrId)

    // A. If input is a Channel (handle, URL with /@, /channel/, etc)
    if (
      parsed.type === 'channel_handle' ||
      parsed.type === 'channel_id' ||
      urlOrId.includes('/@') ||
      urlOrId.includes('/channel/') ||
      urlOrId.includes('/c/') ||
      urlOrId.includes('/user/')
    ) {
      const channelResult = await ingestFullChannel(urlOrId)
      if (!channelResult || channelResult.courses.length === 0) {
        return NextResponse.json(
          {
            error:
              'Não foi possível encontrar cursos ou playlists públicas neste canal do YouTube. Verifique se o canal possui playlists públicas criadas.',
          },
          { status: 404 },
        )
      }

      // PERSIST DIRECTLY TO POSTGRESQL / SUPABASE DATABASE ON SERVER
      for (const course of channelResult.courses) {
        const courseMods = channelResult.modules.filter((m) => m.courseId === course.id || m.phase === course.category)
        const courseLessons = channelResult.lessons.filter((l) => courseMods.some((m) => m.id === l.moduleId))
        const coursePl = channelResult.playlists.find((p) => p.youtubePlaylistId === course.playlistId)

        await persistCoursePackageToDatabase({
          course,
          modules: courseMods,
          lessons: courseLessons,
          playlist: coursePl,
          channel: channelResult.channel,
          adminEmail: auth.userEmail,
        })
      }

      return NextResponse.json({
        success: true,
        isChannel: true,
        persistedToDatabase: true,
        channel: channelResult.channel,
        playlists: channelResult.playlists,
        courses: channelResult.courses,
        modules: channelResult.modules,
        lessons: channelResult.lessons,
        report: channelResult.report,
        totalVideos: channelResult.lessons.length,
        totalCourses: channelResult.courses.length,
        successfulPlaylists: channelResult.successfulPlaylists,
        failedPlaylists: channelResult.failedPlaylists,
      })
    }

    // B. If input is a Playlist or Single Video
    if (parsed.type !== 'playlist' && parsed.type !== 'video') {
      return NextResponse.json(
        { error: 'Formato de URL inválido. Insira uma playlist, canal ou link de vídeo do YouTube.' },
        { status: 400 },
      )
    }

    const playlistId = parsed.type === 'playlist' ? parsed.id : `single-${parsed.id}`

    // Call canonical single playlist pipeline
    const result = await importSinglePlaylistPipeline(playlistId)
    if (!result.success || !result.course || !result.modules || !result.lessons) {
      return NextResponse.json(
        { error: result.error || 'Não foi possível importar a playlist.' },
        { status: 400 },
      )
    }

    // PERSIST DIRECTLY TO POSTGRESQL / SUPABASE DATABASE ON SERVER
    const dbResult = await persistCoursePackageToDatabase({
      course: result.course,
      modules: result.modules,
      lessons: result.lessons,
      playlist: result.playlist,
      adminEmail: auth.userEmail,
    })

    return NextResponse.json({
      success: true,
      persistedToDatabase: dbResult.success,
      persistedCounts: dbResult.persistedCounts,
      playlist: result.playlist,
      course: result.course,
      modules: result.modules,
      lessons: result.lessons,
      totalVideos: result.totalVideos || result.lessons.length,
      unavailableCount: result.unavailableCount || 0,
    })
  } catch (err: any) {
    console.error('Error importing playlist/channel:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar a importação do YouTube.' },
      { status: 500 },
    )
  }
}
