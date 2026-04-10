/**
 * Task 3 — TDD: POST /api/v1/payment-links
 * Written BEFORE the route exists (Red phase).
 */
const supertest = require('supertest')
const { app } = require('../app')
const { pool } = require('../db/index')
const { runMigrations } = require('../db/migrate')

const request = supertest(app)
const createdTokens = []

describe('POST /api/v1/payment-links', () => {
  beforeAll(async () => {
    await runMigrations()
  })

  afterAll(async () => {
    if (createdTokens.length > 0) {
      await pool.query('DELETE FROM payment_links WHERE token = ANY($1)', [createdTokens])
    }
    await pool.end()
  })

  test('returns 201 with token and url for valid payload', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'credit_card',
      amount: 150.00,
      currency: 'AUD',
      pin: '482916',
    })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.url).toMatch(/\/pay\//)
    createdTokens.push(res.body.data.token)
  })

  test('url contains the token', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'bank',
      amount: 50,
      currency: 'IDR',
      pin: '000001',
    })
    expect(res.status).toBe(201)
    expect(res.body.data.url).toContain(res.body.data.token)
    createdTokens.push(res.body.data.token)
  })

  test('pin_hash is stored in DB but never returned in response', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'bank',
      amount: 200.00,
      currency: 'USD',
      pin: '123456',
    })
    expect(res.status).toBe(201)
    expect(res.body.data).not.toHaveProperty('pin_hash')

    const token = res.body.data.token
    createdTokens.push(token)

    const { rows } = await pool.query(
      'SELECT payment_type, amount, currency, pin_hash FROM payment_links WHERE token = $1',
      [token]
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].pin_hash).toBeDefined()
    expect(rows[0].payment_type).toBe('bank')
    expect(parseFloat(rows[0].amount)).toBe(200.00)
    expect(rows[0].currency).toBe('USD')
  })

  test('returns 400 for PIN shorter than 6 digits', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'credit_card',
      amount: 100,
      currency: 'AUD',
      pin: '12345',
    })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBeDefined()
  })

  test('returns 400 for non-numeric PIN', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'credit_card',
      amount: 100,
      currency: 'AUD',
      pin: 'abcdef',
    })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('returns 400 when required fields are missing', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'credit_card',
    })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('returns 400 for invalid payment_type', async () => {
    const res = await request.post('/api/v1/payment-links').send({
      payment_type: 'cash',
      amount: 100,
      currency: 'AUD',
      pin: '123456',
    })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
