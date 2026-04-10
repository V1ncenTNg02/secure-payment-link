/**
 * Task 3 — TDD: frontend API layer
 * Written BEFORE paymentLinks.ts exists (Red phase).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPaymentLink, getPaymentLink, claimPaymentLink } from '../paymentLinks'

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

describe('getPaymentLink', () => {
  it('sends GET to /api/v1/payment-links/:token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { token: 'tok-xyz', payment_type: 'credit_card', amount: 100, currency: 'AUD', claimed_at: null },
      }),
    })
    await getPaymentLink('tok-xyz')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/payment-links/tok-xyz')
  })

  it('returns payment link details on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { token: 'tok-xyz', payment_type: 'bank', amount: 50, currency: 'USD', claimed_at: null },
      }),
    })
    const result = await getPaymentLink('tok-xyz')
    expect(result.token).toBe('tok-xyz')
    expect(result.payment_type).toBe('bank')
    expect(result.amount).toBe(50)
    expect(result.currency).toBe('USD')
    expect(result.claimed_at).toBeNull()
  })

  it('throws on 404 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: 'Not found' }),
    })
    await expect(getPaymentLink('bad-token')).rejects.toThrow('Not found')
  })
})

describe('claimPaymentLink', () => {
  it('sends POST to /api/v1/payment-links/:token/claim with PIN', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    })
    await claimPaymentLink('tok-xyz', '482916')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/payment-links/tok-xyz/claim',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '482916' }),
      })
    )
  })

  it('resolves on success (200)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    })
    await expect(claimPaymentLink('tok-xyz', '482916')).resolves.toBeUndefined()
  })

  it('throws with status 403 for wrong PIN', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ success: false, error: 'Incorrect PIN' }),
    })
    const error = await claimPaymentLink('tok-xyz', '000000').catch((e) => e)
    expect(error.message).toBe('Incorrect PIN')
    expect(error.status).toBe(403)
  })

  it('throws with status 409 for already-claimed link', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ success: false, error: 'This link has already been claimed' }),
    })
    const error = await claimPaymentLink('tok-xyz', '482916').catch((e) => e)
    expect(error.message).toBe('This link has already been claimed')
    expect(error.status).toBe(409)
  })
})
