'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Cpu,
  Flame,
  PlayCircle,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientBarsBackground } from '@/components/ui/gradient-bars-background'
import { ProductMockupExperience, MockupMode } from '@/components/landing/product-mockup-experience'
import { NetworkGraphCanvas } from '@/components/landing/network-graph-canvas'
import { TerminalShowcase } from '@/components/landing/terminal-showcase'
import { FloatingCodeCard } from '@/components/landing/floating-code-card'

const orbitingTechs = [
  { name: 'JavaScript', color: '#F7DF1E', bg: 'rgba(247, 223, 30, 0.15)' },
  { name: 'TypeScript', color: '#3178C6', bg: 'rgba(49, 120, 198, 0.15)' },
  { name: 'React 19', color: '#61DAFB', bg: 'rgba(97, 218, 251, 0.15)' },
  { name: 'Node.js', color: '#339933', bg: 'rgba(51, 153, 51, 0.15)' },
  { name: 'Python', color: '#3776AB', bg: 'rgba(55, 118, 171, 0.15)' },
  { name: 'SQL & DB', color: '#336791', bg: 'rgba(51, 103, 145, 0.15)' },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeMode, setActiveMode] = useState<MockupMode>('dashboard')
  const [isMobile, setIsMobile] = useState(false)

  // Typewriter dynamic headline keyword
  const keywords = ['sem saber para onde ir.', 'perdido em tutoriais soltos.', 'sem saber se está pronto.', 'com a metodologia DevPath AI.']
  const [keywordIndex, setKeywordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    const targetWord = keywords[keywordIndex]

    if (!isDeleting) {
      if (currentText.length < targetWord.length) {
        timer = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length + 1))
        }, 65)
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2800)
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length - 1))
        }, 35)
      } else {
        setIsDeleting(false)
        setKeywordIndex((prev) => (prev + 1) % keywords.length)
      }
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, keywordIndex])

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
  const rotateX = useTransform(smoothProgress, [0, 0.4], isMobile ? [10, 0] : [22, 0])
  const scale = useTransform(smoothProgress, [0, 0.4], isMobile ? [0.92, 1] : [0.85, 1])
  const translateY = useTransform(smoothProgress, [0, 0.4], isMobile ? [25, 0] : [45, 0])
  const glowOpacity = useTransform(smoothProgress, [0, 0.35, 0.8], [0.3, 0.7, 0.4])

  // Parallax Header
  const headerY = useTransform(smoothProgress, [0, 0.45], [0, -35])
  const headerOpacity = useTransform(smoothProgress, [0, 0.5, 0.9], [1, 0.95, 0.85])

  // Scroll Storytelling: Automatically morph platform states based on user scroll position
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.25) {
      setActiveMode('dashboard')
    } else if (latest >= 0.25 && latest < 0.5) {
      setActiveMode('trilha')
    } else if (latest >= 0.5 && latest < 0.75) {
      setActiveMode('aula')
    } else {
      setActiveMode('codelab')
    }
  })

  return (
    <section
      ref={containerRef}
      className="relative min-h-[200vh] sm:min-h-[230vh] lg:min-h-[250vh] w-full"
      style={{ perspective: '1200px' }}
    >
      {/* Background Gradient Bars & Tech Network Particle Canvas */}
      <GradientBarsBackground />
      <NetworkGraphCanvas />

      {/* Floating Code Snippet Card (Left Desktop Ambient) */}
      <div className="hidden xl:block absolute left-8 top-32 z-20 pointer-events-none">
        <FloatingCodeCard language="typescript" />
      </div>

      {/* Floating Code Snippet Card (Right Desktop Ambient) */}
      <div className="hidden xl:block absolute right-8 top-44 z-20 pointer-events-none">
        <FloatingCodeCard language="python" />
      </div>

      {/* Sticky Cinematic Viewport Frame */}
      <div className="sticky top-16 sm:top-20 z-10 flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-start overflow-hidden px-3 sm:px-6 py-2 sm:py-4">
        {/* Title Content with Scroll Parallax */}
        <motion.div
          style={{
            y: headerY,
            opacity: headerOpacity,
          }}
          className="w-full max-w-5xl mx-auto text-center shrink-0 z-20 space-y-4 sm:space-y-5 pt-2"
        >
          {/* Pill Badge */}
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-950/60 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-lg shadow-violet-950/50 hover:border-violet-400/70 hover:bg-violet-900/40 transition-all backdrop-blur-md group"
          >
            <span className="grid size-4 place-items-center rounded-full bg-violet-500 text-white shadow-sm">
              <Sparkles className="size-2.5" />
            </span>
            <span>Trilha & Mentoria guiada por IA para Programadores</span>
            <ChevronRight className="size-3 text-violet-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Main Headline with Typewriter dynamic effect */}
          <h1 className="text-balance font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Pare de estudar programação{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
              {currentText}
            </span>
            <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-11 bg-violet-400 align-middle ml-1 animate-pulse" />
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-3xl text-pretty text-xs sm:text-base lg:text-lg text-zinc-300 font-medium leading-relaxed">
            Uma plataforma dev-native com inteligência artificial que constrói sua trilha personalizada, acompanha seu progresso diário e guia você com laboratório de código no navegador e mentor virtual 24/7.
          </p>

          {/* Orbiting Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {orbitingTechs.map((tech) => (
              <span
                key={tech.name}
                style={{ backgroundColor: tech.bg, borderColor: `${tech.color}40`, color: tech.color }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border backdrop-blur-md shadow-sm flex items-center gap-1.5"
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: tech.color }} />
                {tech.name}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm px-8 py-5 shadow-xl shadow-purple-600/30 gap-2 cursor-pointer transition-all hover:scale-105 border border-violet-400/30 group"
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
              className="w-full sm:w-auto rounded-2xl border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs sm:text-sm px-7 py-5 gap-2 transition-colors shadow-lg"
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
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-r from-violet-600/35 via-purple-600/35 to-indigo-600/35 blur-3xl"
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
