const express = require('express')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { z } = require('zod')
const { pool } = require('../db/index')

const router = express.Router()

const createSchema = z.object({
  payment_type: z.enum(['credit_card', 'bank']),
  amount: z.number().positive(),
  currency: z.enum(['AUD', 'USD', 'GBP', 'EUR', 'CAD', 'SGD', 'JPY', 'IDR']),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
})

function hashPin(pin, token) {
  return crypto.createHash('sha256').update(pin + token).digest('hex')
}

router.post('/', async (req, res) => {
  const result = createSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    })
  }

  const { payment_type, amount, currency, pin } = result.data
  const token = uuidv4()
  const pin_hash = hashPin(pin, token)

  await pool.query(
    'INSERT INTO payment_links (token, pin_hash, payment_type, amount, currency) VALUES ($1, $2, $3, $4, $5)',
    [token, pin_hash, payment_type, amount, currency]
  )

  console.debug('[PaymentLink:create]', { token, paymentType: payment_type, amount, currency })

  return res.status(201).json({
    success: true,
    data: {
      token,
      url: `http://localhost:5173/pay/${token}`,
    },
  })
})

const claimSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
})

router.get('/:token', async (req, res) => {
  const { token } = req.params
  const { rows } = await pool.query(
    'SELECT token, payment_type, amount, currency, claimed_at FROM payment_links WHERE token = $1',
    [token]
  )

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Payment link not found' })
  }

  return res.status(200).json({ success: true, data: rows[0] })
})

router.post('/:token/claim', async (req, res) => {
  const result = claimSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    })
  }

  const { token } = req.params
  const { pin } = result.data

  const { rows } = await pool.query(
    'SELECT pin_hash, claimed_at FROM payment_links WHERE token = $1',
    [token]
  )

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Payment link not found' })
  }

  const link = rows[0]

  if (link.claimed_at !== null) {
    return res.status(409).json({ success: false, error: 'This link has already been claimed' })
  }

  const submittedHash = hashPin(pin, token)
  if (submittedHash !== link.pin_hash) {
    return res.status(403).json({ success: false, error: 'Incorrect PIN' })
  }

  await pool.query(
    'UPDATE payment_links SET claimed_at = NOW() WHERE token = $1',
    [token]
  )

  console.debug('[PaymentLink:claim]', { token })

  return res.status(200).json({ success: true, data: { message: 'Payment link claimed successfully' } })
})

module.exports = router
