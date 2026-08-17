'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode
  children: React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
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

  const rotate = useTransform(scrollYProgress, [0, 1], isMobile ? [8, 0] : [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.9, 1] : [0.92, 1])
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center p-2 md:p-12 lg:p-20"
      style={{
        perspective: '1200px',
      }}
    >
      <div
        className="w-full relative"
        style={{
          perspective: '1200px',
        }}
      >
        <Header translateY={translateY} titleComponent={titleComponent} />
        <Card rotate={rotate} translateY={translateY} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  )
}

export const Header = ({
  translateY,
  titleComponent,
}: {
  translateY: any
  titleComponent: string | React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        translateY,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  )
}

export const Card = ({
  rotate,
  scale,
  translateY,
  children,
}: {
  rotate: any
  scale: any
  translateY: any
  children: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003, 0 0 80px rgba(147, 51, 234, 0.15)',
      }}
      className="max-w-6xl -mt-6 mx-auto h-auto w-full border border-white/10 p-2 sm:p-4 md:p-6 bg-[#0f0e17]/95 backdrop-blur-2xl rounded-[28px] sm:rounded-[36px] shadow-2xl relative ring-1 ring-white/10"
    >
      <div className="h-full w-full overflow-hidden rounded-[20px] sm:rounded-[28px] bg-black/40">
        {children}
      </div>
    </motion.div>
  )
}

export default ContainerScroll
