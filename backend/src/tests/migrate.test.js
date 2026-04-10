/**
 * Task 2 — TDD: Migration runner test.
 * Written BEFORE migrate.js and db/index.js exist (Red phase).
 * These tests verify that running the migration creates the expected schema.
 */
const { runMigrations } = require('../db/migrate')
const { pool } = require('../db/index')

describe('Migration: 001_initial', () => {
  beforeAll(async () => {
    await runMigrations()
  })

  afterAll(async () => {
    await pool.end()
  })

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
