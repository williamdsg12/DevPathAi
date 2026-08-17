import { NextResponse } from 'next/server'
import { activityEngine } from '@/lib/ai/activity-engine'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      courseId,
      courseTitle,
      moduleId,
      moduleTitle,
      lessonId,
      lessonTitle,
      lessonDescription,
      lessonContent,
      technology,
      studentLevel,
      studentPerformanceScore,
      studentDifficulties,
    } = body

    if (!moduleId || !lessonId || !lessonTitle) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes (moduleId, lessonId, lessonTitle).' },
        { status: 400 },
      )
    }

    const activities = activityEngine.generateActivitiesForLesson({
      courseId,
      courseTitle,
      moduleId,
      moduleTitle,
      lessonId,
      lessonTitle,
      lessonDescription,
      lessonContent,
      technology,
      studentLevel,
      studentPerformanceScore,
      studentDifficulties,
    })

    return NextResponse.json({
      success: true,
      count: activities.length,
      activities,
    })
  } catch (error) {
    console.error('Error in /api/ai/generate-activities:', error)
    return NextResponse.json(
      { error: 'Falha ao processar a geração de atividades da aula.' },
      { status: 500 },
    )
  }
}
