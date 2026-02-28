'use client'

interface NumpadProps {
  currency: string
  onInput: (digit: string) => void
  onBackspace: () => void
}

export default function Numpad({ currency, onInput, onBackspace }: NumpadProps) {
  const isSat = currency === 'SAT'
  // For fiat: show "00" instead of "." (cents-first)
  const bottomLeft = isSat ? '00' : '00'

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    bottomLeft, '0', 'back',
  ]

  return (
    <div className="px-4 pb-2">
      <div className="grid grid-cols-3 gap-1.5">
        {buttons.map((btn, i) => {
          if (btn === 'back') {
            return (
              <button
                key={i}
                onClick={onBackspace}
                className="h-[72px] rounded-xl bg-[#18181b] flex items-center justify-center active:bg-[#27272a] transition-colors select-none"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => onInput(btn)}
              className="h-[72px] rounded-xl bg-[#18181b] text-white text-2xl font-medium active:bg-[#27272a] transition-colors select-none"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              {btn}
            </button>
          )
        })}
      </div>
    </div>
  )
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
