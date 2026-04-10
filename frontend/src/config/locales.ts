export type Locale = 'AU' | 'US' | 'GB' | 'EU' | 'CA' | 'SG' | 'JP' | 'ID'
export type PaymentMethod = 'credit_card' | 'bank'
export type Currency = 'AUD' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'SGD' | 'JPY' | 'IDR'

export interface LocaleConfig {
  code: Locale
  label: string
  flag: string
  currency: Currency
  currencySymbol: string
  creditCardLabel: string
  bankLabel: string
  /** Label for the routing/sort-code/BSB field shown in bank transfer form */
  bankCodeLabel: string
  bankCodePlaceholder: string
  hasDecimals: boolean
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  AU: {
    code: 'AU',
    label: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: '$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank Transfer',
    bankCodeLabel: 'BSB',
    bankCodePlaceholder: '123-456',
    hasDecimals: true,
  },
  US: {
    code: 'US',
    label: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank',
    bankCodeLabel: 'Routing Number',
    bankCodePlaceholder: '000000000',
    hasDecimals: true,
  },
  GB: {
    code: 'GB',
    label: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank Transfer',
    bankCodeLabel: 'Sort Code',
    bankCodePlaceholder: 'XX-XX-XX',
    hasDecimals: true,
  },
  EU: {
    code: 'EU',
    label: 'Europe',
    flag: '🇪🇺',
    currency: 'EUR',
    currencySymbol: '€',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank Transfer',
    bankCodeLabel: 'IBAN',
    bankCodePlaceholder: 'DE89 3704 0044 0532 0130 00',
    hasDecimals: true,
  },
  CA: {
    code: 'CA',
    label: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Interac e-Transfer',
    bankCodeLabel: 'Transit Number',
    bankCodePlaceholder: '00000',
    hasDecimals: true,
  },
  SG: {
    code: 'SG',
    label: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    creditCardLabel: 'Credit Card',
    bankLabel: 'Bank Transfer',
    bankCodeLabel: 'Bank Code',
    bankCodePlaceholder: '7171',
    hasDecimals: true,
  },
  JP: {
    code: 'JP',
    label: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥',
    creditCardLabel: 'クレジットカード',
    bankLabel: '銀行振込',
    bankCodeLabel: 'Bank Code',
    bankCodePlaceholder: '0001',
    hasDecimals: false,
  },
  ID: {
    code: 'ID',
    label: 'Indonesia',
    flag: '🇮🇩',
    currency: 'IDR',
    currencySymbol: 'Rp',
    creditCardLabel: 'Kartu Kredit',
    bankLabel: 'Transfer Bank',
    bankCodeLabel: 'Kode Bank',
    bankCodePlaceholder: '014',
    hasDecimals: false,
  },
}

export const DEFAULT_LOCALE: Locale = 'AU'
