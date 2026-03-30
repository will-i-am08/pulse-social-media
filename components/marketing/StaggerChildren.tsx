'use client'

import { useRef, type ReactNode, Children } from 'react'
import { motion } from 'framer-motion'

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

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
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
