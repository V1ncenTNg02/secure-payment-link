/**
 * Task 2 + Task 4 — TDD: Migration runner tests.
 * Verifies that running the migrations creates the expected schema.
 */
const { runMigrations } = require('../db/migrate')
const { pool } = require('../db/index')

describe('Migrations', () => {
  beforeAll(async () => {
    await runMigrations()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('001_initial', () => {
    test('creates payment_links table', async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'payment_links'
      `)
      expect(result.rows).toHaveLength(1)
    })

    test('payment_links has id, token, pin_hash, payment_type, amount, currency, created_at columns', async () => {
      const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payment_links'
        ORDER BY ordinal_position
      `)
      const columns = result.rows.map(r => r.column_name)
      expect(columns).toContain('id')
      expect(columns).toContain('token')
      expect(columns).toContain('pin_hash')
      expect(columns).toContain('payment_type')
      expect(columns).toContain('amount')
      expect(columns).toContain('currency')
      expect(columns).toContain('created_at')
    })

    test('token column has a UNIQUE constraint', async () => {
      const result = await pool.query(`
        SELECT constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'payment_links'
          AND kcu.column_name = 'token'
          AND tc.constraint_type = 'UNIQUE'
      `)
      expect(result.rows).toHaveLength(1)
    })

    test('creates _migrations tracking table', async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '_migrations'
      `)
      expect(result.rows).toHaveLength(1)
    })

    test('records 001_initial.sql in _migrations table', async () => {
      const result = await pool.query(
        "SELECT filename FROM _migrations WHERE filename = '001_initial.sql'"
      )
      expect(result.rows).toHaveLength(1)
    })
  })

  describe('002_claim_tracking', () => {
    test('payment_links has nullable claimed_at column', async () => {
      const result = await pool.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_links'
          AND column_name = 'claimed_at'
      `)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].is_nullable).toBe('YES')
    })

    test('claimed_at defaults to NULL for a new row', async () => {
      const token = 'task4-test-token-' + Date.now()
      const pinHash = 'a'.repeat(64)
      await pool.query(
        'INSERT INTO payment_links (token, pin_hash, payment_type, amount, currency) VALUES ($1, $2, $3, $4, $5)',
        [token, pinHash, 'credit_card', 99.99, 'AUD']
      )
      const { rows } = await pool.query(
        'SELECT claimed_at FROM payment_links WHERE token = $1',
        [token]
      )
      expect(rows[0].claimed_at).toBeNull()
      await pool.query('DELETE FROM payment_links WHERE token = $1', [token])
    })

    test('records 002_claim_tracking.sql in _migrations table', async () => {
      const result = await pool.query(
        "SELECT filename FROM _migrations WHERE filename = '002_claim_tracking.sql'"
      )
      expect(result.rows).toHaveLength(1)
    })
  })
})
