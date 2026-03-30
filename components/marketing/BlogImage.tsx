import Image from 'next/image'

interface BlogImageProps {
  src?: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export default function BlogImage({ src, alt, className, fill, width, height }: BlogImageProps) {
  if (!src) {
    return (
      <div className={`bg-gradient-to-br from-primary/20 via-surface-container to-primary-container/30 relative ${className || ''}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-outline text-5xl">article</span>
        </div>
      </div>
    )
  }

  if (src.startsWith('data:')) {
    /* eslint-disable @next/next/no-img-element */
    return <img src={src} alt={alt} className={className} />
  }

  if (fill) {
    return <Image src={src} alt={alt} fill className={className} sizes="100vw" />
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      className={className}
      sizes="(max-width: 768px) 100vw, 800px"
    />
  )
}
