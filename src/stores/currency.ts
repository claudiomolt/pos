import { create } from 'zustand'
import { DEFAULT_CURRENCY } from '@/config/constants'

interface CurrencyState {
  activeCurrencies: string[]
  defaultCurrency: string
  rates: Record<string, number> // per-sat rates: { ARS: X, USD: Y }
  lastUpdated: number | null
  isLoading: boolean
  setActiveCurrencies: (currencies: string[]) => void
  setDefaultCurrency: (currency: string) => void
  updateRates: (rates: Record<string, number>) => void
  convertCurrency: (amount: number, from: string, to: string) => number
  addCurrency: (currency: string) => void
  removeCurrency: (currency: string) => void
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  activeCurrencies: ['SAT', 'ARS', 'USD'],
  defaultCurrency: DEFAULT_CURRENCY,
  rates: {},
  lastUpdated: null,
  isLoading: false,

  setActiveCurrencies: (currencies) => set({ activeCurrencies: currencies }),
  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

  updateRates: (rates) =>
    set({ rates, lastUpdated: Date.now(), isLoading: false }),

  /**
   * Convert amount between currencies.
   * Rates are stored as per-sat: how many units of currency per 1 SAT.
   * e.g. rates.ARS = 0.5 means 1 SAT = 0.5 ARS
   * SAT is the base unit.
   */
  convertCurrency: (amount, from, to) => {
    if (from === to) return amount
    const { rates } = get()

    // Convert 'from' to SAT
    let sats: number
    if (from === 'SAT') {
      sats = amount
    } else {
      const fromRate = rates[from]
      if (!fromRate || fromRate === 0) return 0
      sats = amount / fromRate
    }

    // Convert SAT to 'to'
    if (to === 'SAT') return sats
    const toRate = rates[to]
    if (!toRate) return 0
    return sats * toRate
  },

  addCurrency: (currency) => {
    set((state) => {
      if (state.activeCurrencies.includes(currency)) return state
      return { activeCurrencies: [...state.activeCurrencies, currency] }
    })
  },

  removeCurrency: (currency) => {
    set((state) => ({
      activeCurrencies: state.activeCurrencies.filter((c) => c !== currency),
    }))
  },
}))
