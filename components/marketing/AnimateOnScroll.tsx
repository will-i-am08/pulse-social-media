'use client'

import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'

type Variant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up'

const variants: Record<Variant, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-up': {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
}

interface Props {
  children: ReactNode
  variant?: Variant
  delay?: number
  duration?: number
  className?: string
  style?: React.CSSProperties
  once?: boolean
}

export default function AnimateOnScroll({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  className,
  style,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [inView, setInView] = useState(false)
  const v = variants[variant]

  useEffect(() => {
    setMounted(true)
    const el = ref.current
    if (!el) {
      setInView(true)
      return
    }

    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) {
      setInView(true)
      if (once) return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInView(false)
          }
        })
      },
      { rootMargin: '-80px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  // Before hydration (or if JS fails), render plain children so content is always visible
  if (!mounted) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={v}
      transition={{ duration, delay, ease: [0.25, 0.4, 0, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
