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

const currentLocale = computed(() => LOCALES[locale.value])
const isPinValid = computed(() => /^\d{6}$/.test(pin.value))

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
      <h2 class="card-title">Create Payment Link</h2>

      <div class="field">
        <label>Region</label>
        <LocaleSelector v-model="locale" />
      </div>

      <div class="field">
        <label>Payment Method</label>
        <PaymentMethodSelector
          v-model="paymentMethod"
          :credit-card-label="currentLocale.creditCardLabel"
          :bank-label="currentLocale.bankLabel"
        />
      </div>

      <div class="field">
        <label>Amount ({{ currentLocale.currency }})</label>
        <AmountInput
          v-model="amount"
          :currency-symbol="currentLocale.currencySymbol"
          :has-decimals="currentLocale.hasDecimals"
        />
      </div>

      <div class="field">
        <label>
          Security PIN
          <span class="hint">— tell recipient by phone</span>
        </label>
        <PinInput v-model="pin" />
      </div>

      <button class="btn-generate" type="button" :disabled="isLoading" @click="onGenerateLink">
        {{ isLoading ? 'Generating…' : 'Generate Link' }}
      </button>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div v-if="generatedUrl" class="result">
        <p class="result-label">Share this link:</p>
        <a :href="generatedUrl" class="result-url">{{ generatedUrl }}</a>
      </div>

      <div class="secure-badge">
        <span>🛡</span> SECURE
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 24px;
}
.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 24px;
}
.field {
  margin-bottom: 20px;
}
label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
.hint {
  font-weight: 400;
  color: #9ca3af;
  font-size: 12px;
}
.btn-generate {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;
}
.btn-generate:hover {
  background: #2563eb;
}
.result {
  margin-top: 20px;
  padding: 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
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
.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}
.secure-badge {
  text-align: center;
  margin-top: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 3px;
}
</style>
