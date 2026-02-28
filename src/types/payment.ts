// Payment types — Lightning invoice, zap request/receipt
export type PaymentStatus = 'idle' | 'generating' | 'waiting' | 'confirmed' | 'expired' | 'error'

export interface LightningInvoice {
  paymentRequest: string   // bolt11 invoice string
  paymentHash: string
  amountSat: number
  expiresAt: number        // unix timestamp
  description?: string
}

export interface ZapRequest {
  kind: 9734
  content: string
  tags: string[][]
  pubkey: string
  created_at: number
  id?: string
  sig?: string
}

export interface ZapReceipt {
  kind: 9735
  content: string
  tags: string[][]
  pubkey: string
  created_at: number
  id: string
  sig: string
}

export interface PaymentState {
  status: PaymentStatus
  invoice: LightningInvoice | null
  zapReceipt: ZapReceipt | null
  error: string | null
}
