'use client'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onSelect: (cat: string | null) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
          selected === null
            ? 'bg-[#f7931a] text-black'
            : 'bg-[#0f1729] text-zinc-400 border border-zinc-800'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
            selected === cat
              ? 'bg-[#f7931a] text-black'
              : 'bg-[#0f1729] text-zinc-400 border border-zinc-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
