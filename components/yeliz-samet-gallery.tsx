"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

interface YelizSametGalleryProps {
  images: string[]
}

const BATCH_SIZE = 40
const INITIAL_BATCH = 40

export function YelizSametGallery({ images }: YelizSametGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxIsDragging, setLightboxIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const lightboxTouchStartX = useRef<number | null>(null)
  const lightboxTouchEndX = useRef<number | null>(null)
  const lightboxPointerStartX = useRef<number | null>(null)
  const lightboxPointerCurrentX = useRef<number | null>(null)
  const lightboxTrackRef = useRef<HTMLDivElement>(null)

  // Derive visibleImages from visibleCount using useMemo
  const visibleImages = useMemo(() => {
    return images.slice(0, visibleCount)
  }, [images, visibleCount])

  // Intersection Observer ile lazy loading
  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= images.length) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, images.length))
        }
      },
      { rootMargin: "200px" }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [visibleCount, images.length])

  const minSwipeDistance = 40

  // ESC tuşu ile lightbox'ı kapat ve ok tuşları ile navigasyon
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      
      if (e.key === "Escape") {
        setLightboxOpen(false)
      } else if (e.key === "ArrowRight" && images.length > 1) {
        e.preventDefault()
        setLightboxIndex((prev) => (prev + 1) % images.length)
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        e.preventDefault()
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, images.length])

  // Lightbox için pointer event handlers (drag ile smooth geçiş)
  const onLightboxPointerDown = useCallback((e: React.PointerEvent) => {
    if (images.length <= 1) return
    setLightboxIsDragging(true)
    lightboxPointerStartX.current = e.clientX
    lightboxPointerCurrentX.current = e.clientX
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }, [images.length])

  const onLightboxPointerMove = useCallback((e: React.PointerEvent) => {
    if (!lightboxIsDragging || !lightboxPointerStartX.current) return
    lightboxPointerCurrentX.current = e.clientX
    const deltaX = lightboxPointerStartX.current - e.clientX
    const maxOffset = lightboxTrackRef.current?.clientWidth || 0
    const constrainedDelta = Math.max(-maxOffset * 0.3, Math.min(maxOffset * 0.3, deltaX))
    setDragOffset(constrainedDelta)
  }, [lightboxIsDragging])

  const onLightboxPointerUp = useCallback(() => {
    if (!lightboxIsDragging || !lightboxPointerStartX.current || !lightboxPointerCurrentX.current) {
      setLightboxIsDragging(false)
      setDragOffset(0)
      return
    }
    
    const deltaX = lightboxPointerStartX.current - lightboxPointerCurrentX.current
    const threshold = 50
    
    if (deltaX > threshold && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    } else if (deltaX < -threshold && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
    
    setLightboxIsDragging(false)
    lightboxPointerStartX.current = null
    lightboxPointerCurrentX.current = null
    setDragOffset(0)
  }, [lightboxIsDragging, lightboxIndex, images.length])

  const onLightboxPointerCancel = useCallback(() => {
    setLightboxIsDragging(false)
    lightboxPointerStartX.current = null
    lightboxPointerCurrentX.current = null
    setDragOffset(0)
  }, [])

  const goToNext = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleThumbnailClick = (index: number) => {
    setLightboxIndex(index)
  }

  // Lightbox için touch handlers
  const onLightboxTouchStart = (e: React.TouchEvent) => {
    lightboxTouchEndX.current = null
    lightboxTouchStartX.current = e.targetTouches[0].clientX
  }

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    lightboxTouchEndX.current = e.targetTouches[0].clientX
  }

  const onLightboxTouchEnd = () => {
    if (!lightboxTouchStartX.current || !lightboxTouchEndX.current) return
    const distance = lightboxTouchStartX.current - lightboxTouchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
    if (isRightSwipe && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  const handleImageClick = (image: string) => {
    // Görselin tüm görseller listesindeki index'ini bul
    const globalIndex = images.indexOf(image)
    if (globalIndex !== -1) {
      setLightboxIndex(globalIndex)
      setLightboxOpen(true)
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Henüz görsel bulunmuyor.</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 native-scroll" style={{ touchAction: "pan-y" }}>
        {visibleImages.map((image, index) => {
          const globalIndex = images.indexOf(image)
          const isPriority = index < 2 // İlk 2 görsel için priority
          
          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => handleImageClick(image)}
              className={cn(
                "relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/30",
                "transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "group"
              )}
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "300px 375px",
                contain: "layout paint style",
              }}
              aria-label={`Görsel ${globalIndex + 1}'i aç`}
            >
              <Image
                src={image}
                alt={`Görsel ${globalIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading={isPriority ? "eager" : "lazy"}
                priority={isPriority}
              />
            </button>
          )
        })}
      </div>

      {/* Load More Trigger */}
      {visibleImages.length < images.length && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {images.length - visibleImages.length} görsel daha yükleniyor...
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 rounded-none border-0 bg-black/95 left-0 top-0 translate-x-0 translate-y-0">
          <VisuallyHidden.Root>
            <DialogTitle>Yeliz & Samet Galeri</DialogTitle>
          </VisuallyHidden.Root>
          <div className="relative w-full h-full flex flex-col">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxOpen(false)}
                className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Image Area with Swipe - Track Yapısı */}
            <div
              className="flex-1 relative overflow-hidden min-h-0"
              style={{ touchAction: "pan-x pan-y pinch-zoom" }}
              onPointerDown={onLightboxPointerDown}
              onPointerMove={onLightboxPointerMove}
              onPointerUp={onLightboxPointerUp}
              onPointerCancel={onLightboxPointerCancel}
              onTouchStart={onLightboxTouchStart}
              onTouchMove={onLightboxTouchMove}
              onTouchEnd={onLightboxTouchEnd}
            >
              {/* Desktop Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hidden desktop:flex z-10"
                    aria-label="Önceki görsel"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hidden desktop:flex z-10"
                    aria-label="Sonraki görsel"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Track Container */}
              <div
                ref={lightboxTrackRef}
                className="relative w-full h-full flex"
                style={{
                  willChange: "transform",
                  transform: `translate3d(calc(-${lightboxIndex * 100}% + ${dragOffset}px), 0, 0)`,
                  transition: lightboxIsDragging ? 'none' : 'transform 300ms ease-out'
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={image}
                    className="relative w-full h-full shrink-0 flex items-center justify-center p-4"
                  >
                    <Image
                      src={image}
                      alt={`Görsel ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={index === lightboxIndex}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnail Strip + Progress */}
            {images.length > 1 && (
              <div className="w-full px-4 pb-4 pt-2 bg-black/50">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-6xl mx-auto mb-3 native-scroll" style={{ touchAction: "pan-x" }}>
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        "relative flex-shrink-0 aspect-[4/5] w-20 rounded-xl overflow-hidden bg-muted/30 transition-all min-h-[44px] min-w-[44px]",
                        "ring-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        lightboxIndex === index
                          ? "ring-primary ring-2"
                          : "ring-transparent"
                      )}
                      aria-label={`Görsel ${index + 1}'i seç`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 max-w-6xl mx-auto">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        "h-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -m-2 progress-bar-fill",
                        lightboxIndex === index ? "w-8 bg-primary" : "w-2 bg-white/30"
                      )}
                      style={{
                        transition: "width 300ms ease-out, background-color 300ms ease-out",
                      }}
                      aria-label={`Sayfa ${index + 1}`}
                    >
                      <span className="sr-only">Sayfa {index + 1}</span>
                    </button>
                  ))}
                </div>
                {/* Progress Text */}
                <div className="text-center text-white/70 text-sm mt-2">
                  {lightboxIndex + 1} / {images.length}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

