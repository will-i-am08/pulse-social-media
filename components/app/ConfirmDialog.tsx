'use client'

import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  description?: string
  okLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  title,
  description,
  okLabel = 'Delete',
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={onClose} maxWidth="400px">
      <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{description}</p>
      )}
      <div className="flex gap-3 justify-end">
        <button className="btn btn-o" onClick={onClose}>Cancel</button>
        <button
          className={danger ? 'btn btn-d' : 'btn btn-p'}
          onClick={() => { onConfirm(); onClose() }}
        >
          {okLabel}
        </button>
      </div>
    </Modal>
  )
}
