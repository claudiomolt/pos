import { create } from 'zustand'
import type { Product } from '@/types/product'

interface CartItem {
  product: Product
  quantity: number
}

interface POSState {
  destination: string | null
  cart: CartItem[]
  stallId: string | null
  orderId: string | null
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  setDestination: (address: string | null) => void
  setStallId: (id: string | null) => void
  setOrderId: (id: string | null) => void
  getTotal: () => number
  getItemCount: () => number
}

export const usePOSStore = create<POSState>((set, get) => ({
  destination: null,
  cart: [],
  stallId: null,
  orderId: null,

  addToCart: (product) => {
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { cart: [...state.cart, { product, quantity: 1 }] }
    })
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }))
  },

  updateQuantity: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      ),
    }))
  },

  clearCart: () => set({ cart: [], orderId: null }),

  setDestination: (address) => set({ destination: address }),
  setStallId: (id) => set({ stallId: id }),
  setOrderId: (id) => set({ orderId: id }),

  getTotal: () => {
    const { cart } = get()
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  },

  getItemCount: () => {
    const { cart } = get()
    return cart.reduce((count, item) => count + item.quantity, 0)
  },
}))
