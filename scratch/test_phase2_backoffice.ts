/**
 * Automated Verification Script for Phase 2 Backoffice & Security
 */

import {
  getUserRole,
  isSuperAdmin,
  canAccessAdminArea,
  hasPermission,
  ROLE_PERMISSIONS,
  SUPER_ADMIN_EMAILS,
} from '../lib/auth/rbac'
import type { UserRole } from '../lib/types'

async function runPhase2Tests() {
  console.log('--- TEST 1: Role Extraction & Normalization ---')
  const superAdmin = { email: 'williamdev36@gmail.com', role: 'SUPER_ADMIN' as UserRole }
  const adminUser = { email: 'admin@devpath.ai', role: 'ADMIN' as UserRole }
  const curatorUser = { email: 'curator@devpath.ai', role: 'CURATOR' as UserRole }
  const supportUser = { email: 'support@devpath.ai', role: 'SUPPORT' as UserRole }
  const studentUser = { email: 'student@gmail.com', role: 'STUDENT' as UserRole }

  if (getUserRole(superAdmin) !== 'SUPER_ADMIN') throw new Error('Super Admin role failed')
  if (getUserRole(adminUser) !== 'ADMIN') throw new Error('Admin role failed')
  if (getUserRole(curatorUser) !== 'CURATOR') throw new Error('Curator role failed')
  if (getUserRole(supportUser) !== 'SUPPORT') throw new Error('Support role failed')
  if (getUserRole(studentUser) !== 'STUDENT') throw new Error('Student role failed')
  console.log('✓ TEST 1 PASSED: All 5 roles extracted accurately')

  console.log('\n--- TEST 2: Backoffice Access Control & Student Protection ---')
  if (!canAccessAdminArea(superAdmin)) throw new Error('Super Admin blocked')
  if (!canAccessAdminArea(adminUser)) throw new Error('Admin blocked')
  if (!canAccessAdminArea(curatorUser)) throw new Error('Curator blocked')
  if (!canAccessAdminArea(supportUser)) throw new Error('Support blocked')
  if (canAccessAdminArea(studentUser)) throw new Error('CRITICAL: Student allowed in Admin!')
  if (canAccessAdminArea(null)) throw new Error('CRITICAL: Unauthenticated allowed in Admin!')
  console.log('✓ TEST 2 PASSED: Students and unauthenticated strictly blocked')

  console.log('\n--- TEST 3: Granular Permission Matrix ---')
  if (!hasPermission(superAdmin, 'manageUsers')) throw new Error('Super Admin missing manageUsers')
  if (!hasPermission(superAdmin, 'manageFinance')) throw new Error('Super Admin missing manageFinance')
  if (!hasPermission(adminUser, 'manageCatalog')) throw new Error('Admin missing manageCatalog')
  if (hasPermission(adminUser, 'manageFinance')) throw new Error('Admin falsely allowed manageFinance')
  if (!hasPermission(curatorUser, 'curateContent')) throw new Error('Curator missing curateContent')
  if (hasPermission(curatorUser, 'manageUsers')) throw new Error('Curator falsely allowed manageUsers')
  if (!hasPermission(supportUser, 'supportStudents')) throw new Error('Support missing supportStudents')
  if (hasPermission(supportUser, 'manageAI')) throw new Error('Support falsely allowed manageAI')
  console.log('✓ TEST 3 PASSED: Permission matrix enforces strict least-privilege')

  console.log('\n======================================================')
  console.log(' ALL PHASE 2 BACKOFFICE & SECURITY TESTS PASSED 100%')
  console.log('======================================================')
}

runPhase2Tests().catch((err) => {
  console.error('Phase 2 Test Failure:', err)
  process.exit(1)
})
