"use client";

import { useState, useRef, Suspense } from "react";
import { YelizSametTopbar } from "@/components/yeliz-samet-topbar";
import { YelizSametAlbumGrid } from "@/components/yeliz-samet-album-grid";
import { YelizSametMenuDrawer } from "@/components/yeliz-samet-menu-drawer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface YelizSametYatClientProps {
  items: string[];
}

export function YelizSametYatClient({ items }: YelizSametYatClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const downloadRef = useRef<(() => void) | null>(null);

  return (
    <>
      <YelizSametTopbar
        showBackButton
        onMenuClick={() => setMenuOpen(true)}
        rightContent={
          <>
            {selectionMode && selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadRef.current?.()}
              >
                <Download className="h-4 w-4 mr-1" />
                İndir ({selectedCount})
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectionMode(!selectionMode)}
            >
              {selectionMode ? "Bitti" : "Seç"}
            </Button>
          </>
        }
      />
      <div className="min-h-dvh px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>}>
            <YelizSametAlbumGrid
              items={items}
              albumSlug="yat"
              selectionMode={selectionMode}
              onSelectionModeChange={setSelectionMode}
              onSelectedCountChange={setSelectedCount}
              downloadRef={downloadRef}
            />
          </Suspense>
        </div>
      </div>
      <YelizSametMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

