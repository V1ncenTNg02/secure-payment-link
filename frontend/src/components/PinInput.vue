<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const boxes = ref<(HTMLInputElement | null)[]>(Array(6).fill(null))
const touched = ref(false)
const isValid = (v: string) => /^\d{6}$/.test(v)

function focus(i: number) {
  boxes.value[i]?.focus()
}

async function onInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const digit = el.value.replace(/\D/g, '').slice(-1)
  el.value = digit // normalize display

  if (!digit) return

  const v = props.modelValue
  const next = v.slice(0, i) + digit + v.slice(i + 1)
  emit('update:modelValue', next.slice(0, 6))
  if (i < 5) {
    await nextTick()
    focus(i + 1)
  }
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key !== 'Backspace') return
  e.preventDefault()

  const v = props.modelValue
  if (v[i]) {
    emit('update:modelValue', v.slice(0, i) + v.slice(i + 1))
  } else if (i > 0) {
    emit('update:modelValue', v.slice(0, i - 1) + v.slice(i))
    focus(i - 1)
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  emit('update:modelValue', text)
  focus(Math.min(text.length, 5))
}

function onFocus(i: number) {
  // Jump to first empty box if clicking past the filled range
  const firstEmpty = props.modelValue.length
  if (i > firstEmpty) focus(firstEmpty)
}
</script>

<template>
  <div class="otp-root">
    <div class="otp-row">
      <input
        v-for="i in 6"
        :key="i - 1"
        :ref="(el) => (boxes[i - 1] = el as HTMLInputElement)"
        type="tel"
        inputmode="numeric"
        maxlength="1"
        :value="modelValue[i - 1] ?? ''"
        class="otp-box"
        autocomplete="off"
        @input="onInput(i - 1, $event)"
        @keydown="onKeydown(i - 1, $event)"
        @paste="onPaste"
        @focus="onFocus(i - 1)"
        @blur="touched = true"
      />
    </div>
    <span v-if="touched && !isValid(modelValue)" class="error">
      PIN must be exactly 6 digits
    </span>
  </div>
</template>

<style scoped>
.otp-root {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.otp-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.otp-box {
  width: 44px;
  height: 52px;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #211922;
  border: 2px solid #c8c8c1;
  border-radius: 12px;
  background: #fff;
  outline: none;
  caret-color: #435ee5;
  transition: border-color 0.15s, box-shadow 0.15s;
  /* hide the spinner on number inputs */
  -moz-appearance: textfield;
}
.otp-box::-webkit-outer-spin-button,
.otp-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.otp-box:focus {
  border-color: #435ee5;
  box-shadow: 0 0 0 3px rgba(67, 94, 229, 0.15);
}
.otp-box:not(:placeholder-shown) {
  border-color: #211922;
}
.error {
  font-size: 12px;
  color: #9e0a0a;
}
</style>
