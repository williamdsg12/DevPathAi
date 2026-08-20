import { NextRequest, NextResponse } from 'next/server'
import { executeAIOrchestrator } from '@/lib/ai/orchestrator'
import { handleApiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      messages = [],
      systemPrompt = '',
      persona,
      activeConfig,
      activeInstructions,
      activeBlocks,
      knowledgeBase,
      forceWebSearch,
    } = body

    const lastMessage = messages[messages.length - 1]?.content || ''

    const result = await executeAIOrchestrator({
      message: lastMessage,
      history: messages.slice(0, -1),
      studentProfile: {
        name: persona?.label || 'Aluno de Teste',
        level: persona?.userLevel || 'iniciante',
        desiredRole: persona?.careerGoal || 'Desenvolvedor',
      },
      activeConfig,
      activeInstructions,
      activeBlocks,
      knowledgeBase,
      lessonContext: {
        moduleTitle: persona?.currentModule,
        lessonTitle: persona?.currentLesson,
      },
      forceWebSearch,
    })

    return NextResponse.json({
      reply: result.reply,
      tokens: result.tokensUsed,
      latencyMs: result.latencyMs,
      model: result.modelUsed,
      promptVersion: result.promptVersion,
      toolsExecuted: result.toolsExecuted,
      sourcesCited: result.sourcesCited,
      trace: result.trace,
      extractedDifficulty: result.extractedDifficulty,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return handleApiError(error, 'AI_ADMIN_CHAT')
  }
}
