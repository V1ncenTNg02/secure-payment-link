<script setup lang="ts">
import { ref, computed } from 'vue'
import LocaleSelector from '../components/LocaleSelector.vue'
import PaymentMethodSelector from '../components/PaymentMethodSelector.vue'
import AmountInput from '../components/AmountInput.vue'
import PinInput from '../components/PinInput.vue'
import { LOCALES, DEFAULT_LOCALE } from '../config/locales'
import type { Locale, PaymentMethod } from '../config/locales'
import { createPaymentLink } from '../api/paymentLinks'

const locale = ref<Locale>(DEFAULT_LOCALE)
const paymentMethod = ref<PaymentMethod>('credit_card')
const amount = ref('')
const pin = ref('')
const generatedUrl = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const copied = ref(false)
const emailInput = ref('')
const emailSent = ref(false)

function onCopy() {
  navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function onSendEmail() {
  emailSent.value = true
}

// Credit card fields
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

// Bank transfer fields
const bankCode = ref('')
const accountNumber = ref('')

const currentLocale = computed(() => LOCALES[locale.value])
const isPinValid = computed(() => /^\d{6}$/.test(pin.value))

function formatCardNumber(e: Event) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 16)
  cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim()
  el.value = cardNumber.value
}

function formatExpiry(e: Event) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 4)
  cardExpiry.value = digits.length > 2 ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits
  el.value = cardExpiry.value
}

async function onGenerateLink() {
  errorMessage.value = ''

  if (!isPinValid.value) {
    errorMessage.value = 'PIN must be exactly 6 digits'
    return
  }
  if (!amount.value || parseFloat(amount.value) <= 0) {
    errorMessage.value = 'Please enter a valid amount'
    return
  }

  isLoading.value = true
  try {
    const result = await createPaymentLink({
      payment_type: paymentMethod.value,
      amount: parseFloat(amount.value),
      currency: currentLocale.value.currency,
      pin: pin.value,
    })
    generatedUrl.value = result.url
    console.debug('[PaymentLink:create]', {
      token: result.token,
      paymentType: paymentMethod.value,
      amount: parseFloat(amount.value),
      currency: currentLocale.value.currency,
    })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Create Payment Link</h2>
        <p class="card-sub">Fill in the details below and share the link with your recipient.</p>
      </div>

      <!-- Region -->
      <div class="field">
        <label>Region</label>
        <LocaleSelector v-model="locale" />
      </div>

      <!-- Payment Method -->
      <div class="field">
        <label>Payment Method</label>
        <PaymentMethodSelector
          v-model="paymentMethod"
          :credit-card-label="currentLocale.creditCardLabel"
          :bank-label="currentLocale.bankLabel"
        />
      </div>

      <!-- Amount -->
      <div class="field">
        <label>Amount <span class="currency-tag">{{ currentLocale.currency }}</span></label>
        <AmountInput
          v-model="amount"
          :currency-symbol="currentLocale.currencySymbol"
          :has-decimals="currentLocale.hasDecimals"
        />
      </div>

      <!-- ── Credit Card fields ──────────────────────────── -->
      <template v-if="paymentMethod === 'credit_card'">
        <div class="field">
          <label>Card Number</label>
          <input
            class="text-input"
            type="text"
            inputmode="numeric"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            autocomplete="off"
            :value="cardNumber"
            @input="formatCardNumber"
          />
        </div>
        <div class="row-2">
          <div class="field">
            <label>Expiry Date</label>
            <input
              class="text-input"
              type="text"
              inputmode="numeric"
              placeholder="MM / YY"
              maxlength="7"
              autocomplete="off"
              :value="cardExpiry"
              @input="formatExpiry"
            />
          </div>
          <div class="field">
            <label>CVC</label>
            <input
              v-model="cardCvc"
              class="text-input"
              type="password"
              inputmode="numeric"
              placeholder="•••"
              maxlength="4"
              autocomplete="off"
            />
          </div>
        </div>
      </template>

      <!-- ── Bank Transfer fields ───────────────────────── -->
      <template v-else-if="paymentMethod === 'bank'">
        <div class="field">
          <label>{{ currentLocale.bankCodeLabel }}</label>
          <input
            v-model="bankCode"
            class="text-input"
            type="text"
            inputmode="numeric"
            :placeholder="currentLocale.bankCodePlaceholder"
          />
        </div>
        <div class="field">
          <label>Account Number</label>
          <input
            v-model="accountNumber"
            class="text-input"
            type="text"
            inputmode="numeric"
            placeholder="Enter account number"
          />
        </div>
      </template>

      <!-- ── Security PIN ───────────────────────────────── -->
      <div class="field">
        <label>
          Security PIN
          <span class="hint">— share with recipient over the phone</span>
        </label>
        <PinInput v-model="pin" />
      </div>

      <!-- ── Generate ───────────────────────────────────── -->
      <button
        class="btn-generate"
        type="button"
        :disabled="isLoading"
        @click="onGenerateLink"
      >
        {{ isLoading ? 'Generating…' : 'Generate Link' }}
      </button>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div v-if="generatedUrl" class="result">
        <p class="result-label">Share this link with your recipient:</p>
        <a :href="generatedUrl" class="result-url" target="_blank">{{ generatedUrl }}</a>

        <div class="result-actions">
          <button class="btn-copy" type="button" @click="onCopy">
            {{ copied ? '✓ Copied!' : 'Copy link' }}
          </button>

          <div class="email-row">
            <input
              v-model="emailInput"
              class="email-input"
              type="email"
              placeholder="Recipient email"
              autocomplete="off"
            />
            <button class="btn-send" type="button" :disabled="emailSent" @click="onSendEmail">
              Send
            </button>
          </div>

          <p v-if="emailSent" class="sent-msg">Link sent successfully!</p>
        </div>
      </div>

      <div class="secure-badge">🛡 SECURE</div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page & card ──────────────────────────────────────── */
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f6f3;
  padding: 24px;
}
.card {
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 2px 12px rgba(33, 25, 34, 0.08);
}

/* ── Header ───────────────────────────────────────────── */
.card-header {
  margin-bottom: 28px;
}
.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #211922;
  margin: 0 0 6px;
}
.card-sub {
  font-size: 13px;
  color: #62625b;
  margin: 0;
}

