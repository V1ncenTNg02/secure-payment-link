/**
 * Task 5 — TDD: GET /api/v1/payment-links/:token and POST /api/v1/payment-links/:token/claim
 * Written BEFORE the routes exist (Red phase).
 */
const supertest = require('supertest')
const { app } = require('../app')
const { pool } = require('../db/index')
const { runMigrations } = require('../db/migrate')

const request = supertest(app)
const createdTokens = []
const DEFAULT_PIN = '482916'

async function createTestLink(pin = DEFAULT_PIN) {
  const res = await request.post('/api/v1/payment-links').send({
    payment_type: 'credit_card',
    amount: 100.0,
    currency: 'AUD',
    pin,
  })
  createdTokens.push(res.body.data.token)
  return res.body.data.token
}

describe('Claim tracking endpoints', () => {
  beforeAll(async () => {
    await runMigrations()
  })

  afterAll(async () => {
    if (createdTokens.length > 0) {
      await pool.query('DELETE FROM payment_links WHERE token = ANY($1)', [createdTokens])
    }
    await pool.end()
  })

  describe('GET /api/v1/payment-links/:token', () => {
    test('returns 200 with payment details for a valid token', async () => {
      const token = await createTestLink()
      const res = await request.get(`/api/v1/payment-links/${token}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBe(token)
      expect(res.body.data.payment_type).toBe('credit_card')
      expect(parseFloat(res.body.data.amount)).toBe(100.0)
      expect(res.body.data.currency).toBe('AUD')
      expect(res.body.data).toHaveProperty('claimed_at')
      expect(res.body.data.claimed_at).toBeNull()
      expect(res.body.data).not.toHaveProperty('pin_hash')
    })

    test('returns 404 for a non-existent token', async () => {
      const res = await request.get('/api/v1/payment-links/non-existent-token-xyz')
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/payment-links/:token/claim', () => {
    test('returns 200 and sets claimed_at with correct PIN', async () => {
      const token = await createTestLink()
      const res = await request
        .post(`/api/v1/payment-links/${token}/claim`)
        .send({ pin: DEFAULT_PIN })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const { rows } = await pool.query(
        'SELECT claimed_at FROM payment_links WHERE token = $1',
        [token]
      )
      expect(rows[0].claimed_at).not.toBeNull()
    })

    test('returns 403 for wrong PIN', async () => {
      const token = await createTestLink()
      const res = await request
        .post(`/api/v1/payment-links/${token}/claim`)
        .send({ pin: '000000' })
      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    test('returns 409 for an already-claimed link', async () => {
      const token = await createTestLink()
      await pool.query(
        'UPDATE payment_links SET claimed_at = NOW() WHERE token = $1',
        [token]
      )
      const res = await request
        .post(`/api/v1/payment-links/${token}/claim`)
        .send({ pin: DEFAULT_PIN })
      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })

    test('returns 400 for missing PIN', async () => {
      const token = await createTestLink()
      const res = await request
        .post(`/api/v1/payment-links/${token}/claim`)
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    test('returns 404 for a non-existent token', async () => {
      const res = await request
        .post('/api/v1/payment-links/non-existent-token-xyz/claim')
        .send({ pin: DEFAULT_PIN })
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })
})
