export type Locale = 'AU' | 'US' | 'ID'
export type PaymentMethod = 'credit_card' | 'bank'

export interface LocaleConfig {
  code: Locale
  label: string
  currency: 'AUD' | 'USD' | 'IDR'
  currencySymbol: string
  creditCardLabel: string
  bankLabel: string
  hasDecimals: boolean
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  AU: {
    code: 'AU',
    label: 'Australia',
    currency: 'AUD',
    currencySymbol: '$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank Transfer',
    hasDecimals: true,
  },
  US: {
    code: 'US',
    label: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank',
    hasDecimals: true,
  },
  ID: {
    code: 'ID',
    label: 'Indonesian',
    currency: 'IDR',
    currencySymbol: 'Rp',
    creditCardLabel: 'Kartu Kredit',
    bankLabel: 'Bank',
    hasDecimals: false,
  },
}

export const DEFAULT_LOCALE: Locale = 'AU'
