// Order types
export interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  currency: string
}

export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid' | 'failed' | 'cancelled'

export interface Order {
  id: string
  stallId: string
  items: OrderItem[]
  total: number
  currency: string
  status: OrderStatus
  destination?: string   // Lightning Address or pubkey
  shippingId?: string
  createdAt: number
  paidAt?: number
}
