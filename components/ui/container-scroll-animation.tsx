'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode
  children: React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress across the entire dedicated height of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Smooth physics spring for silky real-time response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 35,
    restDelta: 0.001,
  })

  // 3D Perspective Rotation linked directly to scroll
  const rotateX = useTransform(smoothProgress, [0, 0.9], isMobile ? [12, 0] : [24, 0])
  const scale = useTransform(smoothProgress, [0, 0.9], isMobile ? [0.9, 1] : [0.84, 1])
  const translateY = useTransform(smoothProgress, [0, 0.9], isMobile ? [30, 0] : [60, 0])
  const cardOpacity = useTransform(smoothProgress, [0, 0.15, 0.9], [0.9, 1, 1])
  
  // Dynamic glow behind the card
  const glowOpacity = useTransform(smoothProgress, [0, 0.5, 0.9], [0.2, 0.6, 0.35])
  const glowScale = useTransform(smoothProgress, [0, 0.9], [0.8, 1.1])

  // Parallax on the title/header
  const titleY = useTransform(smoothProgress, [0, 0.8], [0, -35])
  const titleOpacity = useTransform(smoothProgress, [0, 0.7, 0.95], [1, 0.95, 0.85])

  return (
    <div
      ref={containerRef}
      className="relative h-[130vh] sm:h-[155vh] lg:h-[175vh] w-full"
      style={{
        perspective: '1200px',
      }}
    >
      {/* Sticky viewport frame that holds the animation in place while the user scrolls through the section height */}
      <div className="sticky top-16 sm:top-20 z-10 flex h-[calc(100vh-5rem)] flex-col items-center justify-start overflow-hidden px-3 sm:px-6 py-4">
        {/* Title Content with Scroll-linked Parallax */}
        <motion.div
          style={{
            y: titleY,
            opacity: titleOpacity,
          }}
          className="w-full max-w-5xl mx-auto text-center shrink-0 z-20"
        >
          {titleComponent}
        </motion.div>

        {/* 3D Rotating Product Showcase Card */}
        <div className="relative w-full max-w-6xl mx-auto mt-2 sm:mt-4">
          {/* Dynamic Reactive Purple Glow */}
          <motion.div
            style={{
              opacity: glowOpacity,
              scale: glowScale,
            }}
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-indigo-600/30 blur-3xl"
          />

          <motion.div
            style={{
              rotateX,
              scale,
              y: translateY,
              opacity: cardOpacity,
              transformStyle: 'preserve-3d',
              boxShadow:
                '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px -10px rgba(147, 51, 234, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
            className="w-full border border-white/10 p-2 sm:p-4 bg-[#0f0e17]/95 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] ring-1 ring-white/10"
          >
            <div className="w-full overflow-hidden rounded-[18px] sm:rounded-[24px] bg-black/40">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContainerScroll
