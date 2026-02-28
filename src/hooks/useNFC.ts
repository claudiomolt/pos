'use client'

import { useState, useCallback, useRef } from 'react'
import { showError } from '@/lib/toast'

interface NFCCard {
  serialNumber?: string
  records?: Array<{ recordType: string; data: string }>
  raw?: string
}

interface AndroidBridge {
  readNFC?: (callback?: string) => void
}

interface UseNFCReturn {
  isAvailable: boolean
  isReading: boolean
  startReading: () => Promise<void>
  stopReading: () => void
  lastCard: NFCCard | null
  error: string | null
}

declare global {
  interface Window {
    Android?: AndroidBridge
    __nfcCallback?: (data: string) => void
  }
}

// Check Web NFC availability
function hasWebNFC(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

function hasAndroidBridge(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Android' in window &&
    typeof window.Android?.readNFC === 'function'
  )
}

export function useNFC(): UseNFCReturn {
  const isAvailable = hasWebNFC() || hasAndroidBridge()
  const [isReading, setIsReading] = useState(false)
  const [lastCard, setLastCard] = useState<NFCCard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const readerRef = useRef<{ abort: () => void } | null>(null)

  const stopReading = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.abort()
      readerRef.current = null
    }
    setIsReading(false)
  }, [])

  const startReadingWebNFC = useCallback(async () => {
    interface NDEFReaderType {
      scan: (options?: { signal?: AbortSignal }) => Promise<void>
      addEventListener: (event: string, handler: (e: {
        serialNumber?: string
        message?: { records: Array<{ recordType: string; toRecords?: () => Array<{ recordType: string; data: ArrayBuffer }> }> }
      }) => void) => void
    }
    const NDEFReaderClass = ((window as unknown) as { NDEFReader: new () => NDEFReaderType }).NDEFReader

    const reader = new NDEFReaderClass()
    const controller = new AbortController()
    readerRef.current = controller

    reader.addEventListener('reading', (event) => {
      const records = event.message?.records.map((record) => ({
        recordType: record.recordType,
        data: record.toRecords
          ? JSON.stringify(record.toRecords())
          : '',
      })) ?? []

      setLastCard({
        serialNumber: event.serialNumber,
        records,
      })
    })

    await reader.scan({ signal: controller.signal })
  }, [])

  const startReadingAndroid = useCallback(() => {
    // Set up callback for Android bridge
    window.__nfcCallback = (data: string) => {
      try {
        const parsed = JSON.parse(data) as NFCCard
        setLastCard(parsed)
      } catch {
        setLastCard({ raw: data })
      }
    }

    window.Android?.readNFC?.()
  }, [])

  const startReading = useCallback(async () => {
    setError(null)
    setIsReading(true)

    try {
      if (hasWebNFC()) {
        await startReadingWebNFC()
      } else if (hasAndroidBridge()) {
        startReadingAndroid()
      } else {
        throw new Error('NFC not available on this device')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'NFC read failed'
      setError(message)
      setIsReading(false)
      showError(`NFC: ${message}`)
    }
  }, [startReadingWebNFC, startReadingAndroid])

  return {
    isAvailable,
    isReading,
    startReading,
    stopReading,
    lastCard,
    error,
  }
}
