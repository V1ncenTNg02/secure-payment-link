export interface CreatePaymentLinkPayload {
  payment_type: 'credit_card' | 'bank'
  amount: number
  currency: 'AUD' | 'USD' | 'IDR'
  pin: string
}

export interface CreatePaymentLinkResult {
  token: string
  url: string
}

export async function createPaymentLink(
  payload: CreatePaymentLinkPayload
): Promise<CreatePaymentLinkResult> {
  const response = await fetch('http://localhost:3000/api/v1/payment-links', {
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
