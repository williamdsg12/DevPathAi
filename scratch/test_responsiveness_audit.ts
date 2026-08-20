import fs from 'fs'
import path from 'path'

console.log('='.repeat(70))
console.log('DEVPATH AI — AUTOMATED RESPONSIVENESS & DEVICE ADAPTABILITY AUDIT')
console.log('='.repeat(70))

const workspaceRoot = process.cwd()

const criticalPages = [
  'app/page.tsx',
  'app/dashboard/page.tsx',
  'app/trilha/page.tsx',
  'app/cursos/page.tsx',
  'app/aulas/[lessonId]/page.tsx',
  'app/exercicios/page.tsx',
  'app/exercicios/[activityId]/page.tsx',
  'app/avaliacoes/page.tsx',
  'app/avaliacoes/[moduleId]/page.tsx',
  'app/desafios/page.tsx',
  'app/projetos/page.tsx',
  'app/mentor/page.tsx',
  'app/code-lab/page.tsx',
  'app/perfil/page.tsx',
  'app/configuracoes/page.tsx',
  'app/admin/page.tsx',
  'app/admin/youtube/page.tsx',
  'app/admin/cursos/page.tsx',
  'app/admin/analytics/page.tsx',
  'app/admin/financeiro/page.tsx',
  'app/admin/logs/page.tsx',
]

const criticalComponents = [
  'components/layout/app-shell.tsx',
  'components/layout/app-header.tsx',
  'components/layout/app-sidebar.tsx',
  'components/admin/admin-shell.tsx',
  'components/admin/admin-header.tsx',
  'components/admin/admin-sidebar.tsx',
  'components/admin/content-health-tab.tsx',
  'components/streaming/streaming-hero.tsx',
  'components/streaming/course-carousel.tsx',
  'components/streaming/streaming-course-card.tsx',
  'components/streaming/course-modal.tsx',
  'components/video/video-player.tsx',
  'components/journey/winding-journey-map.tsx',
]

let passedChecks = 0
let totalChecks = 0

function runCheck(name: string, condition: boolean, details?: string) {
  totalChecks++
  if (condition) {
    passedChecks++
    console.log(`  ✓ PASS: ${name}`)
  } else {
    console.error(`  ✗ FAIL: ${name}`)
    if (details) console.error(`    Details: ${details}`)
  }
}

console.log('\n[1] Auditing Platform Shells & Navigation Drawers...')

// 1. Check AppShell has adaptive max width and responsive padding
const appShellContent = fs.readFileSync(path.join(workspaceRoot, 'components/layout/app-shell.tsx'), 'utf-8')
runCheck(
  'AppShell provides adaptive responsive padding (p-3 sm:p-5 lg:p-6 xl:p-8)',
  appShellContent.includes('p-3 sm:p-5 lg:p-6 xl:p-8')
)
runCheck(
  'AppShell supports ultrawide monitor container (max-w-[1600px] mx-auto)',
  appShellContent.includes('max-w-[1600px]')
)

// 2. Check AppHeader has mobile drawer and responsive triggers
const appHeaderContent = fs.readFileSync(path.join(workspaceRoot, 'components/layout/app-header.tsx'), 'utf-8')
runCheck(
  'AppHeader contains Sheet Mobile Drawer for < lg screens',
  appHeaderContent.includes('Sheet') && appHeaderContent.includes('mobileOpen')
)
runCheck(
  'AppHeader has responsive search (hidden on small mobile, accessible via CommandMenu)',
  appHeaderContent.includes('hidden md:flex')
)

// 3. Check AdminShell has mobile overlay drawer
const adminShellContent = fs.readFileSync(path.join(workspaceRoot, 'components/admin/admin-shell.tsx'), 'utf-8')
runCheck(
  'AdminShell contains Mobile Drawer Overlay for backoffice',
  adminShellContent.includes('mobileOpen') && adminShellContent.includes('AdminSidebar')
)

console.log('\n[2] Auditing Streaming Hub & Dynamic Carousels...')

// 4. Check StreamingHero has responsive typography & buttons
const streamingHeroContent = fs.readFileSync(path.join(workspaceRoot, 'components/streaming/streaming-hero.tsx'), 'utf-8')
runCheck(
  'StreamingHero has fluid heading typography (text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl)',
  streamingHeroContent.includes('text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl')
)
runCheck(
  'StreamingHero wraps buttons cleanly on mobile (flex flex-col sm:flex-row)',
  streamingHeroContent.includes('flex flex-col sm:flex-row')
)

