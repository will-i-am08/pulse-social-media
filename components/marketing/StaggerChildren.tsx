'use client'

import { useRef, useState, useEffect, type ReactNode, Children } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  children: ReactNode
  staggerDelay?: number
  className?: string
  once?: boolean
}

const containerVariants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
}

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const },
  },
}

export default function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const isInView = useInView(ref, { once, margin: '-60px' })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before hydration, render children visible (no opacity:0 flash)
  if (!mounted) {
    return (
      <div ref={ref} className={className}>
        {Children.map(children, (child) => (
          <div>{child}</div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      custom={staggerDelay}
      className={className}
    >
      {Children.map(children, (child) => (
        <motion.div variants={childVariants}>{child}</motion.div>
      ))}
    </motion.div>
  )
}
