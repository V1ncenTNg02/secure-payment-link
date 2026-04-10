import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LocaleSelector from '../LocaleSelector.vue'
import { LOCALES } from '../../config/locales'

describe('LocaleSelector', () => {
  it('renders an option for every locale in LOCALES', () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'AU' } })
    const values = wrapper.findAll('option').map(o => o.element.value)
    Object.keys(LOCALES).forEach(code => expect(values).toContain(code))
  })

  it('includes AU, US, and ID options', () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'AU' } })
    const values = wrapper.findAll('option').map(o => o.element.value)
    expect(values).toContain('AU')
    expect(values).toContain('US')
    expect(values).toContain('ID')
  })

  it('includes the new GB, EU, CA, SG, JP regions', () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'AU' } })
    const values = wrapper.findAll('option').map(o => o.element.value)
    ;['GB', 'EU', 'CA', 'SG', 'JP'].forEach(code => expect(values).toContain(code))
  })

  it('displays locale labels in the options', () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'AU' } })
    const text = wrapper.text()
    expect(text).toContain('Australia')
    expect(text).toContain('United States')
    expect(text).toContain('United Kingdom')
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'AU' } })
    await wrapper.find('select').setValue('GB')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['GB'])
  })

  it('shows the currently selected locale', () => {
    const wrapper = mount(LocaleSelector, { props: { modelValue: 'JP' } })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('JP')
  })
})
