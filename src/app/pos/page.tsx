'use client'

import { useState, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useNostrStore } from '@/stores/nostr'
import { useSettingsStore } from '@/stores/settings'
import { usePOSStore } from '@/stores/pos'
import { useCurrencyStore } from '@/stores/currency'
import { useStall } from '@/hooks/useStall'
import { useProducts } from '@/hooks/useProducts'
import { useCurrency } from '@/hooks/useCurrency'
import Numpad from '@/components/pos/Numpad'
import ProductCard from '@/components/pos/ProductCard'
import CategoryFilter from '@/components/pos/CategoryFilter'
import CartSheet from '@/components/pos/Cart'
import type { Product } from '@/types/product'

function formatPrice(amount: number, currency: string, rates: Record<string, number>): string {
  if (currency === 'SAT') {
    return `${Math.round(amount).toLocaleString()} SAT`
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function convertProductPrice(
  product: Product,
  targetCurrency: string,
  convertCurrency: (amount: number, from: string, to: string) => number
): number {
  return convertCurrency(product.price, product.currency, targetCurrency)
}

export default function POSPage() {
  const router = useRouter()
  const uniqueId = useId()

  const merchantPubkey = useNostrStore((s) => s.merchantPubkey)
  const activeCurrencies = useSettingsStore((s) => s.activeCurrencies)
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency)

  const { cart, addToCart, updateQuantity, clearCart, getTotal, getItemCount } = usePOSStore()
  const { rates, convert } = useCurrency()

  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency || 'SAT')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  // Numpad state (free amount mode, cents-first)
  const [cents, setCents] = useState(0)

  const { stalls, isLoading: stallsLoading } = useStall(merchantPubkey)
  const { products, categories, isLoading: productsLoading } = useProducts(
    merchantPubkey,
    stalls[0]?.id
  )

  const isLoading = stallsLoading || productsLoading
  const hasProducts = products.length > 0

  // Numpad handlers
  const handleNumpadInput = useCallback((digit: string) => {
    setCents((prev) => {
      const str = prev.toString() + digit
      const val = parseInt(str, 10)
      if (val > 9999999999) return prev
      return val
    })
  }, [])

  const handleBackspace = useCallback(() => {
    setCents((prev) => {
      const str = prev.toString().slice(0, -1)
      return str ? parseInt(str, 10) : 0
    })
  }, [])

  // Cart item quantity lookup
  const getItemQty = (productId: string) => {
    return cart.find((c) => c.product.id === productId)?.quantity ?? 0
  }

  // Checkout
  const handleCheckout = useCallback(() => {
    const orderId = `order-${Date.now()}-${uniqueId.replace(/:/g, '')}`
    usePOSStore.getState().setOrderId(orderId)
    router.push(`/pos/${orderId}`)
  }, [router, uniqueId])

  const handleFreeCheckout = useCallback(() => {
    if (cents === 0) return
    // Create a synthetic free-amount "order"
    const orderId = `free-${Date.now()}`
    usePOSStore.getState().setOrderId(orderId)
    router.push(`/pos/${orderId}?amount=${cents}&currency=${selectedCurrency}`)
  }, [cents, selectedCurrency, router])

  // Filtered products
  const filteredProducts = selectedCategory
    ? products.filter((p) => {
        // We don't store categories on product directly, but show all when no filter
        return true
      })
    : products

  const totalSats = getTotal()
  const displayTotal = formatPrice(
    convert(totalSats, 'SAT', selectedCurrency),
    selectedCurrency,
    rates
  )

  const itemCount = getItemCount()

  // Currency chips
  const currencyChips = activeCurrencies.length > 0 ? activeCurrencies : ['SAT', 'ARS', 'USD']

  return (
    <div className="min-h-screen bg-[#060a12] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#060a12]/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.push('/')} className="text-zinc-400 text-sm hover:text-white transition">
            ← Setup
          </button>
          <h1 className="font-bold text-white">⚡ POS</h1>
          <div className="w-16" />
        </div>

        {/* Currency chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {currencyChips.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCurrency(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                c === selectedCurrency
                  ? 'bg-[#f7931a] text-black'
                  : 'bg-[#0f1729] text-zinc-400 border border-zinc-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !hasProducts && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <div className="animate-spin text-3xl">⚡</div>
            <p className="text-zinc-500 text-sm">Cargando menú...</p>
          </div>
        </div>
      )}

      {/* MENU MODE */}
      {!isLoading && hasProducts && (
        <>
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="px-4 py-4 space-y-2">
            {filteredProducts.map((product) => {
              const displayPrice = formatPrice(
                convertProductPrice(product, selectedCurrency, convert),
                selectedCurrency,
                rates
              )
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getItemQty(product.id)}
                  displayPrice={displayPrice}
                  onAdd={() => addToCart(product)}
                  onRemove={() => updateQuantity(product.id, getItemQty(product.id) - 1)}
                />
              )
            })}
          </div>
        </>
      )}

      {/* FREE AMOUNT MODE (numpad) */}
      {!isLoading && !hasProducts && (
        <div className="flex flex-col">
          <Numpad
            cents={cents}
            currency={selectedCurrency}
            onInput={handleNumpadInput}
            onBackspace={handleBackspace}
            onCartPress={() => setCartOpen(true)}
            showCartButton={false}
          />

          <div className="px-4 pb-4">
            <button
              onClick={handleFreeCheckout}
              disabled={cents === 0}
              className="w-full rounded-xl bg-[#f7931a] px-4 py-4 font-bold text-black text-lg disabled:opacity-30 disabled:cursor-not-allowed active:bg-[#e8851a] transition"
            >
              {cents === 0
                ? 'Continuar'
                : `Cobrar ${selectedCurrency === 'SAT' ? `${cents.toLocaleString()} SAT` : `$${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}`}
            </button>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); handleCheckout() }}
      />

      {/* Footer Cart Bar (menu mode only) */}
      {hasProducts && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f1729]/95 backdrop-blur border-t border-zinc-800 px-4 py-3 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { clearCart() }}
              className="flex items-center gap-1.5 rounded-xl bg-red-900/40 text-red-400 px-3 py-3 hover:bg-red-900/60 transition"
            >
              <Trash2 size={16} />
              <span className="text-sm font-medium">{itemCount}</span>
            </button>

            <button
              onClick={itemCount > 0 ? () => setCartOpen(true) : undefined}
              className={`flex-1 flex items-center justify-between rounded-xl px-4 py-3 font-bold text-lg transition ${
                itemCount > 0
                  ? 'bg-[#f7931a] text-black active:bg-[#e8851a] cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Cobrar</span>
              <span>{displayTotal}</span>
            </button>

            {itemCount > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative rounded-xl bg-[#0f1729] border border-zinc-700 p-3"
              >
                <ShoppingCart size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f7931a] text-black text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
