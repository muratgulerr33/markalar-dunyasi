"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TapButton } from "@/components/ui/tap";
import { YelizSametPhotoViewer } from "@/components/yeliz-samet-photo-viewer";
import { softHaptic, mediumHaptic } from "@/lib/haptics";
import { Check, Trash2 } from "lucide-react";

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
  const [viewerIndex, setViewerIndex] = useState(0);
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloadingSelected, setDownloadingSelected] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());
  
  // External selectionMode prop'u varsa onu kullan, yoksa internal state'i kullan
  const selectionMode = externalSelectionMode !== undefined ? externalSelectionMode : internalSelectionMode;
  const selectionModeRef = useRef(selectionMode);

  // selectionMode değiştiğinde ref'i güncelle
  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  // Fetch deleted files for this album
  useEffect(() => {
    if (!albumSlug) return;

    const fetchDeleted = async () => {
      try {
        const response = await fetch(`/api/yeliz-samet/deleted?albumSlug=${albumSlug}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setDeletedFiles(new Set(data.deleted || []));
        }
      } catch (error) {
        console.error("Deleted files fetch error:", error);
      }
    };

    fetchDeleted();
  }, [albumSlug]);

  // Filter out deleted items
  const filteredItems = items.filter((item) => {
    const filename = item.split("/").pop() || item;
    return !deletedFiles.has(filename);
  });

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, items.length));
  };

  const openViewerAt = useCallback((index: number) => {
    if (selectionModeRef.current) return;
    softHaptic(); // Haptic feedback when opening viewer
    setViewerIndex(index);
    const item = filteredItems[index];
    // İlk açılışta router.push kullan (shareable URL, useSearchParams güncellenir)
    const newUrl = `${pathname}?photo=${encodeURIComponent(item)}`;
    router.push(newUrl, { scroll: false });
  }, [filteredItems, pathname, router]);

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
    setSelected(new Set(filteredItems));
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

  const deleteSelected = useCallback(async () => {
    if (selected.size === 0 || !albumSlug) return;
    
    mediumHaptic();
    const confirmed = window.confirm(`Seçilen ${selected.size} fotoğraf silinsin mi?`);
    if (!confirmed) return;

    setDeletingSelected(true);
    try {
      const selectedArray = Array.from(selected);
      const deletePromises = selectedArray.map(async (item) => {
        const filename = item.split("/").pop() || item;
        const response = await fetch("/api/yeliz-samet/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            albumSlug,
            filename,
          }),
        });
        if (!response.ok) {
          throw new Error(`Silme hatası: ${filename}`);
        }
        return filename;
      });

      const deletedFilenames = await Promise.all(deletePromises);
      
      // Optimistic update: silinen dosyaları deletedFiles'e ekle
      setDeletedFiles((prev) => {
        const next = new Set(prev);
        deletedFilenames.forEach((filename) => {
          next.add(filename);
        });
        return next;
      });

      // Seçimi temizle
      setSelected(new Set());
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme işlemi sırasında bir hata oluştu");
    } finally {
      setDeletingSelected(false);
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

  const closeViewer = useCallback(() => {
    // URL'den photo param'ını kaldır, diğer param'ları koru
    const params = new URLSearchParams(searchParams.toString());
    params.delete("photo");
    const preservedParams = params.toString();
    const newUrl = preservedParams 
      ? `${pathname}?${preservedParams}`
      : pathname;
    // Next.js App Router'da router.replace kullan ki useSearchParams() güncellensin
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  // URL'den viewer state'ini türet (photo param'ına %100 senkron)
  const photoParam = searchParams.get("photo");
  const viewerOpen = !!photoParam;
  
  // URL'den açılma (sayfa refresh / link paylaşımı için)
  useEffect(() => {
    if (!photoParam) {
      return;
    }
    const decoded = decodeURIComponent(photoParam);
    const idx = filteredItems.findIndex((x) => x === decoded);
    if (idx >= 0) {
      setViewerIndex(idx);
    }
  }, [photoParam, filteredItems]);

  // Handle item deletion from viewer
  const handleItemDeleted = useCallback((filename: string) => {
    const fileKey = filename.split("/").pop() || filename;
    setDeletedFiles((prev) => {
      const next = new Set(prev);
      next.add(fileKey);
      return next;
    });
  }, []);

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Bu albüm henüz yüklenmedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 native-scroll" style={{ touchAction: "pan-y" }}>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleItems.map((item, visibleIndex) => {
          const realIndex = filteredItems.indexOf(item);
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
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "300px 300px",
                contain: "layout paint style",
              }}
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
              <Image
                src={imagePath}
                alt={`Fotoğraf ${realIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                loading={visibleIndex < INITIAL_COUNT ? "eager" : "lazy"}
                priority={visibleIndex < 2}
              />
              {selectionMode && (
                <div className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/80 bg-black/60">
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
          <TapButton asChild>
            <Button variant="outline" onClick={handleLoadMore}>
              Daha fazla yükle ({filteredItems.length - visibleCount} kaldı)
            </Button>
          </TapButton>
        </div>
      )}

      {selectionMode && (
        <div className="sticky bottom-0 z-30 -mx-4 -mb-6 mt-6 bg-background/95 border-t px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <TapButton asChild>
              <Button variant="outline" onClick={handleSelectAll} size="sm">
                Tümünü seç
              </Button>
            </TapButton>
            <TapButton asChild>
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
            </TapButton>
            {albumSlug && (
              <TapButton asChild>
                <Button
                  variant="destructive"
                  onClick={deleteSelected}
                  disabled={selected.size === 0 || deletingSelected}
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingSelected
                    ? "Siliniyor..."
                    : `Sil (${selected.size})`}
                </Button>
              </TapButton>
            )}
            <TapButton asChild>
              <Button variant="outline" onClick={handleClearSelection} size="sm">
                Temizle
              </Button>
            </TapButton>
          </div>
        </div>
      )}

      <YelizSametPhotoViewer
        open={viewerOpen}
        onOpenChange={(o) => {
          if (!o) {
            closeViewer();
          }
        }}
        items={filteredItems}
        startIndex={viewerIndex}
        albumSlug={albumSlug}
        onItemDeleted={handleItemDeleted}
        onIndexChange={(idx) => {
          setViewerIndex(idx);
          const item = filteredItems[idx];
          // Foto geçişlerinde router.replace kullan (useSearchParams güncellenir, scroll:false ile jank yok)
          const newUrl = `${pathname}?photo=${encodeURIComponent(item)}`;
          router.replace(newUrl, { scroll: false });
        }}
      />
    </div>
  );
}

