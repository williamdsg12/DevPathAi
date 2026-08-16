import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { weakTopics, moduleId } = body

    const recoveryPlan = await aiService.generateRecoveryPlan(weakTopics || [], moduleId || '')
    return NextResponse.json({ recoveryPlan })
  } catch (error: any) {
    console.error('Error in /api/ai/feedback:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar feedback' },
      { status: 500 }
    )
  }
}
