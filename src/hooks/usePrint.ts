'use client'

export interface PrintData {
  title: string
  items: Array<{ name: string; qty: number; price: number; currency: string }>
  total: { value: number; currency: string }
  orderId: string
  timestamp: number
  destination: string
}

interface AndroidBridge {
  print: (data: string) => void
  readNFC?: () => void
}

function getAndroid(): AndroidBridge | null {
  if (typeof window === 'undefined') return null
  const w = window as { Android?: AndroidBridge }
  if ('Android' in w && w.Android && typeof w.Android.print === 'function') {
    return w.Android
  }
  return null
}

export function usePrint() {
  const isPrintAvailable = getAndroid() !== null

  const print = (data: PrintData) => {
    const android = getAndroid()
    if (!android) return
    android.print(JSON.stringify(data))
  }

  return { isPrintAvailable, print }
}
