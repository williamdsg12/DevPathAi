import { NextResponse } from 'next/server'
import { defaultCourses, mockLessons, mockModules } from '@/lib/mock-data'
import { learningPathEngine } from '@/lib/ai/learning-path-engine'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { onboardingData, placementResult, userProfile, courses, modules, lessons } = body

    if (!onboardingData) {
      return NextResponse.json({ error: 'Dados de onboarding são obrigatórios.' }, { status: 400 })
    }

    const result = learningPathEngine.generateAdaptiveTrail(
      userProfile || null,
      onboardingData,
      placementResult || null,
      courses || defaultCourses,
      modules || mockModules,
      lessons || mockLessons,
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Error in /api/ai/learning-path:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar trilha de aprendizado adaptativa.' },
      { status: 500 },
    )
  }
}
