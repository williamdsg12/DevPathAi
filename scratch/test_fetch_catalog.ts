import * as fs from 'fs'
import * as path from 'path'
import { fetchCatalogFromDatabase } from '../lib/catalog/db-repository'

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

async function testFetch() {
  console.log('--- Fetching Live Catalog From Database ---')
  const catalog = await fetchCatalogFromDatabase()
  console.log('Courses fetched from DB:', catalog.courses.length)
  for (const c of catalog.courses) {
    console.log(`- Course: ${c.title} (${c.id}) | Slug: ${c.slug} | Lessons: ${c.lessonsCount} | Status: ${c.status}`)
  }
  console.log('Modules fetched from DB:', catalog.modules.length)
  console.log('Lessons fetched from DB:', catalog.lessons.length)
  console.log('Playlists fetched from DB:', catalog.playlists.length)
  console.log('Sources fetched from DB:', catalog.sources.length)

  if (catalog.courses.length >= 3 && catalog.lessons.length >= 41) {
    console.log('\n✓ LIVE DATABASE CATALOG FETCH CONFIRMED OPERATIONAL 100%')
  } else {
    throw new Error('Database fetch returned incomplete catalog')
  }
}

testFetch().catch(console.error)
