/**
 * System Health Evaluator & Telemetry Metrics — DevPath AI
 */

import type { AIHealthMetrics, CatalogHealthMetrics, SystemAlert } from './types'
import type { AIAgentConfig, AIInstruction, Course, LearningModule, Lesson } from '@/lib/types'

export function computeAIHealthMetrics(
  config?: AIAgentConfig | null,
  instructions: AIInstruction[] = [],
  operationLogs: Array<{ latencyMs?: number; error?: string; tokensUsed?: number }> = []
): AIHealthMetrics {
  const activeInstructions = instructions.filter((i) => i.active && i.status === 'published')
  const totalInvocations = operationLogs.length
  const failedOps = operationLogs.filter((l) => Boolean(l.error)).length
  const errorRatePercent = totalInvocations > 0 ? Math.round((failedOps / totalInvocations) * 1000) / 10 : 0

  const latencies = operationLogs.map((l) => l.latencyMs || 0).sort((a, b) => a - b)
  const p95Idx = Math.floor(latencies.length * 0.95)
  const p95LatencyMs = latencies[p95Idx] || 0

  const totalTokens = operationLogs.reduce((acc, l) => acc + (l.tokensUsed || 0), 0)
  // Gemini 1.5 Pro standard tier estimate (~$0.00125 per 1K tokens)
  const estimatedCostUsd24h = Math.round((totalTokens / 1000) * 0.00125 * 1000) / 1000

  let status: AIHealthMetrics['status'] = 'healthy'
  if (errorRatePercent > 10 || p95LatencyMs > 6000) {
    status = 'degraded'
  }
  if (errorRatePercent > 40) {
    status = 'critical'
  }

  return {
    status,
    provider: 'Google Gemini Pro / Native Multi-Provider',
    activeModel: config?.model || 'gemini-1.5-pro',
    activeVersion: config?.publishedVersion || 'v1.0',
    activeInstructionsCount: activeInstructions.length,
    totalInvocations24h: totalInvocations,
    errorRatePercent,
    p95LatencyMs,
    totalTokensUsed24h: totalTokens,
    estimatedCostUsd24h,
    lastCheckedAt: new Date().toISOString(),
  }
}

export function computeCatalogHealthMetrics(
  courses: Course[] = [],
  modules: LearningModule[] = [],
  lessons: Lesson[] = [],
  playbackErrorsCount = 0
): CatalogHealthMetrics {
  const activeCourses = courses.filter((c) => c.status === 'ativo').length
  const unavailableCourses = courses.filter((c) => (c.status as string) === 'indisponivel' || c.status === 'arquivado').length
  const draftCourses = courses.filter((c) => c.status === 'rascunho').length

  let status: CatalogHealthMetrics['status'] = 'healthy'
  if (unavailableCourses > 0 || playbackErrorsCount > 5) {
    status = 'degraded'
  }
  if (unavailableCourses > courses.length * 0.3 && courses.length > 0) {
    status = 'critical'
  }

  return {
    status,
    totalCourses: courses.length,
    activeCourses,
    unavailableCourses,
    draftCourses,
    totalLessons: lessons.length,
    totalModules: modules.length,
    playbackErrorReports: playbackErrorsCount,
    syncJobStatus: 'idle',
    lastSyncAt: new Date().toISOString(),
  }
}

/**
 * Revalidates catalog courses against availability status without destroying history.
 */
export function markCourseUnavailable(
  courses: Course[],
  courseId: string,
  reason: string
): { updatedCourses: Course[]; alert: SystemAlert } {
  const updatedCourses = courses.map((c) => {
    if (c.id === courseId) {
      return {
        ...c,
        status: 'arquivado' as const, // Safely archive/mark unavailable without deleting records
        updatedAt: new Date().toISOString(),
      }
    }
    return c
  })

  const alert: SystemAlert = {
    id: `alt_${Date.now()}`,
    level: 'warning',
    component: 'catalog',
    message: `Curso ${courseId} marcado como indisponível: ${reason}`,
    resolved: false,
    createdAt: new Date().toISOString(),
  }

  return { updatedCourses, alert }
}
