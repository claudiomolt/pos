// NIP-15 Stall — Nostr kind:30017
export interface StallShipping {
  id: string
  name: string
  cost: number
  regions: string[]
}

export interface Stall {
  id: string          // event d-tag / stall identifier
  name: string
  description: string
  currency: string    // ISO 4217 or "SAT"
  shipping: StallShipping[]
  pubkey?: string     // owner pubkey
  createdAt?: number  // unix timestamp
}
