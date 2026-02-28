// TODO: NFC store — reader state, last card data
import { create } from 'zustand'

interface NFCState {
  supported: boolean
  reading: boolean
  lastCard: string | null
}

export const useNFCStore = create<NFCState>(() => ({
  supported: false,
  reading: false,
  lastCard: null,
}))
