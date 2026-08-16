import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, context } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const reply = await aiService.chatWithMentor(messages, context)
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem com o mentor' },
      { status: 500 }
    )
  }
}
