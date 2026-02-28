'use client'

import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { usePOSStore } from '@/stores/pos'

interface CartSheetProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
  currency: string
  formatPrice: (price: number, currency: string) => string
}

export default function CartSheet({ open, onClose, onCheckout, currency, formatPrice }: CartSheetProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = usePOSStore()

  if (!open) return null

  const total = getTotal()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1729] rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <h2 className="font-bold text-lg text-white">Carrito</h2>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={() => { clearCart(); onClose() }}
                className="text-red-400 hover:text-red-300 transition"
              >
                <Trash2 size={18} />
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
            <p className="text-center text-zinc-500 py-8">El carrito está vacío</p>
          ) : (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 rounded-xl bg-[#060a12] p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{product.name}</p>
                  <p className="text-xs text-[#f7931a]">{formatPrice(product.price, product.currency)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center"
                  >
                    <Minus size={12} className="text-white" />
                  </button>
                  <span className="w-5 text-center text-white font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[#f7931a] flex items-center justify-center"
                  >
                    <Plus size={12} className="text-black" />
                  </button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-zinc-300 font-medium">
                    {formatPrice(product.price * quantity, product.currency)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Total</span>
            <span className="font-bold text-white text-lg">{formatPrice(total, currency)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full rounded-xl bg-[#f7931a] px-4 py-3.5 font-bold text-black text-lg disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#e8851a] transition"
          >
            Cobrar {formatPrice(total, currency)}
          </button>
        </div>
      </div>
    </>
  )
}
