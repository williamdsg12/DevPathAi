import { NextResponse } from 'next/server'
import { searchYouTubePlaylists } from '@/lib/youtube/service'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Parâmetro de busca "q" é obrigatório.' }, { status: 400 })
    }

    const playlists = await searchYouTubePlaylists(query, 12)

    return NextResponse.json({
      success: true,
      query,
      results: playlists,
    })
  } catch (err: any) {
    console.error('Error searching YouTube:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao buscar no YouTube.' },
      { status: 500 },
    )
  }
}
