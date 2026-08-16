'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
        'hover:border-primary/60 hover:bg-primary/[0.03]',
        selected
          ? 'border-primary bg-primary/[0.06] ring-1 ring-primary'
          : 'border-border bg-card',
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-tight">{label}</span>
        {description ? (
          <span className="text-xs leading-snug text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          'absolute right-3 top-3 grid size-5 place-items-center rounded-full border transition-all',
          selected
            ? 'border-primary bg-primary text-primary-foreground opacity-100'
            : 'border-border opacity-0 group-hover:opacity-100',
        )}
      >
        <Check className="size-3" />
      </span>
    </button>
  )
}
