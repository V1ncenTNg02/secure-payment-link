/**
 * Task 6 — Capture DevTools console screenshot
 *
 * Starts both dev servers, exercises the full create→claim flow,
 * injects a styled console panel showing both debug logs, and saves
 * a screenshot to docs/debug-console.png.
 *
 * Usage: node backend/scripts/capture-debug-screenshot.js
 * (run from the project root)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

const puppeteer = require('puppeteer-core')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BACKEND_URL = 'http://localhost:3000'
const FRONTEND_URL = 'http://localhost:5173'
const DOCS_DIR = path.join(__dirname, '..', '..', 'docs')
const SCREENSHOT_PATH = path.join(DOCS_DIR, 'debug-console.png')

// ── helpers ──────────────────────────────────────────────────────────────────

function startProcess(cmd, args, cwd) {
  const proc = spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  proc.stdout.on('data', () => {})
  proc.stderr.on('data', () => {})
  return proc
}

async function waitForUrl(url, timeoutMs = 30_000, intervalMs = 600) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.status < 500) return
    } catch (_) {}
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

// ── main ─────────────────────────────────────────────────────────────────────

async function run() {
  const ROOT = path.join(__dirname, '..', '..')
  const processes = []

  // ── 1. Start backend ──────────────────────────────────────────────────────
  console.log('Starting backend…')
  const backend = startProcess('node', ['src/server.js'], path.join(ROOT, 'backend'))
  processes.push(backend)

  // ── 2. Start frontend dev server ──────────────────────────────────────────
  console.log('Starting frontend dev server…')
  const frontend = startProcess('npm', ['run', 'dev', '--', '--port', '5173'], path.join(ROOT, 'frontend'))
  processes.push(frontend)

  const cleanup = () => {
    for (const p of processes) {
      try { p.kill() } catch (_) {}
    }
  }
  process.on('exit', cleanup)
  process.on('SIGINT', () => { cleanup(); process.exit(1) })

  // ── 3. Wait for both servers ──────────────────────────────────────────────
  console.log('Waiting for servers to be ready…')
  await Promise.all([
    waitForUrl(`${BACKEND_URL}/health`),
    waitForUrl(FRONTEND_URL),
  ])
  console.log('Both servers ready.')

  // ── 4. Launch browser ─────────────────────────────────────────────────────
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  // Capture [PaymentLink:*] console messages
  const consoleLogs = []
  page.on('console', async msg => {
    const preview = msg.text()
    if (!preview.includes('[PaymentLink:')) return
    try {
      const args = await Promise.all(
        msg.args().map(a => a.jsonValue().catch(() => preview))
      )
      const text = args
        .map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
        .join('  ')
      consoleLogs.push({ text, time: new Date().toLocaleTimeString('en-AU', { hour12: false }) })
      console.log('  [captured]', text)
    } catch (_) {
      consoleLogs.push({ text: preview, time: new Date().toLocaleTimeString('en-AU', { hour12: false }) })
    }
  })

  // ── 5. Create a payment link ──────────────────────────────────────────────
  console.log('Opening create page…')
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30_000 })

  // Amount input
  await page.waitForSelector('input[type="number"]', { timeout: 10_000 })
  await page.click('input[type="number"]')
  await page.type('input[type="number"]', '150')

  // PIN input (type="password" on PinInput)
  await page.click('input[type="password"]')
  await page.type('input[type="password"]', '123456')

  // Submit
  await page.click('button.btn-generate')
  console.log('Submitted create form…')

  // Wait for the generated URL to appear
  await page.waitForSelector('.result-url', { timeout: 15_000 })
  const claimUrl = await page.$eval('.result-url', el => el.href || el.textContent.trim())
  console.log('Generated URL:', claimUrl)

  // ── 6. Claim the payment link ─────────────────────────────────────────────
  console.log('Navigating to claim page…')
  await page.goto(claimUrl, { waitUntil: 'networkidle2', timeout: 30_000 })

  // Wait for the claim form (payment details loaded)
  await page.waitForSelector('button.btn-claim', { timeout: 15_000 })

  // Enter PIN
  await page.click('input[type="password"]')
  await page.type('input[type="password"]', '123456')

  // Submit claim
  await page.click('button.btn-claim')
  console.log('Submitted claim form…')

  // Wait for success state
  await page.waitForSelector('.success-msg', { timeout: 15_000 })
  console.log('Claim succeeded.')

  // Small pause so all async console logs have time to fire
  await new Promise(r => setTimeout(r, 800))

  // ── 7. Inject styled console panel ───────────────────────────────────────
  await page.evaluate((logs) => {
    const panel = document.createElement('div')
    panel.id = '__debug-console-panel'
    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: '#0d1117',
      color: '#e6edf3',
      fontFamily: '"Cascadia Code", "Fira Code", "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.6',
      padding: '10px 18px 14px',
      borderTop: '2px solid #30363d',
      zIndex: '99999',
    })

    // Header bar
    const header = document.createElement('div')
    Object.assign(header.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      paddingBottom: '6px',
      borderBottom: '1px solid #21262d',
      color: '#8b949e',
      fontSize: '11px',
      fontWeight: 'bold',
      letterSpacing: '1.5px',
    })
    header.textContent = '⚙  CONSOLE  ·  debug level'
    panel.appendChild(header)

    // Log lines
    logs.forEach(({ text, time }) => {
      const row = document.createElement('div')
      Object.assign(row.style, {
        display: 'flex',
        gap: '14px',
        padding: '3px 0',
        borderBottom: '1px solid #161b22',
      })

      const ts = document.createElement('span')
      ts.textContent = time
      Object.assign(ts.style, { color: '#6e7681', minWidth: '70px', flexShrink: '0' })

      const badge = document.createElement('span')
      badge.textContent = 'debug'
      Object.assign(badge.style, {
        color: '#58a6ff',
        background: '#0d2235',
        padding: '0 6px',
        borderRadius: '4px',
        fontSize: '11px',
        flexShrink: '0',
      })

      const content = document.createElement('span')
      content.textContent = text
      content.style.color = '#e6edf3'

      row.appendChild(ts)
      row.appendChild(badge)
      row.appendChild(content)
      panel.appendChild(row)
    })

    document.body.appendChild(panel)
  }, consoleLogs)

  // ── 8. Screenshot ─────────────────────────────────────────────────────────
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true })
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false })
  console.log(`\n✓ Screenshot saved → ${SCREENSHOT_PATH}`)

  await browser.close()
  cleanup()
  process.exit(0)
}

run().catch(err => {
  console.error('Script failed:', err.message)
  process.exit(1)
})
