'use client'

import Dexie, { type Table } from 'dexie'
import type { Stall } from '@/types/stall'
import type { Product } from '@/types/product'

// ─── DB schema ──────────────────────────────────────────────────────────────

interface CacheRecord {
  merchantPubkey: string
  stalls: Stall[]
  products: Product[]
  lastSync: number // unix timestamp (seconds)
}

class POSCache extends Dexie {
  merchantCache!: Table<CacheRecord, string>

  constructor() {
    super('pos-cache')
    this.version(1).stores({
      merchantCache: 'merchantPubkey',
    })
  }
}

let db: POSCache | null = null

function getDB(): POSCache {
  if (!db) db = new POSCache()
  return db
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface CacheResult {
  stalls: Stall[]
  products: Product[]
  lastSync: number | null
}

/**
 * Retrieve cached stalls and products for a merchant.
 * Returns null values if no cache exists yet.
 */
export async function getFromCache(merchantPubkey: string): Promise<CacheResult> {
  try {
    const record = await getDB().merchantCache.get(merchantPubkey)
    if (!record) {
      return { stalls: [], products: [], lastSync: null }
    }
    return {
      stalls: record.stalls,
      products: record.products,
      lastSync: record.lastSync,
    }
  } catch (err) {
    console.warn('[POSCache] getFromCache error:', err)
    return { stalls: [], products: [], lastSync: null }
  }
}

/**
 * Persist stalls and products for a merchant.
 * Records the current timestamp as lastSync.
 */
export async function saveToCache(
  merchantPubkey: string,
  stalls: Stall[],
  products: Product[]
): Promise<void> {
  try {
    await getDB().merchantCache.put({
      merchantPubkey,
      stalls,
      products,
      lastSync: Math.floor(Date.now() / 1000),
    })
  } catch (err) {
    console.warn('[POSCache] saveToCache error:', err)
  }
}
