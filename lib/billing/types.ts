/**
 * SaaS Billing, Subscription & Commercial Infrastructure Types — DevPath AI
 */

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'unpaid'
  | 'incomplete'

export type BillingInterval = 'monthly' | 'quarterly' | 'yearly'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  active: boolean
  features: string[]
  limits: {
    mentorAiQueriesPerDay: number // -1 = unlimited
    projectsAllowed: number // -1 = unlimited
    certificatesAllowed: boolean
    interviewSimulator: boolean
    codeLabExecution: boolean
  }
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  interval: BillingInterval
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialStart?: string
  trialEnd?: string
  canceledAt?: string
  gatewayCustomerId?: string
  gatewaySubscriptionId?: string
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface BillingInvoice {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  paidAt?: string
  invoicePdfUrl?: string
  hostedInvoiceUrl?: string
  gatewayInvoiceId?: string
  createdAt: string
}

export interface Coupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number
  currentUses: number
  expiresAt?: string
  active: boolean
}

export interface SubscriptionEvent {
  id: string
  userId: string
  subscriptionId: string
  eventType:
    | 'created'
    | 'renewed'
    | 'plan_changed'
    | 'payment_failed'
    | 'canceled'
    | 'reactivated'
    | 'expired'
  previousStatus?: SubscriptionStatus
  newStatus: SubscriptionStatus
  metadata?: Record<string, any>
  createdAt: string
}
