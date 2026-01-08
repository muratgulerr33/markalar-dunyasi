"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { X, MoreVertical, Share2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface YelizSametPhotoViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: string[];
  startIndex: number;
  albumSlug?: "salon" | "yat";
  onIndexChange?: (index: number) => void;
}

const LONG_PRESS_DURATION = 450;
const MOVE_THRESHOLD = 10;

export function YelizSametPhotoViewer({
  open,
  onOpenChange,
  items,
  startIndex,
  albumSlug,
  onIndexChange,
}: YelizSametPhotoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    dragFree: false,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  // Embla API ile index senkronizasyonu
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setSelectedIndex(newIndex);
      onIndexChange?.(newIndex);
    };

    const onReInit = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setSelectedIndex(newIndex);
      onIndexChange?.(newIndex);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi, onIndexChange]);

  // startIndex değiştiğinde embla'yı güncelle
  useEffect(() => {
    if (!open) return;
    if (!emblaApi) return;
    emblaApi.scrollTo(startIndex, true);
    setSelectedIndex(startIndex);
  }, [open, emblaApi, startIndex]);

  // Komşu fotoğrafları preload et
  useEffect(() => {
    if (!open) return;

    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
    };

    const currentIndex = selectedIndex;
    if (currentIndex > 0) {
      preloadImage(`/yeliz-samet/${items[currentIndex - 1]}`);
    }
    if (currentIndex < items.length - 1) {
      preloadImage(`/yeliz-samet/${items[currentIndex + 1]}`);
    }
  }, [open, selectedIndex, items]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowLeft" && emblaApi) {
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight" && emblaApi) {
        emblaApi.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange, emblaApi]);

  // Long-press handler
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      longPressStartRef.current = { x: e.clientX, y: e.clientY };
      longPressTimerRef.current = setTimeout(() => {
        // Long-press tetiklendi, menüyü aç
        if (menuTriggerRef.current) {
          menuTriggerRef.current.click();
        }
        longPressTimerRef.current = null;
      }, LONG_PRESS_DURATION);
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
  }, []);

  const handlePointerCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!longPressStartRef.current || !longPressTimerRef.current) return;

    const dx = Math.abs(e.clientX - longPressStartRef.current.x);
    const dy = Math.abs(e.clientY - longPressStartRef.current.y);

    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      // Kullanıcı hareket etti, long-press iptal
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      longPressStartRef.current = null;
    }
  }, []);

  // Paylaş fonksiyonu
  const handleShare = useCallback(async () => {
    const currentUrl = window.location.href;
    const imageUrl = `${window.location.origin}/yeliz-samet/${items[selectedIndex]}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Yeliz & Samet",
          text: "Fotoğrafı paylaş",
          url: imageUrl,
        });
      } catch (err) {
        // Kullanıcı paylaşımı iptal etti veya hata oluştu
        console.log("Paylaşım iptal edildi");
      }
    } else {
      // Fallback: clipboard'a kopyala
      try {
        await navigator.clipboard.writeText(imageUrl);
        alert("Fotoğraf linki kopyalandı!");
      } catch (err) {
        console.error("Kopyalama hatası:", err);
      }
    }
  }, [items, selectedIndex]);

  // İndir fonksiyonu
  const handleDownload = useCallback(() => {
    const imageUrl = `/yeliz-samet/${items[selectedIndex]}`;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = items[selectedIndex].split("/").pop() || "foto.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [items, selectedIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/95" />
      <DialogContent
        className="fixed inset-0 left-0 top-0 z-50 h-dvh w-screen max-w-none translate-x-0 translate-y-0 border-0 bg-black/95 p-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Fotoğraf görüntüleyici</DialogTitle>
        <div className="relative h-dvh w-screen">
          {/* Üst bar */}
          <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-3 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="text-xs text-white/80">
              {selectedIndex + 1} / {items.length}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={menuTriggerRef}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Paylaş
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  İndir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Embla viewport */}
          <div
            className="h-full w-full overflow-hidden"
            ref={emblaRef}
            style={{ touchAction: "pan-y pinch-zoom" }}
          >
            <div
              className="flex h-full"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerMove={handlePointerMove}
            >
              {items.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="relative flex h-full flex-[0_0_100%] items-center justify-center px-4 pb-6 pt-14"
                >
                  <img
                    src={`/yeliz-samet/${item}`}
                    alt=""
                    className="max-h-[88dvh] max-w-[92vw] object-contain select-none"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alt progress bar */}
          <div className="absolute bottom-4 left-4 right-4 h-1 rounded bg-white/20">
            <div
              className="h-1 rounded bg-white/70"
              style={{
                width: `${items.length ? ((selectedIndex + 1) / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

