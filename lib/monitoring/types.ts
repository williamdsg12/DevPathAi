/**
 * Observability, Catalog Health & Monitoring Types — DevPath AI
 */

export interface AIHealthMetrics {
  status: 'healthy' | 'degraded' | 'critical'
  provider: string
  activeModel: string
  activeVersion: string
  activeInstructionsCount: number
  totalInvocations24h: number
  errorRatePercent: number
  p95LatencyMs: number
  totalTokensUsed24h: number
  estimatedCostUsd24h: number
  lastCheckedAt: string
}

export interface CatalogHealthMetrics {
  status: 'healthy' | 'degraded' | 'critical'
  totalCourses: number
  activeCourses: number
  unavailableCourses: number
  draftCourses: number
  totalLessons: number
  totalModules: number
  playbackErrorReports: number
  syncJobStatus: 'idle' | 'running' | 'failed'
  lastSyncAt: string
}

export interface SystemAlert {
  id: string
  level: 'critical' | 'warning' | 'info'
  component: 'ai_orchestrator' | 'catalog' | 'billing' | 'player' | 'database'
  message: string
  details?: Record<string, any>
  resolved: boolean
  createdAt: string
  resolvedAt?: string
}
