'use client'

import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { usePOSStore } from '@/stores/pos'
import { useCurrencyStore } from '@/stores/currency'

function formatSats(sats: number): string {
  return `${Math.round(sats).toLocaleString('es-AR')} SAT`
}

function formatFiat(amount: number, currency: string): string {
  if (currency === 'SAT') return formatSats(amount)
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CartSheetProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = usePOSStore()
  const { convertCurrency, defaultCurrency } = useCurrencyStore()

  if (!open) return null

  const totalSats = getTotal()
  const displayCurrency = defaultCurrency === 'SAT' ? 'ARS' : defaultCurrency
  const totalDisplay = convertCurrency(totalSats, 'SAT', displayCurrency)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1729] rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <h2 className="font-bold text-lg text-white">Carrito</h2>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={() => { clearCart(); onClose() }}
                className="text-red-400 hover:text-red-300 transition flex items-center gap-1 text-sm"
              >
                <Trash2 size={16} />
                <span>Vaciar</span>
              </button>
            )}
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-zinc-500 py-10">El carrito está vacío</p>
          ) : (
            cart.map(({ product, quantity }) => {
              const itemTotal = product.price * quantity
              const itemDisplayTotal = convertCurrency(itemTotal, product.currency, 'SAT')

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl bg-[#060a12] p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{product.name}</p>
                    <p className="text-xs text-[#f7931a] mt-0.5">
                      {formatSats(convertCurrency(product.price, product.currency, 'SAT'))} × {quantity}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center active:bg-zinc-700 transition"
                    >
                      <Minus size={12} className="text-white" />
                    </button>
                    <span className="w-5 text-center text-white font-bold text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-[#f7931a] flex items-center justify-center active:bg-[#e8851a] transition"
                    >
                      <Plus size={12} className="text-black" />
                    </button>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="text-right min-w-[64px]">
                    <p className="text-xs text-zinc-200 font-medium">
                      {formatSats(itemDisplayTotal)}
                    </p>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-zinc-600 hover:text-red-400 transition mt-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 py-4 border-t border-zinc-800 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Total</span>
              <div className="text-right">
                <p className="font-bold text-white text-xl">{formatSats(totalSats)}</p>
                {displayCurrency !== 'SAT' && totalDisplay > 0 && (
                  <p className="text-xs text-zinc-400">
                    ≈ {formatFiat(totalDisplay, displayCurrency)}
                  </p>
                )}
              </div>
            </div>

            {/* Cobrar */}
            <button
              onClick={onCheckout}
              className="w-full rounded-xl bg-[#f7931a] px-4 py-3.5 font-bold text-black text-lg active:bg-[#e8851a] transition"
            >
              Cobrar {formatSats(totalSats)}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
