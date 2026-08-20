import { NextRequest, NextResponse } from 'next/server'
import { processPaymentWebhook } from '@/lib/billing/webhook-handler'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-signature') || undefined
    const rawBody = await req.json()

    const result = await processPaymentWebhook(rawBody, signature)

    return NextResponse.json({
      received: true,
      action: result.action,
      duplicate: result.duplicate || false,
    })
  } catch (error: any) {
    logger.error('Error processing billing webhook', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 400 }
    )
  }
}
