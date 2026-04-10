/**
 * Task 5 — TDD: ClaimPaymentLink view
 * Written BEFORE the component exists (Red phase).
 */
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { token: 'test-token-123' } }),
}))

const mockGetPaymentLink = vi.fn()
const mockClaimPaymentLink = vi.fn()

vi.mock('../../api/paymentLinks', () => ({
  createPaymentLink: vi.fn(),
  getPaymentLink: (...args: unknown[]) => mockGetPaymentLink(...args),
  claimPaymentLink: (...args: unknown[]) => mockClaimPaymentLink(...args),
}))

// Import component AFTER mocks are set up
import ClaimPaymentLink from '../ClaimPaymentLink.vue'

const MOCK_LINK = {
  token: 'test-token-123',
  payment_type: 'credit_card',
  amount: 100.0,
  currency: 'AUD',
  claimed_at: null,
}

beforeEach(() => {
  mockGetPaymentLink.mockReset()
  mockClaimPaymentLink.mockReset()
})

describe('ClaimPaymentLink', () => {
  it('shows loading state before data arrives', async () => {
    mockGetPaymentLink.mockReturnValue(new Promise(() => {})) // never resolves
    const wrapper = mount(ClaimPaymentLink)
    expect(wrapper.text()).toContain('Loading')
  })

  it('shows payment details after data loads', async () => {
    mockGetPaymentLink.mockResolvedValue(MOCK_LINK)
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('AUD')
  })

  it('does not display pin_hash anywhere', async () => {
    mockGetPaymentLink.mockResolvedValue({ ...MOCK_LINK, pin_hash: 'should-never-show' })
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()
    expect(wrapper.html()).not.toContain('should-never-show')
  })

  it('calls getPaymentLink with the token from the route', async () => {
    mockGetPaymentLink.mockResolvedValue(MOCK_LINK)
    mount(ClaimPaymentLink)
    expect(mockGetPaymentLink).toHaveBeenCalledWith('test-token-123')
  })

  it('shows success message after successful claim', async () => {
    mockGetPaymentLink.mockResolvedValue(MOCK_LINK)
    mockClaimPaymentLink.mockResolvedValue(undefined)
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()

    await wrapper.find('input[type="text"], input[inputmode="numeric"]').setValue('482916')
    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('claimed')
  })

  it('shows incorrect PIN error on 403', async () => {
    mockGetPaymentLink.mockResolvedValue(MOCK_LINK)
    const err = Object.assign(new Error('Incorrect PIN'), { status: 403 })
    mockClaimPaymentLink.mockRejectedValue(err)
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()

    await wrapper.find('input[type="text"], input[inputmode="numeric"]').setValue('000000')
    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Incorrect PIN')
  })

  it('shows already-claimed message on 409', async () => {
    mockGetPaymentLink.mockResolvedValue(MOCK_LINK)
    const err = Object.assign(new Error('This link has already been claimed'), { status: 409 })
    mockClaimPaymentLink.mockRejectedValue(err)
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()

    await wrapper.find('input[type="text"], input[inputmode="numeric"]').setValue('482916')
    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('already been claimed')
  })

  it('shows not-found error when link does not exist', async () => {
    const err = Object.assign(new Error('Payment link not found'), { status: 404 })
    mockGetPaymentLink.mockRejectedValue(err)
    const wrapper = mount(ClaimPaymentLink)
    await flushPromises()
    expect(wrapper.text()).toContain('not found')
  })
})
