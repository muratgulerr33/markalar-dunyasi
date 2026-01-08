"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

interface ProductGalleryProps {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxIsDragging, setLightboxIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const lightboxTouchStartX = useRef<number | null>(null)
  const lightboxTouchEndX = useRef<number | null>(null)
  const lightboxPointerStartX = useRef<number | null>(null)
  const lightboxPointerCurrentX = useRef<number | null>(null)
  const lightboxTrackRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 40

  // Lightbox açıldığında seçili index'i senkronize et
  const handleLightboxOpenChange = (open: boolean) => {
    setLightboxOpen(open)
    if (open) {
      setLightboxIndex(selectedIndex)
    }
  }

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

  if (images.length === 0) {
    return null
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
    if (isRightSwipe && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  // Lightbox için gelişmiş pointer event handlers (drag ile smooth geçiş)
  const onLightboxPointerDown = (e: React.PointerEvent) => {
    if (images.length <= 1) return
    setLightboxIsDragging(true)
    lightboxPointerStartX.current = e.clientX
    lightboxPointerCurrentX.current = e.clientX
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const onLightboxPointerMove = (e: React.PointerEvent) => {
    if (!lightboxIsDragging || !lightboxPointerStartX.current) return
    lightboxPointerCurrentX.current = e.clientX
    const deltaX = lightboxPointerStartX.current - e.clientX
    // Drag sırasında görsel offset'i hesapla (max sınırlar içinde)
    const maxOffset = lightboxTrackRef.current?.clientWidth || 0
    const constrainedDelta = Math.max(-maxOffset * 0.3, Math.min(maxOffset * 0.3, deltaX))
    setDragOffset(constrainedDelta)
  }

  const onLightboxPointerUp = () => {
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
  }

  const onLightboxPointerCancel = () => {
    setLightboxIsDragging(false)
    lightboxPointerStartX.current = null
    lightboxPointerCurrentX.current = null
    setDragOffset(0)
  }

  const goToNext = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleThumbnailClick = (index: number) => {
    setLightboxIndex(index)
    setSelectedIndex(index)
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

  return (
    <>
      <div className="space-y-4">
        {/* Main Image - Track Yapısı */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/30">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl overflow-hidden"
            aria-label="Görseli tam ekranda aç"
          >
            <div
              className="relative w-full h-full flex transition-transform duration-300 ease-out will-change-transform"
              style={{
                transform: `translateX(-${selectedIndex * 100}%)`
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-full shrink-0"
                >
                  <Image
                    src={image}
                    alt={`${title} - Görsel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1124px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </button>
          {/* Swipe overlay for mobile */}
          {images.length > 1 && (
            <div
              className="absolute inset-0 touch-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          )}
        </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-shrink-0 aspect-[4/5] w-20 rounded-xl overflow-hidden bg-muted/30 transition-all min-h-[44px] min-w-[44px]",
                "ring-1 ring-border/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedIndex === index && "ring-2 ring-primary"
              )}
              aria-label={`Görsel ${index + 1}'i seç`}
            >
              <Image
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Pagination Dots (Mobile) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 desktop:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -m-2",
                selectedIndex === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Sayfa ${index + 1}`}
            >
              <span className="sr-only">Sayfa {index + 1}</span>
            </button>
          ))}
        </div>
      )}
      </div>

      {/* Fullscreen Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={handleLightboxOpenChange}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 rounded-none border-0 bg-black/95 left-0 top-0 translate-x-0 translate-y-0">
          <VisuallyHidden.Root>
            <DialogTitle>Ürün görsel galerisi</DialogTitle>
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
                className="relative w-full h-full flex will-change-transform"
                style={{
                  transform: `translateX(calc(-${lightboxIndex * 100}% + ${dragOffset}px))`,
                  transition: lightboxIsDragging ? 'none' : 'transform 300ms ease-out'
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full h-full shrink-0 flex items-center justify-center p-4"
                  >
                    <Image
                      src={image}
                      alt={`${title} - Görsel ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={index === lightboxIndex}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnail Strip + Dots */}
            {images.length > 1 && (
              <div className="w-full px-4 pb-4 pt-2 bg-black/50">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-6xl mx-auto mb-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
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
                        alt={`${title} - Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
                {/* Dots Progress */}
                <div className="flex justify-center gap-2 max-w-6xl mx-auto">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        "h-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -m-2",
                        lightboxIndex === index ? "w-8 bg-primary" : "w-2 bg-white/30"
                      )}
                      aria-label={`Sayfa ${index + 1}`}
                    >
                      <span className="sr-only">Sayfa {index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

