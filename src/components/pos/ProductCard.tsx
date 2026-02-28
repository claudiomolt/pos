'use client'

import { memo } from 'react'
import type { Product } from '@/types/product'

interface ProductRowProps {
  product: Product
  quantity: number
  displayPrice: string
  onAdd: () => void
  onRemove: () => void
  unavailable?: boolean
}

function ProductRow({ product, quantity, displayPrice, onAdd, onRemove, unavailable }: ProductRowProps) {
  const hasQty = quantity > 0

  return (
    <button
      onClick={unavailable ? undefined : onAdd}
      disabled={unavailable}
      className={`w-full flex items-center justify-between py-3.5 transition-colors select-none ${
        unavailable ? 'opacity-30 cursor-not-allowed' : 'active:bg-[#18181b]'
      } ${hasQty ? 'border-l-2 border-[#f7931a] pl-3' : 'border-l-2 border-transparent pl-3'}`}
    >
      <span className={`text-sm truncate ${hasQty ? 'text-white' : 'text-zinc-300'}`}>
        {product.name}
      </span>

      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span
          className="text-sm text-zinc-500"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {displayPrice}
        </span>
        {hasQty && (
          <span className="w-5 h-5 rounded-full bg-[#f7931a] text-black text-[10px] font-bold flex items-center justify-center">
            {quantity}
          </span>
        )}
      </div>
    </button>
  )
}

export default memo(ProductRow)
