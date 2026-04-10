const express = require('express')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { z } = require('zod')
const { pool } = require('../db/index')

const router = express.Router()

const createSchema = z.object({
  payment_type: z.enum(['credit_card', 'bank']),
  amount: z.number().positive(),
  currency: z.enum(['AUD', 'USD', 'IDR']),
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

module.exports = router
