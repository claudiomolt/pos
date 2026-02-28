'use client'

import { ShoppingCart, Delete } from 'lucide-react'

interface NumpadProps {
  cents: number // amount in cents (e.g., 500000 = $5000.00)
  currency: string
  onInput: (digit: string) => void
  onBackspace: () => void
  onCartPress?: () => void
  showCartButton?: boolean
}

export function formatCentsDisplay(cents: number, currency: string): string {
  if (currency === 'SAT') {
    return `${cents.toLocaleString()} SAT`
  }
  const amount = cents / 100
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : currency === 'USD' ? 'USD' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function Numpad({
  cents,
  currency,
  onInput,
  onBackspace,
  onCartPress,
  showCartButton = true,
}: NumpadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="w-full px-4 pb-4">
      {/* Amount display */}
      <div className="text-center py-8">
        <div className="text-5xl font-bold tracking-tight text-white">
          {currency === 'SAT'
            ? `${cents.toLocaleString()}`
            : `$${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
        </div>
        <div className="text-sm text-zinc-500 mt-1">{currency}</div>
      </div>

      {/* Grid 3x4 */}
      <div className="grid grid-cols-3 gap-2">
        {digits.map((d) => (
          <button
            key={d}
            onClick={() => onInput(d)}
            className="h-20 rounded-xl bg-[#0f1729] text-white text-2xl font-medium active:bg-[#1a2540] transition select-none"
          >
            {d}
          </button>
        ))}

        {/* Row 4: cart / 0 / backspace */}
        <button
          onClick={showCartButton ? onCartPress : undefined}
          className={`h-20 rounded-xl text-xl flex items-center justify-center transition select-none ${
            showCartButton
              ? 'bg-[#0f1729] text-zinc-400 active:bg-[#1a2540]'
              : 'bg-transparent cursor-default'
          }`}
        >
          {showCartButton && <ShoppingCart size={24} />}
        </button>

        <button
          onClick={() => onInput('0')}
          className="h-20 rounded-xl bg-[#0f1729] text-white text-2xl font-medium active:bg-[#1a2540] transition select-none"
        >
          0
        </button>

        <button
          onClick={onBackspace}
          className="h-20 rounded-xl bg-[#0f1729] text-zinc-400 flex items-center justify-center active:bg-[#1a2540] transition select-none"
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  )
}
