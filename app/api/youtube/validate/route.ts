import { NextResponse } from 'next/server'
import { defaultCourses, mockLessons, mockModules } from '@/lib/mock-data'
import { validateContentMapping } from '@/lib/youtube/service'

export async function GET() {
  try {
    const report = validateContentMapping(defaultCourses, mockModules, mockLessons)

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (err: any) {
    console.error('Error validating content catalog:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao validar o catálogo de conteúdos.' },
      { status: 500 },
    )
  }
}
