'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientBarsBackground } from '@/components/ui/gradient-bars-background'
import { ProductMockupExperience, MockupMode } from '@/components/landing/product-mockup-experience'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeMode, setActiveMode] = useState<MockupMode>('dashboard')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Dedicated scroll storytelling track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Physics spring for smooth 60fps interaction
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 35,
    restDelta: 0.001,
  })

  // 3D Perspective Transformations
  const rotateX = useTransform(smoothProgress, [0, 0.4], isMobile ? [10, 0] : [24, 0])
  const scale = useTransform(smoothProgress, [0, 0.4], isMobile ? [0.92, 1] : [0.84, 1])
  const translateY = useTransform(smoothProgress, [0, 0.4], isMobile ? [25, 0] : [55, 0])
  const glowOpacity = useTransform(smoothProgress, [0, 0.35, 0.8], [0.25, 0.6, 0.3])

  // Parallax Header
  const headerY = useTransform(smoothProgress, [0, 0.45], [0, -40])
  const headerOpacity = useTransform(smoothProgress, [0, 0.5, 0.9], [1, 0.95, 0.85])

  // Scroll Storytelling: Automatically morph platform states based on user scroll position
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.25) {
      setActiveMode('dashboard')
    } else if (latest >= 0.25 && latest < 0.50) {
      setActiveMode('trilha')
    } else if (latest >= 0.50 && latest < 0.75) {
      setActiveMode('aula')
    } else {
      setActiveMode('codelab')
    }
  })

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] sm:h-[230vh] lg:h-[250vh] w-full"
      style={{ perspective: '1200px' }}
    >
      {/* Background Gradient Bars */}
      <GradientBarsBackground />

      {/* Sticky Cinematic Viewport Frame */}
      <div className="sticky top-16 sm:top-20 z-10 flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-start overflow-hidden px-3 sm:px-6 py-2 sm:py-4">
        {/* Title Content with Scroll Parallax */}
        <motion.div
          style={{
            y: headerY,
            opacity: headerOpacity,
          }}
          className="w-full max-w-4xl mx-auto text-center shrink-0 z-20 space-y-4 sm:space-y-5 pt-2"
        >
          {/* Pill Badge */}
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-950/50 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-md shadow-violet-950/40 hover:border-violet-400/60 hover:bg-violet-900/30 transition-all backdrop-blur-md group"
          >
            <span className="grid size-4 place-items-center rounded-full bg-violet-500 text-white">
              <Sparkles className="size-2.5" />
            </span>
            <span>Mentoria guiada por Inteligência Artificial — DEVPATH AI</span>
            <ChevronRight className="size-3 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Main Headline */}
          <h1 className="text-balance font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Pare de estudar programação{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
              sem saber para onde ir.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-pretty text-xs sm:text-base lg:text-lg text-zinc-400 font-medium leading-relaxed">
            Uma plataforma com IA que cria sua trilha personalizada, acompanha seu progresso diário e guia você do zero absoluto até sua carreira profissional como desenvolvedor.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm px-7 py-5 shadow-xl shadow-violet-600/30 gap-2 cursor-pointer transition-all group"
            >
              <Link href="/cadastro">
                <span>Começar minha jornada</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-xs sm:text-sm px-6 py-5 gap-2 transition-colors"
            >
              <a href="#como-funciona">
                <PlayCircle className="size-4 text-violet-400" />
                <span>Conhecer a plataforma</span>
              </a>
            </Button>
          </div>
        </motion.div>

        {/* 3D Morphing Product Showcase Window */}
        <div className="relative w-full max-w-5xl mx-auto mt-4 sm:mt-6">
          {/* Dynamic Reactive Violet Glow */}
          <motion.div
            style={{ opacity: glowOpacity }}
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-indigo-600/30 blur-3xl"
          />

          <motion.div
            style={{
              rotateX,
              scale,
              y: translateY,
              transformStyle: 'preserve-3d',
            }}
            className="w-full"
          >
            <ProductMockupExperience
              activeMode={activeMode}
              onModeChange={(m) => setActiveMode(m)}
              interactive={true}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
