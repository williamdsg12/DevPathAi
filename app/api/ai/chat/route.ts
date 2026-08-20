import { NextResponse } from 'next/server'
import { executeAIOrchestrator } from '@/lib/ai/orchestrator'
import { handleApiError } from '@/lib/errors'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      messages = [],
      context = {},
      studentProfile,
      studentMemory,
      activeConfig,
      activeInstructions,
      activeBlocks,
      knowledgeBase,
      lessonContext,
      exerciseContext,
      forceWebSearch,
    } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const lastUserMessage = messages[messages.length - 1]?.content || ''

    const result = await executeAIOrchestrator({
      message: lastUserMessage,
      history: messages.slice(0, -1),
      studentProfile: studentProfile || {
        level: context?.userLevel || 'iniciante',
      },
      studentMemory,
      activeConfig,
      activeInstructions,
      activeBlocks,
      knowledgeBase,
      lessonContext: lessonContext || {
        moduleTitle: context?.currentModuleTitle,
      },
      exerciseContext,
      forceWebSearch,
    })

    return NextResponse.json({
      reply: result.reply,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs,
      modelUsed: result.modelUsed,
      promptVersion: result.promptVersion,
      toolsExecuted: result.toolsExecuted,
      sourcesCited: result.sourcesCited,
      trace: result.trace,
      extractedDifficulty: result.extractedDifficulty,
    })
  } catch (error: any) {
    return handleApiError(error, 'AI_CHAT')
  }
}
