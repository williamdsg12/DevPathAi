import { NextRequest, NextResponse } from 'next/server'
import { fetchCatalogFromDatabase, persistCoursePackageToDatabase } from '@/lib/catalog/db-repository'
import { handleApiError } from '@/lib/errors'
import { validateRequiredString, validateEnum } from '@/lib/validation'
import { validateSuperAdminRequest } from '@/lib/auth/rbac'
import type { Course } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const technology = searchParams.get('technology')
    const level = searchParams.get('level')
    const status = searchParams.get('status') || 'ativo'
    const search = searchParams.get('search')?.toLowerCase()
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0

    // Fetch live authentic catalog from Database (Supabase / Postgres)
    const catalog = await fetchCatalogFromDatabase()
    let courses: Course[] = catalog.courses

    if (status !== 'all') {
      courses = courses.filter((c) => c.status === status)
    }

    if (technology && technology !== 'all') {
      courses = courses.filter((c) => c.technology.toLowerCase() === technology.toLowerCase())
    }

    if (level && level !== 'all') {
      courses = courses.filter((c) => c.level === level)
    }

    if (search) {
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.technology.toLowerCase().includes(search) ||
          c.channelTitle?.toLowerCase().includes(search)
      )
    }

    const total = courses.length
    const paginatedCourses = courses.slice(offset, offset + limit)

    return NextResponse.json({
      courses: paginatedCourses,
      modules: catalog.modules,
      lessons: catalog.lessons,
      playlists: catalog.playlists,
      sources: catalog.sources,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      fromDatabase: true,
    })
  } catch (error: any) {
    return handleApiError(error, 'CATALOG_GET_COURSES')
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. RBAC Check
    const auth = validateSuperAdminRequest(req)
    if (!auth.authorized && auth.response) {
      return auth.response
    }

    // 2. Body Validation
    const body = await req.json()
    const title = validateRequiredString(body.title, 'title', 3, 200)
    const slug = validateRequiredString(body.slug, 'slug', 3, 200).toLowerCase()
    const description = validateRequiredString(body.description, 'description', 5, 2000)
    const technology = validateRequiredString(body.technology, 'technology', 2, 100)
    const category = body.category || 'Fundamentos da Programação'
    const level = validateEnum(body.level || 'iniciante', 'level', [
      'iniciante-absoluto',
      'iniciante',
      'basico',
      'intermediario',
      'avancado',
    ] as const)

    const newCourse: Course = {
      id: body.id || `crs-${slug}`,
      title,
      slug,
      description,
      technology,
      category,
      level,
      status: 'ativo',
      thumbnailUrl: body.thumbnailUrl || '',
      channelTitle: body.channelTitle || 'Curso em Vídeo',
      playlistId: body.playlistId,
      playlistUrl: body.playlistUrl,
      modulesCount: body.modulesCount || 1,
      lessonsCount: body.lessonsCount || 0,
      totalHours: Number(body.totalHours) || 1,
      prerequisites: body.prerequisites || [],
      skills: body.skills || [technology],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Persist to database
    const dbResult = await persistCoursePackageToDatabase({
      course: newCourse,
      modules: body.modules || [],
      lessons: body.lessons || [],
      adminEmail: auth.userEmail,
    })

    return NextResponse.json({
      success: true,
      persistedToDatabase: dbResult.success,
      course: newCourse,
      message: `Curso "${title}" salvo com sucesso no banco de dados!`,
    })
  } catch (error: any) {
    return handleApiError(error, 'CATALOG_CREATE_COURSE')
  }
}
