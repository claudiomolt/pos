'use client'

import { useEffect, useRef, useState } from 'react'
import { Blocks } from 'lucide-react'

export default function BitcoinBlock() {
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [animate, setAnimate] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const prevBlockRef = useRef<number | null>(null)

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    function connect() {
      const ws = new WebSocket('wss://mempool.space/api/v1/ws')
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }))
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const data = JSON.parse(event.data) as {
            block?: { height: number }
            blocks?: Array<{ height: number }>
          }

          let height: number | null = null

          if (data.block?.height) {
            height = data.block.height
          } else if (data.blocks && data.blocks.length > 0) {
            height = Math.max(...data.blocks.map((b) => b.height))
          }

          if (height !== null && height !== prevBlockRef.current) {
            prevBlockRef.current = height
            setBlockHeight(height)
            setAnimate(true)
            setTimeout(() => setAnimate(false), 1000)
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onerror = () => {
        ws.close()
      }

      ws.onclose = () => {
        wsRef.current = null
        // Reconnect after 5s
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [])

  if (blockHeight === null) {
    return (
      <div className="flex items-center gap-1 text-zinc-600 text-xs">
        <Blocks size={12} />
        <span>···</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <Blocks size={12} className="text-[#f7931a]" />
      <span
        className={`font-mono font-medium transition-all duration-300 ${
          animate ? 'text-[#f7931a] scale-110' : 'text-zinc-400'
        }`}
        style={{ display: 'inline-block' }}
      >
        {blockHeight.toLocaleString()}
      </span>
    </div>
  )
}
