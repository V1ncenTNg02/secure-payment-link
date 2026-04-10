import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import PinInput from '../PinInput.vue'

describe('PinInput', () => {
  it('renders exactly 6 input boxes', () => {
    const wrapper = mount(PinInput, { props: { modelValue: '' } })
    expect(wrapper.findAll('input')).toHaveLength(6)
  })

  it('each box has maxlength="1" and inputmode="numeric"', () => {
    const wrapper = mount(PinInput, { props: { modelValue: '' } })
    wrapper.findAll('input').forEach(input => {
      expect(input.attributes('maxlength')).toBe('1')
      expect(input.attributes('inputmode')).toBe('numeric')
    })
  })

  it('each box displays the corresponding digit from modelValue', () => {
    const wrapper = mount(PinInput, { props: { modelValue: '482916' } })
    const inputs = wrapper.findAll('input')
    ;['4', '8', '2', '9', '1', '6'].forEach((digit, i) => {
      expect((inputs[i].element as HTMLInputElement).value).toBe(digit)
    })
  })

  it('boxes beyond the modelValue length are empty', () => {
    const wrapper = mount(PinInput, { props: { modelValue: '48' } })
    const inputs = wrapper.findAll('input')
    expect((inputs[2].element as HTMLInputElement).value).toBe('')
    expect((inputs[5].element as HTMLInputElement).value).toBe('')
  })

  it('emits update:modelValue when a digit is typed', async () => {
    const wrapper = mount(PinInput, { props: { modelValue: '' } })
    const firstBox = wrapper.findAll('input')[0]
    await firstBox.setValue('4')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['4'])
  })

  it('appends digit to existing value when typing in the next empty box', async () => {
    const wrapper = mount(PinInput, { props: { modelValue: '48' } })
    const thirdBox = wrapper.findAll('input')[2]
    await thirdBox.setValue('2')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['482'])
  })

  it('shows error after blur when PIN has fewer than 6 digits', async () => {
    const wrapper = mount(PinInput, { props: { modelValue: '123' } })
    await wrapper.findAll('input')[2].trigger('blur')
    expect(wrapper.text()).toContain('6')
  })

  it('does not show error when all 6 digits are filled', async () => {
    const wrapper = mount(PinInput, { props: { modelValue: '123456' } })
    await wrapper.findAll('input')[5].trigger('blur')
    expect(wrapper.find('.error').exists()).toBe(false)
  })
})
