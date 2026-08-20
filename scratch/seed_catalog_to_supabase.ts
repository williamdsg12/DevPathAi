import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import { defaultOfficialCourses, defaultOfficialModules, defaultOfficialLessons, defaultContentSources } from '../lib/mock-data'
import { persistCoursePackageToDatabase } from '../lib/catalog/db-repository'

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

async function runSeed() {
  console.log('Seeding initial verified courses into Supabase PostgreSQL...')
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  for (const course of defaultOfficialCourses) {
    console.log(`\n--- Persisting Course: ${course.title} (${course.id}) ---`)
    const courseModules = defaultOfficialModules.filter(
      (m) => m.courseId === course.id || m.phase === course.category
    )
    const courseLessons = defaultOfficialLessons.filter((l) =>
      courseModules.some((m) => m.id === l.moduleId)
    )

    const result = await persistCoursePackageToDatabase({
      course,
      modules: courseModules,
      lessons: courseLessons,
      channel: defaultContentSources[0],
      adminEmail: 'williamdev36@gmail.com',
    })

    console.log(`Result for ${course.id}:`, result)
  }

  console.log('\n--- Verifying Row Counts in Supabase Database ---')
  const [coursesCount, modulesCount, lessonsCount, videosCount, sourcesCount] = await Promise.all([
    client.from('courses').select('id', { count: 'exact', head: true }),
    client.from('modules').select('id', { count: 'exact', head: true }),
    client.from('lessons').select('id', { count: 'exact', head: true }),
    client.from('youtube_videos').select('id', { count: 'exact', head: true }),
    client.from('content_sources').select('id', { count: 'exact', head: true }),
  ])

  console.log('Final DB Count Summary:', {
    courses: coursesCount.count,
    modules: modulesCount.count,
    lessons: lessonsCount.count,
    videos: videosCount.count,
    content_sources: sourcesCount.count,
  })
}

runSeed().catch(console.error)
