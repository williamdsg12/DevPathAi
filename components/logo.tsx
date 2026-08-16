import { Route } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
  textClassName,
}: {
  className?: string
  showText?: boolean
  textClassName?: string
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm size-8',
          className,
        )}
      >
        <Route className="size-4" strokeWidth={2.4} />
      </span>
      {showText && (
        <span className={cn('font-display text-lg font-bold tracking-tight', textClassName)}>
          DevPath<span className="text-primary"> AI</span>
        </span>
      )}
    </span>
  )
}
