'use client'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onSelect: (cat: string | null) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-4 py-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
          selected === null
            ? 'bg-[#f7931a]/15 text-[#f7931a] border border-[#f7931a]/30'
            : 'bg-[#18181b] text-zinc-500 border border-transparent'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
            selected === cat
              ? 'bg-[#f7931a]/15 text-[#f7931a] border border-[#f7931a]/30'
              : 'bg-[#18181b] text-zinc-500 border border-transparent'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
