<script setup lang="ts">
import type { PaymentMethod } from '../config/locales'

defineProps<{
  modelValue: PaymentMethod
  creditCardLabel: string
  bankLabel: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: PaymentMethod] }>()
</script>

<template>
  <div class="payment-methods">
    <button
      :class="['method-btn', { active: modelValue === 'credit_card' }]"
      type="button"
      @click="emit('update:modelValue', 'credit_card')"
    >
      <span class="icon">💳</span>
      {{ creditCardLabel }}
    </button>
    <button
      :class="['method-btn', { active: modelValue === 'bank' }]"
      type="button"
      @click="emit('update:modelValue', 'bank')"
    >
      <span class="icon">🏦</span>
      {{ bankLabel }}
    </button>
  </div>
</template>

<style scoped>
.payment-methods {
  display: flex;
  gap: 12px;
}
.method-btn {
  flex: 1;
  padding: 14px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  color: #374151;
}
.method-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}
.method-btn:hover:not(.active) {
  border-color: #94a3b8;
}
.icon {
  font-size: 22px;
}
</style>
