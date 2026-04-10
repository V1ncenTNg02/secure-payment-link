import type { PaymentMethod, Currency } from '../config/locales'

const BASE = 'http://localhost:3000/api/v1/payment-links'

export interface CreatePaymentLinkPayload {
  payment_type: PaymentMethod
  amount: number
  currency: Currency
  pin: string
}

export interface CreatePaymentLinkResult {
  token: string
  url: string
}

export interface PaymentLinkDetails {
  token: string
  payment_type: PaymentMethod
  amount: number
  currency: Currency
  claimed_at: string | null
}

export async function createPaymentLink(
  payload: CreatePaymentLinkPayload
): Promise<CreatePaymentLinkResult> {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body.error || 'Failed to create payment link')
  }

  return body.data
}

export async function getPaymentLink(token: string): Promise<PaymentLinkDetails> {
  const response = await fetch(`${BASE}/${token}`)
  const body = await response.json()

  if (!response.ok) {
    throw new Error(body.error || 'Payment link not found')
  }

  return body.data
}

export async function claimPaymentLink(token: string, pin: string): Promise<void> {
  const response = await fetch(`${BASE}/${token}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  })

  const body = await response.json()

  if (!response.ok) {
    const err = new Error(body.error || 'Failed to claim payment link') as Error & { status: number }
    err.status = response.status
    throw err
  }
}
