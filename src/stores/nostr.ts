// TODO: Nostr store — NDK instance, connection state, signer
import { create } from 'zustand'

interface NostrState {
  connected: boolean
  pubkey: string | null
}

export const useNostrStore = create<NostrState>(() => ({
  connected: false,
  pubkey: null,
}))
