const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

module.exports = { pool }
