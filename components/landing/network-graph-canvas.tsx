'use client'

import React, { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  label?: string
}

export function NetworkGraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }

    window.addEventListener('resize', handleResize)

    const techLabels = ['JS', 'React', 'Node', 'Python', 'SQL', 'TypeScript', 'Git', 'Next.js', 'AI', 'Algorithms']
    const colors = ['#8B5CF6', '#A855F7', '#C084FC', '#6366F1', '#38BDF8', '#10B981']

    const nodeCount = Math.min(28, Math.floor(width / 45))
    const nodes: Node[] = []

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        label: i < techLabels.length ? techLabels[i] : undefined,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Connect nodes within threshold distance
      const maxDistance = 140
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Draw nodes and subtle labels
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        // Bounce from boundaries
        if (node.x <= 0 || node.x >= width) node.vx *= -1
        if (node.y <= 0 || node.y >= height) node.vy *= -1

        // Glow circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(139, 92, 246, 0.08)'
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.shadowColor = node.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0

        // Tech tag for select nodes
        if (node.label) {
          ctx.font = '9px monospace'
          ctx.fillStyle = 'rgba(216, 180, 254, 0.55)'
          ctx.fillText(node.label, node.x + 6, node.y - 4)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 size-full opacity-60 mix-blend-screen"
    />
  )
}
