/**
 * Backend Access Control & Entitlement Engine — DevPath AI
 *
 * Enforces access permissions to courses, lessons, AI queries, projects, and certificates
 * according to authentic user subscription status.
 */

import type { UserSubscription } from './types'
import { OFFICIAL_PLANS } from './plans'

export interface AccessCheckResult {
  allowed: boolean
  reason?: string
  requiredPlan?: string
}

export function isSubscriptionActive(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false
  const activeStatuses: UserSubscription['status'][] = ['active', 'trial']
  if (!activeStatuses.includes(subscription.status)) return false

  // Check period expiration
  if (subscription.currentPeriodEnd) {
    const end = new Date(subscription.currentPeriodEnd).getTime()
    if (end < Date.now()) return false
  }

  return true
}

export function isPaidPlanActive(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false
  if (subscription.planId === 'plan_starter' || subscription.planId === 'starter') return false
  return isSubscriptionActive(subscription)
}

/**
 * Validates whether the user can access a specific lesson.
 * Free tier allows the first 3 lessons of any course or any lesson in introductory modules.
 */
export function canAccessLesson(
  subscription: UserSubscription | null | undefined,
  lessonOrder: number,
  isIntroductoryModule = false
): AccessCheckResult {
  if (isIntroductoryModule || lessonOrder <= 3) {
    return { allowed: true }
  }

  if (isPaidPlanActive(subscription)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'A partir da 4ª aula é necessário possuir uma assinatura DevPath Pro ativa.',
    requiredPlan: 'pro',
  }
}

/**
 * Validates whether the user can use the contextual Mentor AI.
 */
export function canAccessMentorAI(
  subscription: UserSubscription | null | undefined,
  dailyQueriesUsed = 0
): AccessCheckResult {
  if (isPaidPlanActive(subscription)) {
    return { allowed: true }
  }

  const starterLimit = OFFICIAL_PLANS.find((p) => p.id === 'plan_starter')?.limits.mentorAiQueriesPerDay || 10
  if (dailyQueriesUsed < starterLimit) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `Você atingiu o limite de ${starterLimit} perguntas diárias ao Mentor AI no plano gratuito. Faça upgrade para o DevPath Pro para acesso ilimitado.`,
    requiredPlan: 'pro',
  }
}

/**
 * Validates whether the user can submit practical projects for AI review.
 */
export function canSubmitProject(
  subscription: UserSubscription | null | undefined
): AccessCheckResult {
  if (isPaidPlanActive(subscription)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'A submissão de projetos com avaliação de rubricas por IA é um benefício exclusivo do DevPath Pro.',
    requiredPlan: 'pro',
  }
}

/**
 * Validates whether the user can issue an official certificate.
 */
export function canIssueCertificate(
  subscription: UserSubscription | null | undefined
): AccessCheckResult {
  if (isPaidPlanActive(subscription)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'A emissão de certificados oficiais autenticados requer o plano DevPath Pro.',
    requiredPlan: 'pro',
  }
}
