import { NextResponse } from 'next/server'
import { activityEngine } from '@/lib/ai/activity-engine'
import type { ModuleProject } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { project, submission } = body as {
      project: ModuleProject
      submission: { githubUrl: string; deployUrl?: string; description?: string; codeContent?: string }
    }

    if (!project || !submission || !submission.githubUrl) {
      return NextResponse.json(
        { error: 'Projeto e submissão com GitHub URL são obrigatórios.' },
        { status: 400 },
      )
    }

    const review = activityEngine.reviewProjectSubmission(project, submission)

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('Error in /api/ai/review-project:', error)
    return NextResponse.json(
      { error: 'Falha ao avaliar projeto com IA.' },
      { status: 500 },
    )
  }
}