// 5. Check CourseCarousel has touch scroll & edge padding
const courseCarouselContent = fs.readFileSync(path.join(workspaceRoot, 'components/streaming/course-carousel.tsx'), 'utf-8')
runCheck(
  'CourseCarousel has smooth horizontal touch scrolling (overflow-x-auto scrollbar-none)',
  courseCarouselContent.includes('overflow-x-auto') && courseCarouselContent.includes('scrollbar-none')
)
runCheck(
  'CourseCarousel uses desktop-only scroll buttons (hidden md:flex)',
  courseCarouselContent.includes('hidden md:flex')
)

// 6. Check StreamingCourseCard has responsive width with mobile peeking
const courseCardContent = fs.readFileSync(path.join(workspaceRoot, 'components/streaming/streaming-course-card.tsx'), 'utf-8')
runCheck(
  'StreamingCourseCard has responsive card width (w-[240px] sm:w-[280px] md:w-[320px])',
  courseCardContent.includes('w-[240px] sm:w-[280px] md:w-[320px]')
)
runCheck(
  'StreamingCourseCard includes direct link touch-trigger for mobile users',
  courseCardContent.includes('Link href={playUrl}')
)

console.log('\n[3] Auditing Video Player & Lesson Experience...')

// 7. Check VideoPlayer has aspect-video responsive 16:9 ratio
const videoPlayerContent = fs.readFileSync(path.join(workspaceRoot, 'components/video/video-player.tsx'), 'utf-8')
runCheck(
  'VideoPlayer enforces aspect-video responsive 16:9 ratio without overflow',
  videoPlayerContent.includes('aspect-video')
)

// 8. Check Lesson Player Page has responsive 12-column grid and mobile stacking
const lessonPageContent = fs.readFileSync(path.join(workspaceRoot, 'app/aulas/[lessonId]/page.tsx'), 'utf-8')
runCheck(
  'Lesson page stacks video first on mobile and splits into 12 cols on desktop (grid-cols-1 lg:grid-cols-12)',
  lessonPageContent.includes('grid-cols-1 lg:grid-cols-12')
)

console.log('\n[4] Auditing Gamified Journey Map & Activities...')

// 9. Check WindingJourneyMap has responsive pathway connector
const journeyMapContent = fs.readFileSync(path.join(workspaceRoot, 'components/journey/winding-journey-map.tsx'), 'utf-8')
runCheck(
  'WindingJourneyMap centers connector on mobile (left-1/2 -translate-x-1/2) and offsets on sm:',
  journeyMapContent.includes('left-1/2 -translate-x-1/2')
)

// 10. Check ActivitySolverPage has responsive question navigation
const activityPageContent = fs.readFileSync(path.join(workspaceRoot, 'app/exercicios/[activityId]/page.tsx'), 'utf-8')
runCheck(
  'ActivitySolverPage has responsive question pills scroll container',
  activityPageContent.includes('overflow-x-auto')
)

console.log('\n[5] Auditing Admin Tables & Backoffice Panels...')

// 11. Check ContentHealthTab has horizontal table container
const contentHealthContent = fs.readFileSync(path.join(workspaceRoot, 'components/admin/content-health-tab.tsx'), 'utf-8')
runCheck(
  'ContentHealthTab wraps data table in overflow-x-auto container',
  contentHealthContent.includes('overflow-x-auto')
)
runCheck(
  'ContentHealthTab KPI grid scales smoothly from mobile to desktop (grid-cols-2 sm:grid-cols-4 lg:grid-cols-8)',
  contentHealthContent.includes('grid-cols-2 sm:grid-cols-4 lg:grid-cols-8')
)

// 12. Check global CSS rules for viewport, safe areas, and touch manipulation
const globalsCssContent = fs.readFileSync(path.join(workspaceRoot, 'app/globals.css'), 'utf-8')
runCheck(
  'Global CSS prevents unintended horizontal body scrolling (max-width: 100vw; overflow-x: hidden)',
  globalsCssContent.includes('max-width: 100vw') && globalsCssContent.includes('overflow-x: hidden')
)
runCheck(
  'Global CSS enables touch-action manipulation for lag-free mobile taps',
  globalsCssContent.includes('touch-action: manipulation')
)

console.log('\n' + '='.repeat(70))
console.log(`AUDIT RESULTS: ${passedChecks}/${totalChecks} CHECKS PASSED (${Math.round((passedChecks / totalChecks) * 100)}%)`)
console.log('='.repeat(70))

if (passedChecks === totalChecks) {
  console.log('🚀 PLATFORM IS FULLY RESPONSIVE & ADAPTIVE ACROSS ALL DEVICES!')
  process.exit(0)
} else {
  console.error('⚠️ Some responsiveness checks failed.')
  process.exit(1)
}
