'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface ProgressiveImageProps {
  src: string
  thumbSrc?: string
  previewSrc?: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  quality?: 'thumb' | 'preview' | 'full'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Progressive Image Component
 *
 * Loads images progressively:
 * 1. Shows blurred thumbnail immediately (if available)
 * 2. Loads preview/full image
 * 3. Crossfades to sharp image when loaded
 *
 * Optimized for Nigerian networks - starts with smallest image.
 */
export function ProgressiveImage({
  src,
  thumbSrc,
  previewSrc,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes = '100vw',
  priority = false,
  quality = 'full',
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  // Determine which source to use based on quality preference
  useEffect(() => {
    let targetSrc = src

    switch (quality) {
      case 'thumb':
        targetSrc = thumbSrc || previewSrc || src
        break
      case 'preview':
        targetSrc = previewSrc || src
        break
      case 'full':
      default:
        targetSrc = src
        break
    }

    setCurrentSrc(targetSrc)
    setIsLoading(true)
    setHasError(false)
  }, [src, thumbSrc, previewSrc, quality])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)

    // Try fallback sources
    if (currentSrc === src && previewSrc) {
      setCurrentSrc(previewSrc)
      setIsLoading(true)
      setHasError(false)
    } else if (currentSrc === previewSrc && thumbSrc) {
      setCurrentSrc(thumbSrc)
      setIsLoading(true)
      setHasError(false)
    } else {
      onError?.()
    }
  }

  if (!currentSrc) {
    return null
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Thumbnail as placeholder (blur effect) */}
      {thumbSrc && isLoading && currentSrc !== thumbSrc && (
        <Image
          src={thumbSrc}
          alt=""
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className="object-cover blur-sm scale-105 transition-opacity duration-300"
          sizes={sizes}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {!hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={`object-cover transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Loading spinner */}
      {isLoading && !thumbSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Lazy loading wrapper for ProgressiveImage
 * Only loads when element enters viewport
 */
export function LazyProgressiveImage(props: ProgressiveImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0,
      }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref])

  return (
    <div ref={setRef} className={props.className}>
      {isVisible ? (
        <ProgressiveImage {...props} />
      ) : (
        // Placeholder while not visible
        <div className="w-full h-full bg-muted animate-pulse" />
      )}
    </div>
  )
}

export default ProgressiveImage
