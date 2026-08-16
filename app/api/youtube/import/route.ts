import { NextResponse } from 'next/server'
import {
  extractPlaylistOrVideoId,
  fetchAllPlaylistVideos,
  fetchPlaylistMetadata,
} from '@/lib/youtube/service'
import type { Course, LearningModule, Lesson, SkillLevel } from '@/lib/types'

function detectTechnologyAndLevel(title: string, description: string): {
  technology: string
  level: SkillLevel
  category: string
  skills: string[]
} {
  const combined = (title + ' ' + description).toLowerCase()

  let technology = 'Lógica & Programação'
  let category = 'Fundamentos da Programação'
  let skills = ['Lógica', 'Algoritmos', 'Raciocínio Computacional']
  let level: SkillLevel = 'iniciante-absoluto'

  if (combined.includes('python')) {
    technology = 'Python'
    category = 'Backend & Automação'
    skills = ['Python', 'Sintaxe', 'Estruturas de Dados', 'Funções', 'POO']
    level = 'iniciante'
  } else if (combined.includes('react') || combined.includes('next.js') || combined.includes('nextjs')) {
    technology = 'React & Next.js'
    category = 'Front-end Moderno'
    skills = ['React', 'Next.js', 'Hooks', 'Componentes', 'JSX', 'TypeScript']
    level = 'intermediario'
  } else if (combined.includes('javascript') || combined.includes('js')) {
    technology = 'JavaScript'
    category = 'Web & Front-end'
    skills = ['JavaScript', 'DOM', 'ES6+', 'Arrays', 'Objetos', 'Eventos', 'Assincronismo']
    level = 'iniciante'
  } else if (combined.includes('node') || combined.includes('express') || combined.includes('nest')) {
    technology = 'Node.js & APIs'
    category = 'Back-end'
    skills = ['Node.js', 'Express', 'APIs REST', 'Middlewares', 'JWT', 'SQL']
    level = 'intermediario'
  } else if (combined.includes('html') || combined.includes('css')) {
    technology = 'HTML5 & CSS3'
    category = 'Web'
    skills = ['HTML5 Semântico', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsividade']
    level = 'iniciante-absoluto'
  } else if (combined.includes('sql') || combined.includes('banco de dados') || combined.includes('postgres') || combined.includes('mysql')) {
    technology = 'Banco de Dados & SQL'
    category = 'Back-end'
    skills = ['SQL', 'PostgreSQL', 'Modelagem Relacional', 'CRUD', 'Consultas']
    level = 'basico'
  } else if (combined.includes('git') || combined.includes('github')) {
    technology = 'Git & GitHub'
    category = 'Ferramentas'
    skills = ['Git', 'GitHub', 'Commits', 'Branches', 'Pull Requests']
    level = 'iniciante'
  }

  if (combined.includes('avançado') || combined.includes('advanced')) {
    level = 'avancado'
  } else if (combined.includes('iniciante') || combined.includes('do zero') || combined.includes('iniciantes')) {
    level = 'iniciante'
  }

  return { technology, level, category, skills }
}

function organizeVideosIntoModules(
  playlistTitle: string,
  playlistId: string,
  videos: any[],
  techInfo: ReturnType<typeof detectTechnologyAndLevel>,
): { modules: LearningModule[]; lessons: Lesson[] } {
  const modId = `mod-${playlistId}`
  const total = videos.length
  const totalSeconds = videos.reduce((acc, v) => acc + (v.durationSeconds || 900), 0)
  const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

  const lessons: Lesson[] = videos.map((vid, idx) => {
    const lessonId = `l-${playlistId}-${vid.youtubeVideoId}`
    return {
      id: lessonId,
      moduleId: modId,
      order: idx + 1,
      title: vid.title,
      type: 'video',
      durationMin: Math.max(5, Math.round((vid.durationSeconds || 900) / 60)),
      description: vid.description ? vid.description.slice(0, 200) + '...' : `Aula ${idx + 1} do curso ${playlistTitle}.`,
      videoId: vid.youtubeVideoId,
      externalVideoId: vid.youtubeVideoId,
      videoUrl: `https://www.youtube.com/watch?v=${vid.youtubeVideoId}`,
      sourceType: 'youtube',
      availabilityStatus: 'available',
      youtubeExists: true,
      embedAvailable: true,
      source: vid.channelTitle || 'YouTube',
      playlistId,
      technology: techInfo.technology,
      topic: vid.title,
      thumbnailUrl: vid.thumbnailUrl,
      isUnavailable: false,
      lastCheckedAt: new Date().toISOString(),
    }
  })

  const module: LearningModule = {
    id: modId,
    order: 1,
    phase: techInfo.category,
    phaseOrder: 1,
    title: playlistTitle,
    slug: `mod-${playlistId}`,
    description: `Módulo completo contendo ${lessons.length} aulas sequenciais com prática e acompanhamento.`,
    objective: `Dominar os fundamentos e aplicações práticas de ${techInfo.technology}.`,
    icon: techInfo.technology.toLowerCase().includes('react') ? 'atom' : techInfo.technology.toLowerCase().includes('node') ? 'server' : 'code',
    prerequisites: [],
    lessonIds: lessons.map((l) => l.id),
    exerciseCount: Math.min(15, Math.max(4, Math.ceil(lessons.length / 2))),
    hasProject: true,
    hasAssessment: true,
    estimatedHours: totalHours,
    skills: techInfo.skills,
    courseId: `crs-${playlistId}`,
    technology: techInfo.technology,
  }

  return { modules: [module], lessons }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const urlOrId = body.url || body.playlistId

    if (!urlOrId || typeof urlOrId !== 'string') {
      return NextResponse.json({ error: 'URL ou ID da playlist é obrigatório.' }, { status: 400 })
    }

    const parsed = extractPlaylistOrVideoId(urlOrId)
    if (parsed.type !== 'playlist' && parsed.type !== 'video') {
      return NextResponse.json(
        { error: 'Formato de URL inválido. Insira uma playlist ou link de vídeo do YouTube.' },
        { status: 400 },
      )
    }

    const playlistId = parsed.type === 'playlist' ? parsed.id : `single-${parsed.id}`

    // 1. Fetch Playlist Metadata
    const playlistMeta = await fetchPlaylistMetadata(playlistId)
    if (!playlistMeta) {
      return NextResponse.json(
        {
          error:
            'Não foi possível encontrar a playlist no YouTube. Verifique se ela é pública ou se a chave de API está ativa.',
        },
        { status: 404 },
      )
    }

    // 2. Fetch All Videos in Playlist with Full Pagination
    const { videos, unavailableCount } = await fetchAllPlaylistVideos(playlistId)
    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum vídeo disponível ou público encontrado nesta playlist.' },
        { status: 400 },
      )
    }

    // 3. AI Pedagogical Classification
    const techInfo = detectTechnologyAndLevel(playlistMeta.title, playlistMeta.description)
    const { modules, lessons } = organizeVideosIntoModules(
      playlistMeta.title,
      playlistId,
      videos,
      techInfo,
    )

    const totalSeconds = videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0)
    const totalHours = Math.max(1, Math.round(totalSeconds / 3600))

    const course: Course = {
      id: `crs-${playlistId}`,
      title: playlistMeta.title,
      slug: playlistMeta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `curso-${playlistId}`,
      description: playlistMeta.description || `Curso completo estruturado a partir da playlist do canal ${playlistMeta.channelTitle}.`,
      level: techInfo.level,
      technology: techInfo.technology,
      category: techInfo.category,
      thumbnailUrl: playlistMeta.thumbnailUrl || videos[0]?.thumbnailUrl || '',
      status: 'ativo',
      playlistId,
      playlistUrl: playlistMeta.youtubeUrl,
      channelTitle: playlistMeta.channelTitle,
      modulesCount: modules.length,
      lessonsCount: videos.length,
      totalHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      playlist: playlistMeta,
      course,
      modules,
      lessons,
      totalVideos: videos.length,
      unavailableCount,
    })
  } catch (err: any) {
    console.error('Error importing playlist:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar a playlist do YouTube.' },
      { status: 500 },
    )
  }
}
