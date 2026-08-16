import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { html = '', css = '', js = '' } = body

    const review = await aiService.reviewCode({ html, css, js })
    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error in /api/ai/code-review:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar código' },
      { status: 500 }
    )
  }
}
