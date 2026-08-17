'use client'

import React from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 35,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
    />
  )
}
