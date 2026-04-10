<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PinInput from '../components/PinInput.vue'
import { getPaymentLink, claimPaymentLink } from '../api/paymentLinks'
import type { PaymentLinkDetails } from '../api/paymentLinks'

const route = useRoute()
const token = route.params.token as string

const link = ref<PaymentLinkDetails | null>(null)
const pin = ref('')
const isLoading = ref(true)
const isClaiming = ref(false)
const claimed = ref(false)
const errorMessage = ref('')
const loadError = ref('')

onMounted(async () => {
  try {
    link.value = await getPaymentLink(token)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Payment link not found'
  } finally {
    isLoading.value = false
  }
})

async function onClaim() {
  errorMessage.value = ''
  isClaiming.value = true
  try {
    await claimPaymentLink(token, pin.value)
    const claimedAt = new Date().toISOString()
    claimed.value = true
    console.debug('[PaymentLink:claim]', { token, claimedAt })
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong'
  } finally {
    isClaiming.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h2 class="card-title">Claim Payment</h2>

      <div v-if="isLoading" class="state-msg">Loading…</div>

      <div v-else-if="loadError" class="error-msg">{{ loadError }}</div>

      <div v-else-if="claimed" class="success-msg">
        Payment link claimed successfully!
      </div>

      <template v-else-if="link">
        <div class="detail">
          <span class="detail-label">Amount</span>
          <span class="detail-value">{{ link.currency }} {{ link.amount }}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Payment Method</span>
          <span class="detail-value">{{
            link.payment_type === 'credit_card' ? 'Credit Card' : 'Bank Transfer'
          }}</span>
        </div>

        <div class="field">
          <label>Enter PIN <span class="hint">— given to you by the sender</span></label>
          <PinInput v-model="pin" />
        </div>

        <button class="btn-claim" type="button" :disabled="isClaiming" @click="onClaim">
          {{ isClaiming ? 'Claiming…' : 'Claim Payment' }}
        </button>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </template>

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
.state-msg {
  color: #64748b;
  text-align: center;
  padding: 16px 0;
}
.detail {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}
.detail-label {
  font-size: 13px;
  color: #64748b;
}
.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.field {
  margin: 20px 0;
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
.btn-claim {
  width: 100%;
  padding: 14px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-claim:hover {
  background: #059669;
}
.btn-claim:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.success-msg {
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
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
