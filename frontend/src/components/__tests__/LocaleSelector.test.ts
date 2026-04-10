import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LocaleSelector from '../LocaleSelector.vue'

describe('LocaleSelector', () => {
  it('renders all three locale options', () => {
    const wrapper = mount(LocaleSelector, {
      props: { modelValue: 'AU' },
    })
    const options = wrapper.findAll('option')
    const values = options.map(o => o.element.value)
    expect(values).toContain('AU')
    expect(values).toContain('US')
    expect(values).toContain('ID')
  })

  it('displays the correct locale labels', () => {
    const wrapper = mount(LocaleSelector, {
      props: { modelValue: 'AU' },
    })
    const text = wrapper.text()
    expect(text).toContain('Australia')
    expect(text).toContain('United States')
    expect(text).toContain('Indonesian')
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(LocaleSelector, {
      props: { modelValue: 'AU' },
    })
    await wrapper.find('select').setValue('US')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['US'])
  })

  it('shows the currently selected locale', () => {
    const wrapper = mount(LocaleSelector, {
      props: { modelValue: 'ID' },
    })
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('ID')
  })
})