/* ── Fields ───────────────────────────────────────────── */
.field {
  margin-bottom: 18px;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #211922;
  margin-bottom: 7px;
}
.currency-tag {
  font-weight: 400;
  color: #91918c;
  font-size: 12px;
  margin-left: 4px;
}
.hint {
  font-weight: 400;
  color: #91918c;
  font-size: 12px;
}

/* ── Text inputs ──────────────────────────────────────── */
.text-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #91918c;
  border-radius: 16px;
  font-size: 15px;
  color: #211922;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.text-input::placeholder {
  color: #bcbcb3;
}
.text-input:focus {
  border-color: #435ee5;
  box-shadow: 0 0 0 3px rgba(67, 94, 229, 0.12);
}

/* ── Generate button ──────────────────────────────────── */
.btn-generate {
  width: 100%;
  padding: 14px;
  background: #2b48d4;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0);
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;
}
.btn-generate:hover:not(:disabled) {
  background: #1e36b8;
}
.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Result ───────────────────────────────────────────── */
.result {
  margin-top: 20px;
  padding: 14px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  word-break: break-all;
}
.result-label {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  margin: 0 0 6px;
}
.result-url {
  font-size: 13px;
  color: #15803d;
}
.result-actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-copy {
  width: 100%;
  padding: 10px;
  background: #fff;
  color: #2b48d4;
  border: 1.5px solid #2b48d4;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-copy:hover {
  background: #eef1fd;
}
.email-row {
  display: flex;
  gap: 8px;
}
.email-input {
  flex: 1;
  padding: 10px 13px;
  border: 1px solid #91918c;
  border-radius: 12px;
  font-size: 14px;
  color: #211922;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
}
.email-input::placeholder {
  color: #bcbcb3;
}
.email-input:focus {
  border-color: #435ee5;
  box-shadow: 0 0 0 3px rgba(67, 94, 229, 0.12);
}
.btn-send {
  padding: 10px 18px;
  background: #2b48d4;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-send:hover:not(:disabled) {
  background: #1e36b8;
}
.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.sent-msg {
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
  margin: 0;
  text-align: center;
}

/* ── Error ────────────────────────────────────────────── */
.error-msg {
  color: #9e0a0a;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}

/* ── Secure badge ─────────────────────────────────────── */
.secure-badge {
  text-align: center;
  margin-top: 24px;
  font-size: 11px;
  font-weight: 700;
  color: #91918c;
  letter-spacing: 3px;
}
</style>
