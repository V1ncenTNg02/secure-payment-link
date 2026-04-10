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
  gap: 10px;
}
.method-btn {
  flex: 1;
  padding: 12px 6px;
  border: 2px solid #c8c8c1;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  color: #62625b;
}
.method-btn:hover:not(.active) {
  border-color: #91918c;
  background: #f6f6f3;
}
.method-btn.active {
  border-color: #435ee5;
  background: #eef1fd;
  color: #211922;
}
.icon {
  font-size: 20px;
  line-height: 1;
}
</style>
