"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { YelizSametPhotoViewer } from "@/components/yeliz-samet-photo-viewer";
import { Check, Circle } from "lucide-react";

interface YelizSametAlbumGridProps {
  items: string[];
  albumSlug?: "salon" | "yat";
  onSelectionModeChange?: (mode: boolean) => void;
  selectionMode?: boolean;
  onSelectedCountChange?: (count: number) => void;
  downloadRef?: React.MutableRefObject<(() => void) | null>;
}

const INITIAL_COUNT = 48;
const LOAD_MORE_COUNT = 48;

export function YelizSametAlbumGrid({
  items,
  albumSlug,
  onSelectionModeChange,
  selectionMode: externalSelectionMode,
  onSelectedCountChange,
  downloadRef,
}: YelizSametAlbumGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloadingSelected, setDownloadingSelected] = useState(false);
  
  // External selectionMode prop'u varsa onu kullan, yoksa internal state'i kullan
  const selectionMode = externalSelectionMode !== undefined ? externalSelectionMode : internalSelectionMode;
  const selectionModeRef = useRef(selectionMode);

  // selectionMode değiştiğinde ref'i güncelle
  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, items.length));
  };

  const openViewerAt = useCallback((index: number) => {
    if (selectionModeRef.current) return;
    setViewerIndex(index);
    setViewerOpen(true);
    const item = items[index];
    router.push(`${pathname}?photo=${encodeURIComponent(item)}`, { scroll: false });
  }, [items, pathname, router]);

  const toggleSelection = (item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(items));
  };

  const handleClearSelection = () => {
    setSelected(new Set());
  };

  const downloadSelected = useCallback(async () => {
    if (selected.size === 0) return;
    setDownloadingSelected(true);
    try {
      const response = await fetch("/api/yeliz-samet/zip-selected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          album: albumSlug,
          files: Array.from(selected),
        }),
      });

      if (!response.ok) {
        throw new Error("İndirme hatası");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yeliz-samet-${albumSlug}-secili.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("İndirme hatası:", error);
      alert("İndirme sırasında bir hata oluştu");
    } finally {
      setDownloadingSelected(false);
    }
  }, [selected, albumSlug]);

  // Selected count'u parent'a bildir
  useEffect(() => {
    onSelectedCountChange?.(selected.size);
  }, [selected.size, onSelectedCountChange]);

  // Download ref'i parent'a expose et
  useEffect(() => {
    if (downloadRef) {
      downloadRef.current = downloadSelected;
    }
    return () => {
      if (downloadRef) {
        downloadRef.current = null;
      }
    };
  }, [downloadRef, downloadSelected]);

  const handleSelectionModeToggle = () => {
    const newMode = !selectionMode;
    if (externalSelectionMode === undefined) {
      setInternalSelectionMode(newMode);
    }
    onSelectionModeChange?.(newMode);
    if (!newMode) {
      setSelected(new Set());
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    router.replace(pathname, { scroll: false });
  };

  // URL'den açılma (sayfa refresh / link paylaşımı için)
  useEffect(() => {
    const p = searchParams.get("photo");
    if (!p) return;
    const decoded = decodeURIComponent(p);
    const idx = items.findIndex((x) => x === decoded);
    if (idx >= 0) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  }, [searchParams, items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Bu albüm henüz yüklenmedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleItems.map((item, visibleIndex) => {
          const realIndex = items.indexOf(item);
          const imagePath = `/yeliz-samet/${item}`;
          const isSelected = selected.has(item);
          return (
            <div
              key={`${item}-${realIndex}`}
              className={`relative aspect-square w-full overflow-hidden rounded-xl bg-muted/30 cursor-pointer transition-all ${
                selectionMode
                  ? isSelected
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:opacity-90"
                  : ""
              }`}
              onClick={(e) => {
                if (selectionModeRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelection(item);
                } else {
                  openViewerAt(realIndex);
                }
              }}
            >
              <img
                src={imagePath}
                alt={`Fotoğraf ${realIndex + 1}`}
                className="h-full w-full object-cover"
                loading={visibleIndex < INITIAL_COUNT ? "eager" : "lazy"}
                decoding="async"
              />
              {selectionMode && (
                <div className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/80 bg-black/50 backdrop-blur-sm">
                  {isSelected ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-white/30" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && !selectionMode && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={handleLoadMore}>
            Daha fazla yükle ({items.length - visibleCount} kaldı)
          </Button>
        </div>
      )}

      {selectionMode && (
        <div className="sticky bottom-0 z-30 -mx-4 -mb-6 mt-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={handleSelectAll} size="sm">
              Tümünü seç
            </Button>
            <Button
              variant="default"
              onClick={downloadSelected}
              disabled={selected.size === 0 || downloadingSelected}
              size="sm"
            >
              {downloadingSelected
                ? "İndiriliyor..."
                : `Seçilenleri indir (${selected.size})`}
            </Button>
            <Button variant="outline" onClick={handleClearSelection} size="sm">
              Temizle
            </Button>
          </div>
        </div>
      )}

      <YelizSametPhotoViewer
        open={viewerOpen}
        onOpenChange={(o) => (o ? setViewerOpen(true) : closeViewer())}
        items={items}
        startIndex={viewerIndex}
        albumSlug={albumSlug}
        onIndexChange={(idx) => {
          setViewerIndex(idx);
          const item = items[idx];
          router.replace(`${pathname}?photo=${encodeURIComponent(item)}`, { scroll: false });
        }}
      />
    </div>
  );
}

