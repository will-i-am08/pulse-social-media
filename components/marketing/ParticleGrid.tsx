'use client'

import { useEffect, useRef } from 'react'

export default function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let mouseX = -9999
    let mouseY = -9999
    let scrollY = 0
    let gridPageHeight = 0

    const SPACING = 16
    const DOT_RADIUS = 1.0
    const MOUSE_RADIUS = 130
    const REPEL = 40
    const LERP = 0.06

    interface Particle {
      ox: number; oy: number
      x: number;  y: number
    }

    let particles: Particle[] = []

    function buildGrid() {
      particles = []
      gridPageHeight = document.documentElement.scrollHeight
      const cols = Math.ceil(canvas.width  / SPACING) + 1
      const rows = Math.ceil(gridPageHeight / SPACING) + 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * SPACING
          const oy = r * SPACING
          particles.push({ ox, oy, x: ox, y: oy })
        }
      }
    }

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      buildGrid()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Mouse in page space (add scrollY to convert from viewport to page coords)
      const mousePageY = mouseY + scrollY

      for (const p of particles) {
        // Particle screen Y = page Y - scrollY
        const screenY = p.y - scrollY

        // Skip particles outside visible area (with buffer)
        if (screenY < -SPACING * 2 || screenY > canvas.height + SPACING * 2) continue

        // Distance in page space
        const dx = p.ox - mouseX
        const dy = p.oy - mousePageY
        const dist = Math.sqrt(dx * dx + dy * dy)

        let targetX = p.ox
        let targetY = p.oy

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * REPEL
          targetX = p.ox + (dx / dist) * force
          targetY = p.oy + (dy / dist) * force
        }

        // Lerp smoothly toward target
        p.x += (targetX - p.x) * LERP
        p.y += (targetY - p.y) * LERP

        const closeness = dist < MOUSE_RADIUS ? 1 - dist / MOUSE_RADIUS : 0

        ctx.beginPath()
        // Draw at screen position (subtract scrollY for Y)
        ctx.arc(p.x, p.y - scrollY, DOT_RADIUS + closeness * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = closeness > 0
          ? `rgba(255,84,115,${0.25 + closeness * 0.65})`
          : 'rgba(0,0,0,0.28)'
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function onMouseLeave() {
      mouseX = -9999
      mouseY = -9999
    }

    function onScroll() {
      scrollY = window.scrollY
      // Rebuild grid if page has grown (e.g. dynamic content loaded)
      const pageHeight = document.documentElement.scrollHeight
      if (pageHeight > gridPageHeight + SPACING * 4) {
        buildGrid()
      }
    }

    resize()
    animate()
    scrollY = window.scrollY

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
