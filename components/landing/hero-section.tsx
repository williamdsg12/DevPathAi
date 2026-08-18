'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---- Configuração das camadas de parallax ----
// Cada camada é uma imagem gerada sobre fundo preto puro.
// As camadas de brilho usam mix-blend-screen (o preto some, sobra o brilho),
// criando profundidade sobreposta reagindo ao movimento do mouse.
interface ParallaxLayer {
  src: string
  alt: string
  speedX: number
  speedY: number
  rotation: number
  zIndex: number
  scale: number
  blend: 'normal' | 'screen'
  className?: string
  objectPosition?: string
}

const LAYERS: ParallaxLayer[] = [
  {
    src: '/images/parallax/layer-bg.png',
    alt: '',
    speedX: 0.012,
    speedY: 0.014,
    rotation: 0,
    zIndex: 1,
    scale: 1.15,
    blend: 'normal',
  },
  {
    src: '/images/parallax/layer-fog.png',
    alt: '',
    speedX: 0.03,
    speedY: 0.022,
    rotation: 0.6,
    zIndex: 2,
    scale: 1.25,
    blend: 'screen',
    className: 'opacity-60',
  },
  {
    src: '/images/parallax/layer-grid.png',
    alt: '',
    speedX: 0.02,
    speedY: 0.01,
    rotation: 0,
    zIndex: 3,
    scale: 1.2,
    blend: 'screen',
    className: 'opacity-80',
    objectPosition: 'center bottom',
  },
  {
    src: '/images/parallax/layer-particles.png',
    alt: '',
    speedX: 0.06,
    speedY: 0.05,
    rotation: 1.2,
    zIndex: 4,
    scale: 1.3,
    blend: 'screen',
    className: 'opacity-70',
  },
]

// ---- Variantes de animação de entrada (Framer Motion) ----
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: '0.55em', rotateX: -50 },
  show: {
    opacity: 1,
    y: '0em',
    rotateX: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const HEADLINE_WORDS: { text: string; highlight?: boolean }[] = [
  { text: 'Pare' },
  { text: 'de' },
  { text: 'estudar' },
  { text: 'programação' },
  { text: 'sem', highlight: true },
  { text: 'saber', highlight: true },
  { text: 'para', highlight: true },
  { text: 'onde', highlight: true },
  { text: 'ir.', highlight: true },
]

export function HeroSection() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Desativa o parallax quando o usuário prefere menos movimento
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Em telas de toque, o efeito por mouse não se aplica
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (prefersReduced || isTouch) return

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      }
    }

    // Loop de animação com interpolação (lerp) para suavidade a 60fps
    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08

      const x = currentRef.current.x
      const y = currentRef.current.y
      const rotate = (x / (window.innerWidth / 2)) * 6

      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const layer = LAYERS[i]
        el.style.transform = `perspective(1600px) rotateY(${rotate * layer.rotation}deg) translate3d(${
          -x * layer.speedX
        }px, ${-y * layer.speedY}px, 0) scale(${layer.scale})`
      })

      if (textRef.current) {
        textRef.current.style.transform = `translate3d(${-x * 0.02}px, ${-y * 0.02}px, 0)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black">
      {/* Camadas de parallax */}
      {LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            layerRefs.current[i] = el
          }}
          className="pointer-events-none absolute inset-0 will-change-transform"
          style={{
            zIndex: layer.zIndex,
            mixBlendMode: layer.blend,
            transform: `scale(${layer.scale})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.src || '/placeholder.svg'}
            alt={layer.alt}
            aria-hidden="true"
            className={cn('h-full w-full object-cover', layer.className)}
            style={{ objectPosition: layer.objectPosition ?? 'center' }}
          />
        </div>
      ))}

      {/* Vinheta para foco e leitura do texto */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]"
        aria-hidden="true"
      />
      {/* Fade inferior para transição com a próxima seção */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-40 bg-gradient-to-b from-transparent to-black"
        aria-hidden="true"
      />

      {/* Texto gigante de profundidade ao fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center overflow-hidden"
      >
        <span className="select-none whitespace-nowrap font-sans text-[28vw] font-black leading-none tracking-tighter text-white/[0.03]">
          DEVPATH
        </span>
      </div>

      {/* Conteúdo central */}
      <div
        ref={textRef}
        className="absolute inset-0 z-10 flex items-center justify-center px-4 will-change-transform"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-950/40 px-4 py-1.5 text-xs font-semibold text-violet-200 shadow-lg shadow-violet-950/50 backdrop-blur-md transition-all hover:border-violet-400/60 hover:bg-violet-900/40"
            >
              <span className="grid size-4 place-items-center rounded-full bg-violet-500 text-white">
                <Sparkles className="size-2.5" />
              </span>
              <span>Mentoria guiada por Inteligência Artificial — DEVPATH AI</span>
              <ChevronRight className="size-3 text-violet-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Título palavra por palavra */}
          <h1
            className="mt-6 text-balance font-sans text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.5)' }}
          >
            <span className="sr-only">Pare de estudar programação sem saber para onde ir.</span>
            <motion.span
              aria-hidden="true"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
              className="inline-flex flex-wrap items-center justify-center gap-x-[0.28em] gap-y-1"
              style={{ perspective: '900px' }}
            >
              {HEADLINE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className={cn(
                    'inline-block',
                    word.highlight &&
                      'bg-gradient-to-r from-fuchsia-300 via-violet-200 to-white bg-clip-text text-transparent [-webkit-text-stroke:0.5px_rgba(168,85,247,0.35)] drop-shadow-[0_2px_12px_rgba(88,28,135,0.9)]',
                  )}
                >
                  {word.text}
                </motion.span>
              ))}
            </motion.span>
          </h1>

          {/* Subtítulo */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-zinc-300/90 sm:text-lg"
          >
            Uma plataforma com IA que cria sua trilha personalizada, acompanha seu progresso diário e guia você do zero
            absoluto até sua carreira profissional como desenvolvedor.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Button
              asChild
              size="lg"
              className="group w-full rounded-2xl bg-violet-600 px-7 py-6 text-sm font-bold text-white shadow-xl shadow-violet-600/30 transition-all hover:bg-violet-500 sm:w-auto"
            >
              <Link href="/cadastro">
                <span>Começar minha jornada</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-2xl border-white/15 bg-white/[0.04] px-6 py-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/[0.1] sm:w-auto"
            >
              <a href="#como-funciona">
                <PlayCircle className="size-4 text-violet-300" />
                <span>Conhecer a plataforma</span>
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
