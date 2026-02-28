'use client'

import { useState } from 'react'
import type { Product } from '@/types/product'
import CategoryFilter from './CategoryFilter'
import ProductRow from './ProductCard'

interface MenuViewProps {
  products: Product[]
  categories: string[]
  selectedCurrency: string
  convert: (amount: number, from: string, to: string) => number
  getItemQty: (productId: string) => number
  onAdd: (product: Product) => void
  onRemove: (productId: string) => void
  isLoading: boolean
}

function formatPrice(amount: number, currency: string): string {
  if (currency === 'SAT') return `${Math.round(amount).toLocaleString('es-AR')}`
  return `$${Math.round(amount).toLocaleString('es-AR')}`
}

export default function MenuView({
  products,
  categories,
  selectedCurrency,
  convert,
  getItemQty,
  onAdd,
  onRemove,
  isLoading,
}: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredProducts = selectedCategory
    ? products.filter(() => true) // categories not stored on product yet
    : products

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="flex-1 overflow-y-auto px-4 py-1">
        {filteredProducts.map((product) => {
          const displayPrice = formatPrice(
            convert(product.price, product.currency, selectedCurrency),
            selectedCurrency
          )
          const qty = getItemQty(product.id)
          const unavailable = product.quantity === 0

          return (
            <ProductRow
              key={product.id}
              product={product}
              quantity={qty}
              displayPrice={displayPrice}
              onAdd={() => onAdd(product)}
              onRemove={() => onRemove(product.id)}
              unavailable={unavailable}
            />
          )
        })}
      </div>
    </div>
  )
}
