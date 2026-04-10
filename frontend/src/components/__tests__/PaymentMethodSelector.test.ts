import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import PaymentMethodSelector from '../PaymentMethodSelector.vue'

describe('PaymentMethodSelector', () => {
  it('renders credit card button with locale label', () => {
    const wrapper = mount(PaymentMethodSelector, {
      props: { modelValue: 'credit_card', creditCardLabel: 'Credit Card', bankLabel: 'Bank Transfer' },
    })
    expect(wrapper.text()).toContain('Credit Card')
  })

  it('renders bank button with locale label', () => {
    const wrapper = mount(PaymentMethodSelector, {
      props: { modelValue: 'credit_card', creditCardLabel: 'Kartu Kredit', bankLabel: 'Bank' },
    })
    expect(wrapper.text()).toContain('Bank')
  })

  it('emits update:modelValue with credit_card when credit card button clicked', async () => {
    const wrapper = mount(PaymentMethodSelector, {
      props: { modelValue: 'bank', creditCardLabel: 'Credit Card', bankLabel: 'Bank' },
    })
    const buttons = wrapper.findAll('button')
    const creditBtn = buttons.find(b => b.text().includes('Credit Card'))
    await creditBtn!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['credit_card'])
  })

  it('emits update:modelValue with bank when bank button clicked', async () => {
    const wrapper = mount(PaymentMethodSelector, {
      props: { modelValue: 'credit_card', creditCardLabel: 'Credit Card', bankLabel: 'Bank' },
    })
    const buttons = wrapper.findAll('button')
    const bankBtn = buttons.find(b => b.text().includes('Bank'))
    await bankBtn!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['bank'])
  })

  it('marks the selected method as active', () => {
    const wrapper = mount(PaymentMethodSelector, {
      props: { modelValue: 'credit_card', creditCardLabel: 'Credit Card', bankLabel: 'Bank' },
    })
    const buttons = wrapper.findAll('button')
    const creditBtn = buttons.find(b => b.text().includes('Credit Card'))
    expect(creditBtn!.classes()).toContain('active')
  })
})
