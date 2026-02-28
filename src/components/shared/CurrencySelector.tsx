'use client'

import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'

interface CurrencySelectorProps {
  selectedCurrency?: string
  onSelect: (currency: string) => void
  className?: string
}

export function CurrencySelector({
  selectedCurrency,
  onSelect,
  className = '',
}: CurrencySelectorProps) {
  const activeCurrencies = useSettingsStore((s) => s.activeCurrencies)
  const defaultCurrency = useCurrencyStore((s) => s.defaultCurrency)

  const current = selectedCurrency ?? defaultCurrency

  return (
    <div className={`flex items-center gap-2 overflow-x-auto scrollbar-none py-1 ${className}`}>
      {activeCurrencies.map((currency) => {
        const isSelected = currency === current
        return (
          <button
            key={currency}
            onClick={() => onSelect(currency)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${
                isSelected
                  ? 'bg-[#f7931a] text-black'
                  : 'bg-[#0f1729] text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
              }
            `}
          >
            {currency}
          </button>
        )
      })}
    </div>
  )
}
