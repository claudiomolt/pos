import { create } from 'zustand'
import { DEFAULT_RELAYS } from '@/config/constants'

interface NostrState {
  relays: string[]
  merchantPubkey: string | null
  isConnected: boolean
  setRelays: (relays: string[]) => void
  setMerchantPubkey: (pubkey: string | null) => void
  setConnected: (connected: boolean) => void
}

export const useNostrStore = create<NostrState>((set) => ({
  relays: DEFAULT_RELAYS,
  merchantPubkey: null,
  isConnected: false,
  setRelays: (relays) => set({ relays }),
  setMerchantPubkey: (pubkey) => set({ merchantPubkey: pubkey }),
  setConnected: (connected) => set({ isConnected: connected }),
}))
