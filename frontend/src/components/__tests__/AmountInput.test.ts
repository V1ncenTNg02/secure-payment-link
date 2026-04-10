import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AmountInput from '../AmountInput.vue'

describe('AmountInput', () => {
  it('displays the currency symbol', () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: '', currencySymbol: '$', hasDecimals: true },
    })
    expect(wrapper.text()).toContain('$')
  })

  it('displays IDR currency symbol', () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: '', currencySymbol: 'Rp', hasDecimals: false },
    })
    expect(wrapper.text()).toContain('Rp')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: '', currencySymbol: '$', hasDecimals: true },
    })
    await wrapper.find('input').setValue('100')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('sets input placeholder to 0.00 when hasDecimals is true', () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: '', currencySymbol: '$', hasDecimals: true },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('0.00')
  })

  it('sets input placeholder to 0 when hasDecimals is false (IDR)', () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: '', currencySymbol: 'Rp', hasDecimals: false },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('0')
  })
})
