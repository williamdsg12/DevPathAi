import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// Parse .env manually
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=')
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

async function testOrderedPersist() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const client = createClient(supabaseUrl!, supabaseKey!)

  console.log('1. Inserting Content Source...')
  const testSource = {
    id: 'src-curso-em-video',
    name: 'Curso em Vídeo (Gustavo Guanabara)',
    source_type: 'youtube_channel',
    channel_id: 'UCrWvhVmt0Qac3HgsjQK62FQ',
    channel_url: 'https://www.youtube.com/@CursoemVideo',
    handle: '@CursoemVideo',
    description: 'Canal de referência absoluta em ensino de fundamentos.',
    priority: 100,
    is_trusted: true,
    is_active: true,
  }
  const { error: srcError } = await client.from('content_sources').upsert(testSource)
  console.log('Source upsert:', { error: srcError })

  console.log('2. Inserting YouTube Playlist...')
  const testPlaylist = {
    id: 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    youtube_playlist_id: 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    channel_id: 'UCrWvhVmt0Qac3HgsjQK62FQ',
    channel_title: 'Curso em Vídeo',
    title: 'Curso de Algoritmos & Lógica de Programação',
    description: 'Curso completo de algoritmos e lógica de programação.',
    thumbnail_url: 'https://img.youtube.com/vi/8mei6uVttho/hqdefault.jpg',
    youtube_url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    item_count: 17,
    video_count: 17,
    category: 'Fundamentos da Programação',
    technology: 'Lógica & Algoritmos',
    level: 'iniciante',
    status: 'ativo',
    classification_confidence: 100,
  }
  const { error: plError } = await client.from('youtube_playlists').upsert(testPlaylist)
  console.log('Playlist upsert:', { error: plError })

  console.log('3. Inserting Course...')
  const testCourse = {
    id: 'crs-logica',
    title: 'Curso de Algoritmos & Lógica de Programação',
    slug: 'logica-de-programacao-algoritmos',
    description: 'Curso completo de algoritmos e lógica de programação.',
    level: 'iniciante-absoluto',
    technology: 'Lógica & Algoritmos',
    category: 'Fundamentos da Programação',
    thumbnail_url: 'https://img.youtube.com/vi/8mei6uVttho/hqdefault.jpg',
    status: 'ativo',
    channel_title: 'Curso em Vídeo',
    playlist_id: 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    playlist_url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    modules_count: 1,
    lessons_count: 17,
    total_hours: 12,
    prerequisites: [],
    skills: ['Lógica', 'Algoritmos'],
  }
  const { error: crsError } = await client.from('courses').upsert(testCourse)
  console.log('Course upsert:', { error: crsError })

  console.log('4. Inserting Module...')
  const testModule = {
    id: 'mod-logica',
    course_id: 'crs-logica',
    order_index: 1,
    phase: 'Fundamentos da Programação',
    phase_order: 1,
    title: 'Lógica de Programação & Algoritmos',
    slug: 'logica-de-programacao-algoritmos-mod',
    description: 'Aprenda a pensar como um programador.',
    objective: 'Dominar os fundamentos universais do raciocínio computacional.',
    icon: 'brain',
    has_project: true,
    has_assessment: true,
    estimated_hours: 12,
    skills: ['Lógica', 'Algoritmos'],
  }
  const { error: modError } = await client.from('modules').upsert(testModule)
  console.log('Module upsert:', { error: modError })

  console.log('5. Inserting Video...')
  const testVideo = {
    id: 'vid-8mei6uVttho',
    youtube_video_id: '8mei6uVttho',
    playlist_id: 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    title: 'Curso de Algoritmos #01 - Introdução a Algoritmos',
    description: 'Aula fundamental: entenda o que é um algoritmo.',
    channel_id: 'UCrWvhVmt0Qac3HgsjQK62FQ',
    channel_title: 'Curso em Vídeo',
    thumbnail_url: 'https://img.youtube.com/vi/8mei6uVttho/hqdefault.jpg',
    duration_seconds: 1680,
    position: 1,
    youtube_url: 'https://www.youtube.com/watch?v=8mei6uVttho',
    technology: 'Lógica & Algoritmos',
    topic: 'Introdução a Algoritmos',
    level: 'iniciante',
    status: 'ativo',
  }
  const { error: vidError } = await client.from('youtube_videos').upsert(testVideo)
  console.log('Video upsert:', { error: vidError })

  console.log('6. Inserting Lesson...')
  const testLesson = {
    id: 'l-logica-1',
    course_id: 'crs-logica',
    module_id: 'mod-logica',
    playlist_id: 'PLHz_AreHm4dmSj0MHol_aoNYCSGFqvfXV',
    order_index: 1,
    title: 'Curso de Algoritmos #01 - Introdução a Algoritmos',
    slug: 'curso-de-algoritmos-01',
    type: 'video',
    duration_min: 28,
    description: 'Aula fundamental de algoritmos.',
    video_id: '8mei6uVttho',
    external_video_id: '8mei6uVttho',
    video_url: 'https://www.youtube.com/watch?v=8mei6uVttho',
    source_label: 'Curso em Vídeo (Gustavo Guanabara)',
    thumbnail_url: 'https://img.youtube.com/vi/8mei6uVttho/hqdefault.jpg',
    source_type: 'youtube',
    availability_status: 'available',
    youtube_exists: true,
    embed_available: true,
  }
  const { error: lesError } = await client.from('lessons').upsert(testLesson)
  console.log('Lesson upsert:', { error: lesError })
}

testOrderedPersist().catch(console.error)
