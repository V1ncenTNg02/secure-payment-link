const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

// Rate limit the claim endpoint (10 req/min per IP)
const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please try again later.' },
})

// Routes (added in later tasks)
// app.use('/api/v1/payment-links', require('./routes/paymentLinks'))

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

module.exports = { app, claimLimiter }
