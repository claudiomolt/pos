// TODO: POS store — cart items, active stall, order state
import { create } from 'zustand'

interface POSState {
  cartItems: unknown[]
  total: number
}

export const usePOSStore = create<POSState>(() => ({
  cartItems: [],
  total: 0,
}))
