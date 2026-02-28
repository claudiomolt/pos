import { useEffect, useCallback, useRef } from 'react'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { RATE_UPDATE_INTERVAL } from '@/config/constants'

interface RatesResponse {
  rates: Record<string, number>
  timestamp: number
  stale?: boolean
}

export function useCurrency() {
  const {
    rates,
    lastUpdated,
    isLoading,
    updateRates,
    convertCurrency,
    activeCurrencies,
  } = useCurrencyStore()

  const settingsActiveCurrencies = useSettingsStore((s) => s.activeCurrencies)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshRates = useCallback(async () => {
    const store = useCurrencyStore.getState()
    if (store.isLoading) return

    useCurrencyStore.setState({ isLoading: true })

    try {
      const currencies = settingsActiveCurrencies
        .filter((c) => c !== 'SAT')
        .join(',')

      const url = currencies
        ? `/api/rates?currencies=${currencies}`
        : '/api/rates'

      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: RatesResponse = await res.json()
      updateRates(data.rates)
    } catch (err) {
      // Fallback: keep existing rates, just mark not loading
      console.warn('[useCurrency] Rate fetch failed, using cached rates:', err)
      useCurrencyStore.setState({ isLoading: false })
    }
  }, [settingsActiveCurrencies, updateRates])

  useEffect(() => {
    refreshRates()

    intervalRef.current = setInterval(refreshRates, RATE_UPDATE_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refreshRates])

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      return convertCurrency(amount, from, to)
    },
    [convertCurrency]
  )

  return {
    rates,
    isLoading,
    convert,
    refreshRates,
    lastUpdated,
    activeCurrencies,
  }
}
