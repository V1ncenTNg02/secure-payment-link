const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
const { pool } = require('./index')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function runMigrations() {
  const client = await pool.connect()
  try {
    // Create migration tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT        NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Fetch already-applied migrations
    const { rows } = await client.query('SELECT filename FROM _migrations ORDER BY filename')
    const applied = new Set(rows.map(r => r.filename))

    // Read migration files in sorted order
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping (already applied): ${file}`)
        continue
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log(`Applying: ${file}`)
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      console.log(`Applied: ${file}`)
    }

    console.log('All migrations up to date.')
  } finally {
    client.release()
  }
}

// Allow running directly: `node src/db/migrate.js`
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}

module.exports = { runMigrations }
