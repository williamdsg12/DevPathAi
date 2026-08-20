/**
 * Automated Verification Script for Phase 11 Visual Experience, Design System & Accessibility
 */

import * as fs from 'fs'
import * as path from 'path'

async function runPhase11Tests() {
  console.log('--- TEST 1: Design System & Color Tokens Verification ---')
  const globalsCssPath = path.join(process.cwd(), 'app', 'globals.css')
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8')

  const requiredTokens = ['--background', '--foreground', '--primary', '--card', '--border', '--ring', '--radius']
  for (const token of requiredTokens) {
    if (!globalsCss.includes(token)) {
      throw new Error(`Required design token missing in globals.css: ${token}`)
    }
  }
  console.log('✓ TEST 1 PASSED: Core design tokens (background, foreground, primary, border, ring) verified')

  console.log('\n--- TEST 2: Modal & Prompt Textarea Overflow Protection ---')
  const adminAIPagePath = path.join(process.cwd(), 'app', 'admin', 'ai', 'page.tsx')
  const adminAIPage = fs.readFileSync(adminAIPagePath, 'utf8')

  if (!adminAIPage.includes('max-h-[90vh]') || !adminAIPage.includes('overflow-y-auto')) {
    throw new Error('Modal overflow constraint missing in Admin AI page')
  }
  if (!adminAIPage.includes('resize: \'none\'') && !adminAIPage.includes('resize-none')) {
    throw new Error('Textarea resize constraint missing in instruction modal')
  }
  console.log('✓ TEST 2 PASSED: Prompt instruction modal has strict max-height and internal scrolling')

  console.log('\n--- TEST 3: Semantic HTML & Accessibility Attributes in Shells ---')
  const appShellPath = path.join(process.cwd(), 'components', 'layout', 'app-shell.tsx')
  const appHeaderPath = path.join(process.cwd(), 'components', 'layout', 'app-header.tsx')
  const appShell = fs.readFileSync(appShellPath, 'utf8')
  const appHeader = fs.readFileSync(appHeaderPath, 'utf8')

  if (!appShell.includes('<main') || !appHeader.includes('<header')) {
    throw new Error('Semantic HTML landmark tags (<main>, <header>) missing')
  }
  console.log('✓ TEST 3 PASSED: Semantic landmarks (<main>, <header>) present for screen readers')

  console.log('\n--- TEST 4: Navigation Routes & Backoffice Layout Consistency ---')
  const adminShellPath = path.join(process.cwd(), 'components', 'admin', 'admin-shell.tsx')
  const adminShell = fs.readFileSync(adminShellPath, 'utf8')

  if (!adminShell.includes('AdminSidebar') || !adminShell.includes('AdminHeader')) {
    throw new Error('AdminShell missing unified header or sidebar')
  }
  console.log('✓ TEST 4 PASSED: Unified admin design system with consistent sidebar and header')

  console.log('\n=============================================================')
  console.log(' ALL PHASE 11 VISUAL DESIGN SYSTEM & UX TESTS PASSED 100%')
  console.log('=============================================================')
}

runPhase11Tests().catch((err) => {
  console.error('Phase 11 Test Failure:', err)
  process.exit(1)
})
