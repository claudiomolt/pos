'use client'

import { Plus, Minus } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  quantity: number
  displayPrice: string
  onAdd: () => void
  onRemove: () => void
}

export default function ProductCard({ product, quantity, displayPrice, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0f1729] px-4 py-3 active:border-[#f7931a]/50 transition">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{product.name}</p>
        {product.description && (
          <p className="text-xs text-zinc-500 truncate">{product.description}</p>
        )}
        <p className="text-[#f7931a] font-semibold text-sm mt-0.5">{displayPrice}</p>
      </div>

      <div className="flex items-center gap-2 ml-3">
        {quantity > 0 ? (
          <>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center active:bg-zinc-700 transition"
            >
              <Minus size={14} className="text-white" />
            </button>
            <span className="w-6 text-center font-bold text-white">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-lg bg-[#f7931a] flex items-center justify-center active:bg-[#e8851a] transition"
            >
              <Plus size={14} className="text-black" />
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="w-10 h-10 rounded-xl bg-[#f7931a] flex items-center justify-center active:bg-[#e8851a] transition"
          >
            <Plus size={18} className="text-black" />
          </button>
        )}
      </div>
    </div>
  )
}
