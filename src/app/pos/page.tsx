'use client'

import { useState, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { useNostrStore } from '@/stores/nostr'
import { useSettingsStore } from '@/stores/settings'
import { usePOSStore } from '@/stores/pos'
import { useCurrencyStore } from '@/stores/currency'
import { useStall } from '@/hooks/useStall'
import { useProducts } from '@/hooks/useProducts'
import { useCurrency } from '@/hooks/useCurrency'
import Numpad from '@/components/pos/Numpad'
import MenuView from '@/components/pos/MenuView'
import CartSheet from '@/components/pos/Cart'

export default function POSPage() {
  const router = useRouter()
  const uniqueId = useId()

  const merchantPubkey = useNostrStore((s) => s.merchantPubkey)
  const activeCurrencies = useSettingsStore((s) => s.activeCurrencies)
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency)
  const lightningAddress = useSettingsStore((s) => s.lightningAddress)

  const { cart, addToCart, updateQuantity, clearCart, getTotal, getItemCount } = usePOSStore()
  const { rates, convert } = useCurrency()

  const [mode, setMode] = useState<'numpad' | 'menu'>('numpad')
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency || 'SAT')
  const [cartOpen, setCartOpen] = useState(false)
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
      if (digit === '00') {
        const val = prev * 100
        if (val > 9999999999) return prev
        return val
      }
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
    const orderId = `free-${Date.now()}`
    usePOSStore.getState().setOrderId(orderId)
    router.push(`/pos/${orderId}?amount=${cents}&currency=${selectedCurrency}`)
  }, [cents, selectedCurrency, router])

  const itemCount = getItemCount()
  const totalSats = getTotal()

  const currencyChips = activeCurrencies.length > 0 ? activeCurrencies : ['SAT', 'ARS', 'USD']

  // Format display amount for numpad
  const getNumpadDisplay = () => {
    if (selectedCurrency === 'SAT') {
      return cents.toLocaleString('es-AR')
    }
    return (cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getCurrencySymbol = () => {
    if (selectedCurrency === 'SAT') return ''
    if (selectedCurrency === 'ARS') return '$'
    if (selectedCurrency === 'USD') return 'US$'
    return '$'
  }

  // Secondary conversion
  const getSecondaryDisplay = () => {
    if (cents === 0) return ''
    const amount = selectedCurrency === 'SAT' ? cents : cents / 100
    if (selectedCurrency === 'SAT') {
      const ars = convert(amount, 'SAT', 'ARS')
      if (ars > 0) return `≈ $${Math.round(ars).toLocaleString('es-AR')} ARS`
      return ''
    }
    const sats = convert(amount, selectedCurrency, 'SAT')
    if (sats > 0) return `≈ ${Math.round(sats).toLocaleString('es-AR')} sats`
    return ''
  }

  const showMenuTab = hasProducts && !isLoading

  return (
    <div className="h-dvh flex flex-col bg-[#09090b] text-white overflow-hidden" style={{ fontFamily: 'var(--font-geist), sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[#f7931a] text-sm">⚡</span>
          <span className="text-zinc-400 text-sm truncate" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            {lightningAddress || 'sin configurar'}
          </span>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="text-zinc-600 hover:text-zinc-400 transition p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Mode Toggle — only show if products exist */}
      {showMenuTab && (
        <div className="px-4 pb-2">
          <div className="flex bg-[#18181b] rounded-lg p-0.5">
            <button
              onClick={() => setMode('numpad')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                mode === 'numpad'
                  ? 'bg-[#27272a] text-white'
                  : 'text-zinc-500'
              }`}
            >
              MONTO
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all relative ${
                mode === 'menu'
                  ? 'bg-[#27272a] text-white'
                  : 'text-zinc-500'
              }`}
            >
              MENÚ
              {itemCount > 0 && mode !== 'menu' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f7931a] text-black text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* NUMPAD MODE */}
        <div
          className={`flex-1 flex flex-col transition-opacity duration-200 ${
            mode === 'numpad' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        >
          {/* Currency pills */}
          <div className="flex gap-1.5 px-4 pb-2">
            {currencyChips.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCurrency(c)
                  setCents(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  c === selectedCurrency
                    ? 'bg-[#f7931a]/15 text-[#f7931a] border border-[#f7931a]/30'
                    : 'bg-[#18181b] text-zinc-500 border border-transparent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Amount display */}
          <div className="text-center py-4 px-4">
            <div
              className="text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              <span className="text-zinc-500 text-3xl">{getCurrencySymbol()}</span>
              {' '}{getNumpadDisplay()}
            </div>
            <div className="text-sm text-zinc-500 mt-1.5" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              {getSecondaryDisplay()}
            </div>
          </div>

          {/* Numpad */}
          <Numpad
            currency={selectedCurrency}
            onInput={handleNumpadInput}
            onBackspace={handleBackspace}
          />

          {/* Cobrar button */}
          <div className="px-4 pb-4 mt-auto">
            <button
              onClick={handleFreeCheckout}
              disabled={cents === 0}
              className={`w-full rounded-xl py-4 font-bold text-lg transition-all ${
                cents > 0
                  ? 'bg-[#f7931a] text-black active:bg-[#e8851a] animate-pulse-subtle'
                  : 'bg-[#18181b] text-zinc-600 cursor-not-allowed'
              }`}
            >
              Cobrar ⚡
            </button>
          </div>
        </div>

        {/* MENU MODE */}
        {showMenuTab && (
          <div
            className={`flex-1 flex flex-col min-h-0 transition-opacity duration-200 ${
              mode === 'menu' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          >
            <MenuView
              products={products}
              categories={categories}
              selectedCurrency={selectedCurrency}
              convert={convert}
              getItemQty={getItemQty}
              onAdd={addToCart}
              onRemove={(productId) => updateQuantity(productId, getItemQty(productId) - 1)}
              isLoading={isLoading}
            />

            {/* Footer */}
            <div className="px-4 py-3 flex items-center gap-3">
              {itemCount > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#18181b] text-zinc-500 active:bg-[#27272a] transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              )}
              <button
                onClick={itemCount > 0 ? () => setCartOpen(true) : undefined}
                disabled={itemCount === 0}
                className={`flex-1 flex items-center justify-between rounded-xl py-3.5 px-5 font-bold text-base transition-all ${
                  itemCount > 0
                    ? 'bg-[#f7931a] text-black active:bg-[#e8851a] animate-pulse-subtle'
                    : 'bg-[#18181b] text-zinc-600 cursor-not-allowed'
                }`}
              >
                <span>Cobrar ⚡</span>
                {itemCount > 0 && (
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {formatMenuTotal(totalSats, selectedCurrency, convert)}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); handleCheckout() }}
        selectedCurrency={selectedCurrency}
      />
    </div>
  )
}

function formatMenuTotal(totalSats: number, currency: string, convert: (a: number, f: string, t: string) => number): string {
  if (currency === 'SAT') return `${Math.round(totalSats).toLocaleString('es-AR')} SAT`
  const amount = convert(totalSats, 'SAT', currency)
  return `$${Math.round(amount).toLocaleString('es-AR')}`
}
