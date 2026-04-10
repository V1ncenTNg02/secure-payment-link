/**
 * Task 3 — TDD: frontend API layer
 * Written BEFORE paymentLinks.ts exists (Red phase).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPaymentLink } from '../paymentLinks'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('createPaymentLink', () => {
  it('sends POST to /api/v1/payment-links with correct body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { token: 'abc-123', url: 'http://localhost:5173/pay/abc-123' } }),
    })

    await createPaymentLink({ payment_type: 'credit_card', amount: 150, currency: 'AUD', pin: '482916' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/payment-links',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_type: 'credit_card', amount: 150, currency: 'AUD', pin: '482916' }),
      })
    )
  })

  it('returns token and url on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { token: 'tok-xyz', url: 'http://localhost:5173/pay/tok-xyz' } }),
    })

    const result = await createPaymentLink({ payment_type: 'bank', amount: 50, currency: 'IDR', pin: '000001' })

    expect(result.token).toBe('tok-xyz')
    expect(result.url).toBe('http://localhost:5173/pay/tok-xyz')
  })

  it('throws when the server returns an error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'PIN must be exactly 6 digits' }),
    })

    await expect(
      createPaymentLink({ payment_type: 'credit_card', amount: 100, currency: 'AUD', pin: '12345' })
    ).rejects.toThrow('PIN must be exactly 6 digits')
  })
})
