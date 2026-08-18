'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight, Zap, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PromoBannerProps {
  dismissible?: boolean
}

export function PromoBanner({ dismissible = true }: PromoBannerProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative overflow-hidden border-b border-lime-500/20 bg-gradient-to-r from-[#0a100d] via-[#0e1612] to-[#0a0f14] py-2.5 px-4 text-xs shadow-md">
      {/* Subtle Glow Accents */}
      <div className="absolute top-0 left-1/4 -mt-4 h-12 w-64 rounded-full bg-lime-500/10 blur-xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-4 h-12 w-64 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Badge className="bg-lime-400 text-black font-black text-[10px] tracking-wider uppercase px-2 py-0.5 shadow-sm shadow-lime-400/30">
            <Flame className="size-3 mr-1 fill-black" /> DE VOLTA PRO CÓDIGO
          </Badge>

          <span className="font-bold text-white text-xs sm:text-sm truncate">
            Transforme sua carreira dev com mentoria de IA e formação adaptativa.
          </span>

          <span className="hidden md:inline font-mono font-bold text-lime-400 text-xs">
            Até 40% OFF no Plano Pro
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/cursos">
            <Button
              size="sm"
              className="h-7 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-black text-[11px] px-3 gap-1 shadow-md shadow-lime-500/20 border border-lime-300/40 cursor-pointer"
            >
              APROVEITAR OFERTA <ArrowRight className="size-3" />
            </Button>
          </Link>

          {dismissible && (
            <button
              onClick={() => setVisible(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Fechar anúncio"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
