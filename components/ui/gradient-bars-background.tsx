'use client'

import React, { useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientBarsBackgroundProps {
  className?: string
  barCount?: number
}

export function GradientBarsBackground({
  className,
  barCount = 14,
}: GradientBarsBackgroundProps) {
  const { scrollYProgress } = useScroll()

  // Scroll-linked smooth parallax & fade out as user scrolls past hero
  const translateY = useTransform(scrollYProgress, [0, 0.45], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.55], [1, 0.85, 0])

  // Pre-calculate bar variations deterministically for stable SSR hydration
  const bars = useMemo(() => {
    const barConfigs = [
      { height: '85%', delay: '0s', duration: '7s', opacity: 'opacity-40', gradient: 'from-violet-600/30 via-purple-500/20 to-transparent' },
      { height: '65%', delay: '1.2s', duration: '9s', opacity: 'opacity-25', gradient: 'from-indigo-600/25 via-violet-600/15 to-transparent' },
      { height: '95%', delay: '2.5s', duration: '8s', opacity: 'opacity-50', gradient: 'from-purple-600/35 via-violet-500/25 to-transparent' },
      { height: '75%', delay: '0.8s', duration: '6.5s', opacity: 'opacity-30', gradient: 'from-violet-500/25 via-indigo-500/15 to-transparent' },
      { height: '100%', delay: '1.8s', duration: '10s', opacity: 'opacity-60', gradient: 'from-purple-500/40 via-violet-600/30 to-transparent' },
      { height: '80%', delay: '3.1s', duration: '7.5s', opacity: 'opacity-35', gradient: 'from-indigo-500/30 via-purple-600/20 to-transparent' },
      { height: '90%', delay: '0.5s', duration: '8.5s', opacity: 'opacity-55', gradient: 'from-violet-600/40 via-purple-500/25 to-transparent' },
      { height: '70%', delay: '2.0s', duration: '9.5s', opacity: 'opacity-30', gradient: 'from-purple-600/30 via-indigo-600/15 to-transparent' },
      { height: '100%', delay: '1.4s', duration: '7s', opacity: 'opacity-65', gradient: 'from-violet-500/45 via-purple-600/35 to-transparent' },
      { height: '85%', delay: '2.8s', duration: '8s', opacity: 'opacity-40', gradient: 'from-indigo-600/30 via-violet-500/20 to-transparent' },
      { height: '60%', delay: '0.3s', duration: '6.5s', opacity: 'opacity-25', gradient: 'from-purple-500/25 via-violet-600/15 to-transparent' },
      { height: '90%', delay: '1.7s', duration: '9s', opacity: 'opacity-50', gradient: 'from-violet-600/35 via-indigo-500/20 to-transparent' },
      { height: '75%', delay: '3.3s', duration: '8.5s', opacity: 'opacity-30', gradient: 'from-purple-600/30 via-purple-500/15 to-transparent' },
      { height: '95%', delay: '0.9s', duration: '7.5s', opacity: 'opacity-45', gradient: 'from-indigo-500/35 via-violet-600/25 to-transparent' },
    ]
    return barConfigs.slice(0, barCount)
  }, [barCount])

  return (
    <motion.div
      style={{
        y: translateY,
        opacity,
      }}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] sm:h-[1100px] overflow-hidden select-none',
        className,
      )}
    >
      {/* Top Mask with Radial Falloff to smoothly blend with background */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_45%,transparent_80%)]">
        {/* Central Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70rem] h-[40rem] rounded-full bg-[radial-gradient(50%_50%_at_50%_0%,rgba(147,51,234,0.22)_0%,rgba(79,70,229,0.08)_50%,transparent_100%)] blur-3xl" />

        {/* Grid of Gradient Bars */}
        <div className="relative mx-auto flex h-full max-w-7xl items-start justify-between px-4 sm:px-6">
          {bars.map((bar, i) => (
            <div
              key={i}
              className={cn(
                'relative w-[3px] sm:w-[5px] md:w-[7px] lg:w-[10px] rounded-full transition-all',
                bar.opacity,
                // Hide alternating bars on mobile for performance and clean spacing
                i % 2 !== 0 ? 'hidden sm:block' : 'block',
              )}
              style={{
                height: bar.height,
              }}
            >
              {/* Vertical Gradient Stream */}
              <div
                className={cn(
                  'h-full w-full rounded-full bg-gradient-to-b animate-pulse',
                  bar.gradient,
                )}
                style={{
                  animationDuration: bar.duration,
                  animationDelay: bar.delay,
                }}
              />

              {/* Glowing Head of the Bar */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 size-1.5 sm:size-2 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(192,132,252,0.9)] opacity-80"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Linear Fade to prevent any hard cut */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0910] to-transparent" />
    </motion.div>
  )
}

export default GradientBarsBackground
