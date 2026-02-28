'use client'

import { useRef, useCallback } from 'react'

interface NumpadProps {
  currency: string
  onInput: (digit: string) => void
  onBackspace: () => void
  onReset: () => void
}

export default function Numpad({ currency, onInput, onBackspace, onReset }: NumpadProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const handleDeleteDown = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onReset()
    }, 500)
  }, [onReset])

  const handleDeleteUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!didLongPress.current) {
      onBackspace()
    }
  }, [onBackspace])

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back']

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-3 gap-1.5">
        {buttons.map((btn, i) => {
          if (btn === 'back') {
            return (
              <button
                key={i}
                onPointerDown={handleDeleteDown}
                onPointerUp={handleDeleteUp}
                onPointerLeave={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current)
                    longPressTimer.current = null
                  }
                }}
                className="h-[64px] rounded-xl bg-[#18181b] flex items-center justify-center active:bg-[#27272a] transition-colors select-none touch-manipulation"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/60">
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
              className="h-[64px] rounded-xl bg-[#18181b] text-white text-2xl font-medium active:bg-[#27272a] transition-colors select-none touch-manipulation"
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
