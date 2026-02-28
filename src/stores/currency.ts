// TODO: Currency store — selected currency, exchange rates, update interval
import { create } from 'zustand'

interface CurrencyState {
  currency: string
  rates: Record<string, number>
}

export const useCurrencyStore = create<CurrencyState>(() => ({
  currency: 'SAT',
  rates: {},
}))
