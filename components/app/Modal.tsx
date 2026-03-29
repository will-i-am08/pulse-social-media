'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

export default function Modal({ onClose, children, maxWidth = '560px' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className="modal-box"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  )
}
