'use client'

import Link from 'next/link'

interface NavbarProps {
  title: string
  backHref?: string
}

export default function Navbar({ title, backHref = '/' }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 flex items-center gap-3 bg-[#060a12]/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
      <Link
        href={backHref}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0f1729] text-zinc-400 hover:text-[#f7931a] transition"
      >
        ←
      </Link>
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="ml-auto flex gap-2">
        <Link href="/settings" className="text-zinc-500 hover:text-[#f7931a] transition text-sm">
          ⚙️
        </Link>
      </div>
    </nav>
  )
}
