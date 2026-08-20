import { NextResponse } from 'next/server'
import { defaultOfficialCourses, defaultOfficialModules, defaultOfficialLessons } from '@/lib/mock-data'
import { calculateCatalogStats } from '@/lib/catalog/service'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    const stats = calculateCatalogStats(
      defaultOfficialCourses,
      defaultOfficialModules,
      defaultOfficialLessons
    )

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return handleApiError(error, 'CATALOG_GET_STATS')
  }
}
