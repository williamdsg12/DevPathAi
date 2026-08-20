/**
 * Official SaaS Subscription Plans & Coupon Engine — DevPath AI
 */

import type { Coupon, SubscriptionPlan } from './types'

export const OFFICIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter (Gratuito)',
    slug: 'starter',
    description: 'Acesso inicial aos fundamentos e primeiros módulos.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'BRL',
    active: true,
    features: [
      'Acesso aos módulos de Fundamentos e Lógica',
      'Exercícios práticos introdutórios',
      'Code Lab Sandbox básico',
      'Comunidade aberta de alunos',
    ],
    limits: {
      mentorAiQueriesPerDay: 10,
      projectsAllowed: 1,
      certificatesAllowed: false,
      interviewSimulator: false,
      codeLabExecution: true,
    },
  },
  {
    id: 'plan_pro',
    name: 'DevPath Pro',
    slug: 'pro',
    description: 'Acesso completo à plataforma, Mentor IA ilimitado e certificados.',
    priceMonthly: 69.9,
    priceYearly: 699.0, // Equivalente a ~R$ 58,25/mês
    currency: 'BRL',
    active: true,
    features: [
      'Acesso a todos os cursos e trilhas do catálogo',
      'DevMentor AI com contexto completo e sem limites',
      'Revisão automatizada de projetos por rubricas',
      'Simulador de entrevistas técnicas e carreira',
      'Certificados oficiais autenticados por blockchain/hash',
      'Acesso antecipado a novos cursos e tecnologias',
    ],
    limits: {
      mentorAiQueriesPerDay: -1, // Unlimited
      projectsAllowed: -1, // Unlimited
      certificatesAllowed: true,
      interviewSimulator: true,
      codeLabExecution: true,
    },
  },
  {
    id: 'plan_enterprise',
    name: 'DevPath Enterprise / Team',
    slug: 'enterprise',
    description: 'Para empresas e equipes acelerarem a formação de desenvolvedores.',
    priceMonthly: 199.0,
    priceYearly: 1990.0,
    currency: 'BRL',
    active: true,
    features: [
      'Tudo do Plano Pro para toda a equipe',
      'Painel de gestão de progresso do time (B2B)',
      'Trilhas corporativas personalizadas',
      'Suporte técnico e pedagógico prioritário via Slack/Discord',
    ],
    limits: {
      mentorAiQueriesPerDay: -1,
      projectsAllowed: -1,
      certificatesAllowed: true,
      interviewSimulator: true,
      codeLabExecution: true,
    },
  },
]

export const OFFICIAL_COUPONS: Coupon[] = [
  {
    code: 'BEMVINDO30',
    discountType: 'percentage',
    discountValue: 30,
    maxUses: 500,
    currentUses: 42,
    active: true,
  },
  {
    code: 'DEVPATH10',
    discountType: 'percentage',
    discountValue: 10,
    active: true,
    currentUses: 15,
  },
  {
    code: 'DEVPRIME50',
    discountType: 'fixed',
    discountValue: 50,
    active: true,
    currentUses: 8,
  },
]

/**
 * Calculates final price after coupon discount.
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  coupon?: Coupon | null
): { finalPrice: number; discountAmount: number; isValid: boolean } {
  if (!coupon || !coupon.active) {
    return { finalPrice: originalPrice, discountAmount: 0, isValid: false }
  }

  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { finalPrice: originalPrice, discountAmount: 0, isValid: false }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { finalPrice: originalPrice, discountAmount: 0, isValid: false }
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = (originalPrice * coupon.discountValue) / 100
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue
  }

  const finalPrice = Math.max(0, Math.round((originalPrice - discount) * 100) / 100)
  return {
    finalPrice,
    discountAmount: Math.round(discount * 100) / 100,
    isValid: true,
  }
}
