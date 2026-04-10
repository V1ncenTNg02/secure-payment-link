const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })

// Supabase transaction pooler (port 6543) — SSL required, rejectUnauthorized: false
// for Supabase's self-signed cert.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

module.exports = { pool }
