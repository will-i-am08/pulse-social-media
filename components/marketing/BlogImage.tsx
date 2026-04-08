/* eslint-disable @next/next/no-img-element */
// Plain <img> tag — blog featured images come from arbitrary user hosts
// (Supabase storage, Replicate, DALL-E, brand sites, etc.) and listing every
// possible hostname in next.config.mjs is impractical and was causing SSR
// crashes ("Invalid src prop on next/image, hostname not configured").

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

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${className || ''}`}
        loading="lazy"
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      className={className}
      loading="lazy"
    />
  )
}
