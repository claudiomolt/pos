'use client'

import { usePOSStore } from '@/stores/pos'
import { useCurrency } from '@/hooks/useCurrency'

interface CartSheetProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
  selectedCurrency?: string
}

export default function CartSheet({ open, onClose, onCheckout, selectedCurrency = 'SAT' }: CartSheetProps) {
  const { cart, updateQuantity, clearCart, getTotal } = usePOSStore()
  const { convert } = useCurrency()

  if (!open) return null

  const totalSats = getTotal()

  function fmt(sats: number): string {
    if (selectedCurrency === 'SAT') return `${Math.round(sats).toLocaleString('es-AR')} SAT`
    const amount = convert(sats, 'SAT', selectedCurrency)
    return `$${Math.round(amount).toLocaleString('es-AR')}`
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#18181b] rounded-t-2xl max-h-[70vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm font-medium text-zinc-400">Resumen</span>
          <button
            onClick={() => { clearCart(); onClose() }}
            className="text-xs text-zinc-600 hover:text-red-400 transition"
          >
            Vaciar
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {cart.map(({ product, quantity }) => {
            const itemSats = convert(product.price * quantity, product.currency, 'SAT')
            return (
              <div key={product.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 text-xs" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {quantity}×
                  </span>
                  <span className="text-sm text-white truncate">{product.name}</span>
                </div>
                <span className="text-sm text-zinc-400 flex-shrink-0 ml-3" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {fmt(itemSats)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Total + CTA */}
        <div className="px-5 py-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Total</span>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              {fmt(totalSats)}
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full rounded-xl bg-[#f7931a] py-3.5 font-bold text-black text-base active:bg-[#e8851a] transition"
          >
            Cobrar ⚡
          </button>
        </div>
      </div>
    </>
  )
}
