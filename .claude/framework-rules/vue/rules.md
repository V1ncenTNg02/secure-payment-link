---
paths:
  - "frontend/src/**/*.vue"
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.js"
---

# Frontend Rules

## Component Structure
- Always use `<script setup lang="ts">` — no Options API
- One component per file; keep components under 150 lines
- Extract reusable logic into `src/composables/use*.ts`

## Locale & i18n
- Locale config lives in `src/config/locales.ts`
- Locale object shape: `{ currency, currencySymbol, creditCardLabel, bankLabel, amountMask }`
- Amount mask: AUD/USD use `$0,0.00`; IDR uses `Rp0,0` (no decimals)
- Always derive labels from selected locale — never hardcode "Credit Card" or "Bank"

## API Calls
- All API calls go through `src/api/paymentLinks.ts` — no raw fetch in components
- Handle loading and error states explicitly; show user-friendly messages
- Log API actions to console with `[PaymentLink]` prefix (required for task 6)

## Styling
- Use scoped styles in each component (`<style scoped>`)
- Follow the design mockup: card layout, blue "Generate Link" CTA, shield "SECURE" badge
