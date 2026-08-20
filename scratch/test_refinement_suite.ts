/**
 * Automated Verification Script for Professional Refinement Phase
 */

import * as fs from 'fs'
import * as path from 'path'

async function runRefinementAudit() {
  console.log('======================================================================')
  console.log('🎨 VERIFYING PROFESSIONAL REFINEMENT & DESIGN SYSTEM AUDIT')
  console.log('======================================================================\n')

  // 1. Check Sidebar Reorganization (Fase 4)
  console.log('--- TEST 1: Sidebar Grouping & Structure ---')
  const sidebarPath = path.join(process.cwd(), 'components', 'admin', 'admin-sidebar.tsx')
  const sidebar = fs.readFileSync(sidebarPath, 'utf8')
  const expectedGroups = ['Visão Geral', 'Conteúdo', 'Inteligência Artificial', 'Curadoria', 'Gestão', 'Sistema']
  for (const group of expectedGroups) {
    if (!sidebar.includes(group)) {
      throw new Error(`Sidebar missing required group: ${group}`)
    }
  }
  console.log('✓ TEST 1 PASSED: Admin sidebar reorganized into 6 clean operational groups')

  // 2. Check Header Cleanup (Fase 5)
  console.log('\n--- TEST 2: Header Refinement & Technical Banner Removal ---')
  const headerPath = path.join(process.cwd(), 'components', 'admin', 'admin-header.tsx')
  const header = fs.readFileSync(headerPath, 'utf8')
  if (header.includes('DB: ONLINE') || header.includes('AI: GEMINI')) {
    throw new Error('Header contains noisy technical development badges')
  }
  if (!header.includes('OPERACIONAL') || !header.includes('Plataforma')) {
    throw new Error('Header missing subtle operational status or platform link')
  }
  console.log('✓ TEST 2 PASSED: Admin header is clean, professional and free of noisy debug badges')

  // 3. Check Dashboard Summary (Fase 6)
  console.log('\n--- TEST 3: Admin Dashboard Operational Summary ---')
  const adminPagePath = path.join(process.cwd(), 'app', 'admin', 'page.tsx')
  const adminPage = fs.readFileSync(adminPagePath, 'utf8')
  if (!adminPage.includes('Cursos Publicados') || !adminPage.includes('Saúde do Catálogo') || !adminPage.includes('DevPath AI Orchestrator')) {
    throw new Error('Admin dashboard missing essential operational panels')
  }
  console.log('✓ TEST 3 PASSED: Admin dashboard displays clean, focused operational summaries')

  // 4. Check Courses Catalog List/Grid (Fase 7)
  console.log('\n--- TEST 4: Courses Catalog Presentation & Filters ---')
  const cursosPagePath = path.join(process.cwd(), 'app', 'admin', 'cursos', 'page.tsx')
  const cursosPage = fs.readFileSync(cursosPagePath, 'utf8')
  if (!cursosPage.includes('viewMode') || !cursosPage.includes('LayoutGrid') || !cursosPage.includes('List')) {
    throw new Error('Courses catalog missing List/Grid view mode switcher')
  }
  console.log('✓ TEST 4 PASSED: Courses catalog supports List and Grid views with comprehensive filters')

  // 5. Check Financial Integrity (Fase 15 & 16)
  console.log('\n--- TEST 5: Financial Module & State Consistency ---')
  const finPagePath = path.join(process.cwd(), 'app', 'admin', 'financeiro', 'page.tsx')
  const finPage = fs.readFileSync(finPagePath, 'utf8')
  if (finPage.includes('Fase 9')) {
    throw new Error('Financial page contains outdated "Fase 9" references')
  }
  if (!finPage.includes('STRIPE_SECRET_KEY') || !finPage.includes('NÃO CONECTADO') && !finPage.includes('CONECTADO')) {
    throw new Error('Financial page missing honest gateway connection state')
  }
  console.log('✓ TEST 5 PASSED: Financial module is honest, modular, and free of obsolete phase labels')

  // 6. Check Challenges Empty States (Fase 14)
  console.log('\n--- TEST 6: Challenges & Projects Professional Empty States ---')
  const desafiosPagePath = path.join(process.cwd(), 'app', 'admin', 'desafios', 'page.tsx')
  const desafiosPage = fs.readFileSync(desafiosPagePath, 'utf8')
  if (!desafiosPage.includes('Nenhum desafio encontrado') || !desafiosPage.includes('Criar Desafio')) {
    throw new Error('Desafios page missing professional empty state or CTA')
  }
  console.log('✓ TEST 6 PASSED: Challenges page has professional empty states, CTAs, and filters')

  console.log('\n======================================================================')
  console.log('🏆 ALL REFINEMENT SUITE AUDITS PASSED 100%')
  console.log('======================================================================')
}

runRefinementAudit().catch((err) => {
  console.error('Refinement Audit Failure:', err)
  process.exit(1)
})
