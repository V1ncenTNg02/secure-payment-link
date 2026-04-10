import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import PinInput from '../PinInput.vue'

describe('PinInput', () => {
  it('renders an input element', () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('has maxlength of 6', () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('input').attributes('maxlength')).toBe('6')
  })

  it('emits update:modelValue when user types', async () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '' },
    })
    await wrapper.find('input').setValue('123456')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['123456'])
  })

  it('shows error when PIN is less than 6 digits', async () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '123' },
    })
    await wrapper.find('input').trigger('blur')
    expect(wrapper.text()).toContain('6')
  })

  it('does not show error when PIN is exactly 6 digits', async () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '123456' },
    })
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('uses numeric inputmode for mobile keyboards', () => {
    const wrapper = mount(PinInput, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
  })
})
