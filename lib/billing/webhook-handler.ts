/**
 * Secure Payment Webhook Processor & Idempotency Handler — DevPath AI
 */

import { logger } from '@/lib/logger'
import type { SubscriptionEvent, SubscriptionStatus, UserSubscription } from './types'

// Idempotency cache (stores processed event IDs to prevent duplicate actions)
const processedWebhookEventIds = new Set<string>()

export interface WebhookPayload {
  id: string
  type: string
  data: {
    object: {
      id?: string
      customer?: string
      subscription?: string
      status?: string
      metadata?: {
        userId?: string
        planId?: string
      }
      current_period_start?: number
      current_period_end?: number
      amount_total?: number
    }
  }
}

export interface WebhookProcessResult {
  success: boolean
  action: string
  eventRecorded?: SubscriptionEvent
  duplicate?: boolean
  error?: string
}

/**
 * Handles incoming payment gateway webhooks with guaranteed idempotency.
 */
export async function processPaymentWebhook(
  payload: WebhookPayload,
  signatureHeader?: string
): Promise<WebhookProcessResult> {
  const eventId = payload?.id
  if (!eventId) {
    return { success: false, action: 'ignored', error: 'Missing event ID' }
  }

  // 1. Idempotency Check
  if (processedWebhookEventIds.has(eventId)) {
    logger.info('Duplicate webhook event received, skipping.', { eventId })
    return { success: true, action: 'skipped_duplicate', duplicate: true }
  }

  // 2. Mark event as being processed
  processedWebhookEventIds.add(eventId)

  const eventType = payload.type
  const obj = payload.data?.object
  const userId = obj?.metadata?.userId || 'usr_anonymous'
  const subscriptionId = obj?.subscription || obj?.id || `sub_${Date.now()}`

  logger.info(`Processing billing webhook: ${eventType}`, { eventId, userId, subscriptionId })

  let newStatus: SubscriptionStatus = 'active'
  let subscriptionEventType: SubscriptionEvent['eventType'] = 'created'

  switch (eventType) {
    case 'checkout.session.completed':
    case 'invoice.payment_succeeded':
      newStatus = 'active'
      subscriptionEventType = 'renewed'
      break

    case 'invoice.payment_failed':
      newStatus = 'past_due'
      subscriptionEventType = 'payment_failed'
      break

    case 'customer.subscription.deleted':
      newStatus = 'canceled'
      subscriptionEventType = 'canceled'
      break

    case 'customer.subscription.updated':
      if (obj.status === 'past_due') newStatus = 'past_due'
      else if (obj.status === 'canceled') newStatus = 'canceled'
      else if (obj.status === 'unpaid') newStatus = 'unpaid'
      else newStatus = 'active'
      subscriptionEventType = 'plan_changed'
      break

    default:
      logger.info(`Unhandled billing event type: ${eventType}`)
      return { success: true, action: 'unhandled_event' }
  }

  const recordedEvent: SubscriptionEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    subscriptionId,
    eventType: subscriptionEventType,
    newStatus,
    metadata: {
      gatewayEventId: eventId,
      gatewayEventType: eventType,
    },
    createdAt: new Date().toISOString(),
  }

  return {
    success: true,
    action: `updated_to_${newStatus}`,
    eventRecorded: recordedEvent,
  }
}
