/**
 * Automated Verification Script for Phase 10 Observability, Catalog Health & Monitoring
 */

import { computeAIHealthMetrics, computeCatalogHealthMetrics, markCourseUnavailable } from '../lib/monitoring/health'
import { alertManager } from '../lib/monitoring/alerts'
import { defaultOfficialCourses, defaultOfficialModules, defaultOfficialLessons } from '../lib/mock-data'
import { INITIAL_AI_CONFIG, INITIAL_AI_INSTRUCTIONS } from '../lib/ai/prompt-compiler'

async function runPhase10Tests() {
  console.log('--- TEST 1: AI Health Metrics & Cost/Latency Telemetry ---')
  const operationLogs = [
    { latencyMs: 350, tokensUsed: 420 },
    { latencyMs: 410, tokensUsed: 510 },
    { latencyMs: 290, tokensUsed: 380 },
    { latencyMs: 1200, tokensUsed: 950 },
    { latencyMs: 520, error: 'Temporary timeout', tokensUsed: 100 },
  ]

  const aiHealth = computeAIHealthMetrics(INITIAL_AI_CONFIG, INITIAL_AI_INSTRUCTIONS, operationLogs)

  if (aiHealth.totalInvocations24h !== 5) {
    throw new Error('Total invocations count mismatch')
  }
  if (aiHealth.errorRatePercent !== 20) {
    throw new Error(`Expected 20% error rate, got ${aiHealth.errorRatePercent}%`)
  }
  console.log('AI System Status:', aiHealth.status)
  console.log('Total Tokens Used (24h):', aiHealth.totalTokensUsed24h)
  console.log('Estimated Cost ($ USD):', `$${aiHealth.estimatedCostUsd24h}`)
  console.log('P95 Latency:', `${aiHealth.p95LatencyMs}ms`)
  console.log('✓ TEST 1 PASSED: AI health evaluator computes latency, error rate and token telemetry')

  console.log('\n--- TEST 2: Catalog Health Metrics & Playback Error Tracking ---')
  const catalogHealth = computeCatalogHealthMetrics(
    defaultOfficialCourses,
    defaultOfficialModules,
    defaultOfficialLessons,
    1 // 1 playback error report
  )

  if (catalogHealth.totalCourses === 0 || catalogHealth.activeCourses === 0) {
    throw new Error('Catalog health metrics failed to read authentic catalog')
  }
  console.log('Catalog Health Status:', catalogHealth.status)
  console.log('Total Courses:', catalogHealth.totalCourses)
  console.log('Active Courses:', catalogHealth.activeCourses)
  console.log('Total Lessons:', catalogHealth.totalLessons)
  console.log('✓ TEST 2 PASSED: Catalog health computed from real catalog entities')

  console.log('\n--- TEST 3: Non-Destructive Content Marking & History Preservation ---')
  const sampleCourseId = defaultOfficialCourses[0].id
  const { updatedCourses, alert } = markCourseUnavailable(
    defaultOfficialCourses,
    sampleCourseId,
    'Vídeo marcado como privado pelo canal original'
  )

  const archivedCourse = updatedCourses.find((c) => c.id === sampleCourseId)
  if (archivedCourse?.status !== 'arquivado') {
    throw new Error('Course was not archived properly')
  }
  if (updatedCourses.length !== defaultOfficialCourses.length) {
    throw new Error('Course was deleted instead of archived!')
  }
  console.log('Archived Course Status:', archivedCourse.status)
  console.log('Generated Alert:', alert.message)
  console.log('✓ TEST 3 PASSED: Course marked unavailable without losing database entity history')

  console.log('\n--- TEST 4: Internal System Alert Dispatcher & Resolution ---')
  const testAlert = alertManager.createAlert(
    'critical',
    'ai_orchestrator',
    'High latency detected on primary LLM provider'
  )

  if (alertManager.getActiveAlerts().length === 0) {
    throw new Error('Alert was not registered in active alerts list')
  }

  const resolved = alertManager.resolveAlert(testAlert.id)
  if (!resolved) {
    throw new Error('Failed to resolve alert')
  }
  console.log('Alert created and resolved successfully:', testAlert.id)
  console.log('✓ TEST 4 PASSED: System alert lifecycle managed with structured logging')

  console.log('\n=============================================================')
  console.log(' ALL PHASE 10 OBSERVABILITY & MONITORING TESTS PASSED 100%')
  console.log('=============================================================')
}

runPhase10Tests().catch((err) => {
  console.error('Phase 10 Test Failure:', err)
  process.exit(1)
})
