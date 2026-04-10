<script setup lang="ts">
defineProps<{
  modelValue: string
  currencySymbol: string
  hasDecimals: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="amount-wrapper">
    <span class="symbol">{{ currencySymbol }}</span>
    <input
      type="number"
      :value="modelValue"
      :placeholder="hasDecimals ? '0.00' : '0'"
      :step="hasDecimals ? '0.01' : '1'"
      min="0"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.amount-wrapper {
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}
.amount-wrapper:focus-within {
  border-color: #3b82f6;
}
.symbol {
  padding: 0 14px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  font-size: 15px;
}
input {
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>
