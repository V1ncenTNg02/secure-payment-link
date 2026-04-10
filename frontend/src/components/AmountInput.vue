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
  border: 1px solid #91918c;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.amount-wrapper:focus-within {
  border-color: #435ee5;
  box-shadow: 0 0 0 3px rgba(67, 94, 229, 0.12);
}
.symbol {
  padding: 0 14px;
  font-weight: 600;
  color: #91918c;
  background: #f6f6f3;
  border-right: 1px solid #c8c8c1;
  display: flex;
  align-items: center;
  font-size: 15px;
}
input {
  flex: 1;
  padding: 11px 14px;
  border: none;
  outline: none;
  font-size: 15px;
  color: #211922;
  background: transparent;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>
