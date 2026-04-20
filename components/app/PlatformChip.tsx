import type { FC } from 'react'

const LABEL_MAP: Record<string, { label: string; cls: string }> = {
  instagram: { label: 'IG', cls: 'ig' },
  facebook: { label: 'FB', cls: 'fb' },
  linkedin: { label: 'LI', cls: 'li' },
  tiktok: { label: 'TT', cls: 'tt' },
  twitter: { label: 'X', cls: 'tt' },
}

interface Props {
  platform: string
  className?: string
  title?: string
}

const PlatformChip: FC<Props> = ({ platform, className = '', title }) => {
  const meta = LABEL_MAP[platform] || { label: platform.slice(0, 2).toUpperCase(), cls: '' }
  return (
    <span className={`platform-chip ${meta.cls} ${className}`} title={title || platform}>
      {meta.label}
    </span>
  )
}

export default PlatformChip
