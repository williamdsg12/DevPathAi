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

async function auditSupabase() {
  console.log('--- Testing Supabase Connection & Tables ---')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', Boolean(supabaseKey))

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    return
  }

  const client = createClient(supabaseUrl, supabaseKey)

  // Check courses table
  const { data: courses, error: coursesError } = await client.from('courses').select('*').limit(5)
  console.log('Courses table query:', { count: courses?.length, error: coursesError })
  if (courses && courses.length > 0) {
    console.log('Sample course:', courses[0].title, courses[0].id)
  }

  // Check modules table
  const { data: modules, error: modulesError } = await client.from('modules').select('*').limit(5)
  console.log('Modules table query:', { count: modules?.length, error: modulesError })

  // Check lessons table
  const { data: lessons, error: lessonsError } = await client.from('lessons').select('*').limit(5)
  console.log('Lessons table query:', { count: lessons?.length, error: lessonsError })

  // Check youtube_playlists table
  const { data: playlists, error: playlistsError } = await client.from('youtube_playlists').select('*').limit(5)
  console.log('Playlists table query:', { count: playlists?.length, error: playlistsError })

  // Check youtube_videos table
  const { data: videos, error: videosError } = await client.from('youtube_videos').select('*').limit(5)
  console.log('Videos table query:', { count: videos?.length, error: videosError })

  // Check content_sources table
  const { data: sources, error: sourcesError } = await client.from('content_sources').select('*').limit(5)
  console.log('Content Sources table query:', { count: sources?.length, error: sourcesError })
}

auditSupabase().catch(console.error)
