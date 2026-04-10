<script setup lang="ts">
import { LOCALES } from '../config/locales'
import type { Locale } from '../config/locales'

defineProps<{ modelValue: Locale }>()
const emit = defineEmits<{ 'update:modelValue': [value: Locale] }>()
</script>

<template>
  <select
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as Locale)"
  >
    <option v-for="(locale, key) in LOCALES" :key="key" :value="key">
      {{ locale.label }}
    </option>
  </select>
</template>

<style scoped>
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  outline: none;
  cursor: pointer;
}
select:focus {
  border-color: #3b82f6;
}
</style>
