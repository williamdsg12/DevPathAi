import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, role, seniority, history, question, answer } = body

    if (action === 'get_question') {
      const q = await aiService.generateInterviewQuestion(role || 'Frontend Developer', seniority || 'Júnior', history || [])
      return NextResponse.json({ question: q })
    }

    if (action === 'evaluate_answer') {
      const evaluation = await aiService.evaluateInterviewAnswer(question || '', answer || '')
      return NextResponse.json(evaluation)
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in /api/ai/interview:', error)
    return NextResponse.json(
      { error: error.message || 'Erro no simulador de entrevista' },
      { status: 500 }
    )
  }
}
