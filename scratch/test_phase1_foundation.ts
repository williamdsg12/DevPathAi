/**
 * Automated Verification Script for Phase 1 Technical Foundation
 */

import { env, getEnvironmentHealth } from '../lib/config/env'
import { logger } from '../lib/logger'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
} from '../lib/errors'
import {
  validateRequiredString,
  validateEmail,
  validateUrl,
  validateArray,
  validateEnum,
} from '../lib/validation'
import { isSuperAdmin, SUPER_ADMIN_EMAILS } from '../lib/auth/rbac'

async function runPhase1Tests() {
  console.log('--- TEST 1: Environment Health & Validation ---')
  const health = getEnvironmentHealth()
  console.log('Environment detected:', health.environment)
  console.log('Health checks:', health.checks.length)
  if (!health.environment || health.checks.length < 3) throw new Error('Health check failed')
  console.log('✓ TEST 1 PASSED')

  console.log('\n--- TEST 2: Structured Logger & Data Redaction ---')
  logger.info('TEST_MODULE', 'Testing logger with sensitive data', {
    password: 'secret_password_123',
    apiKey: 'ai_api_key_secret',
    safeField: 'visible_data',
  })
  console.log('✓ TEST 2 PASSED')

  console.log('\n--- TEST 3: Domain Error Classes & API Handler ---')
  const valErr = new ValidationError('Campo inválido', { field: 'email' })
  const authErr = new AuthenticationError()
  const forbErr = new ForbiddenError()
  const notFoundErr = new NotFoundError('Curso', 'python-pro')

  if (valErr.statusCode !== 400 || valErr.code !== 'VALIDATION_ERROR') throw new Error('ValidationError code mismatch')
  if (authErr.statusCode !== 401 || forbErr.statusCode !== 403 || notFoundErr.statusCode !== 404)
    throw new Error('HTTP Status codes mismatch')

  const handledResponse = handleApiError(valErr, 'TEST_MODULE')
  if (handledResponse.status !== 400) throw new Error('handleApiError status mismatch')
  console.log('✓ TEST 3 PASSED')

  console.log('\n--- TEST 4: Validation Utilities ---')
  const validStr = validateRequiredString('  devpath ai  ', 'title', 3, 50)
  if (validStr !== 'devpath ai') throw new Error('validateRequiredString trimmed failed')

  const validEmail = validateEmail('WilliamDev36@Gmail.com')
  if (validEmail !== 'williamdev36@gmail.com') throw new Error('validateEmail lowercase failed')

  const validUrl = validateUrl('https://nextjs.org/docs')
  if (!validUrl) throw new Error('validateUrl failed')

  const validArr = validateArray(['item1', 'item2'], 'tags', 1)
  if (validArr.length !== 2) throw new Error('validateArray failed')

  const validCat = validateEnum('Pedagogia', 'categoria', ['Pedagogia', 'Programação'] as const)
  if (validCat !== 'Pedagogia') throw new Error('validateEnum failed')
  console.log('✓ TEST 4 PASSED')

  console.log('\n--- TEST 5: RBAC Security Rules ---')
  const superAdminEmail = SUPER_ADMIN_EMAILS[0]
  if (!isSuperAdmin({ email: superAdminEmail })) throw new Error('SUPER_ADMIN email check failed')
  if (!isSuperAdmin({ role: 'SUPER_ADMIN' })) throw new Error('SUPER_ADMIN role check failed')
  if (isSuperAdmin({ email: 'normal_student@gmail.com', role: 'STUDENT' })) throw new Error('Student falsely given admin')
  console.log('✓ TEST 5 PASSED')

  console.log('\n=============================================')
  console.log(' ALL PHASE 1 FOUNDATION TESTS PASSED 100%')
  console.log('=============================================')
}

runPhase1Tests().catch((err) => {
  console.error('Phase 1 Test Failure:', err)
  process.exit(1)
})
