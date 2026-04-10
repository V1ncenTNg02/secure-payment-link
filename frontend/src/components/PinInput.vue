<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const touched = ref(false)
const isValid = (val: string) => /^\d{6}$/.test(val)
</script>

<template>
  <div class="pin-wrapper">
    <input
      type="password"
      inputmode="numeric"
      maxlength="6"
      :value="modelValue"
      placeholder="••••••"
      autocomplete="off"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="touched = true"
    />
    <span v-if="touched && !isValid(modelValue)" class="error">
      PIN must be exactly 6 digits
    </span>
  </div>
</template>

<style scoped>
.pin-wrapper {
  display: flex;
  flex-direction: column;
}
input {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 22px;
  letter-spacing: 10px;
  text-align: center;
  outline: none;
  background: white;
}
input:focus {
  border-color: #3b82f6;
}
.error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}
</style>
