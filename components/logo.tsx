import { Sparkles, Terminal } from 'lucide-react'
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
    <span className="inline-flex items-center gap-2.5 group select-none">
      <span
        className={cn(
          'relative grid place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25 size-9 border border-violet-400/30 transition-transform group-hover:scale-105',
          className,
        )}
      >
        <Terminal className="size-4.5 stroke-[2.4]" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
      </span>
      {showText && (
        <span className={cn('font-sans text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1', textClassName)}>
          <span>DEVPATH</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300 font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30">
            AI
          </span>
        </span>
      )}
    </span>
  )
}
