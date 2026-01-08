"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavDirection } from "@/components/yeliz-samet-nav-direction";

interface YelizSametAlbumDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YelizSametAlbumDrawer({
  open,
  onOpenChange,
}: YelizSametAlbumDrawerProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();
  const { setForward } = useNavDirection();

  const handleNavigate = (path: string) => {
    setForward();
    onOpenChange(false);
    // Drawer'ın kapanması için küçük bir gecikme
    setTimeout(() => {
      router.push(path);
    }, 100);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Albümler</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigate("/yeliz-samet/salon")}
            >
              Salon Fotolar
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigate("/yeliz-samet/yat")}
            >
              Yat Fotolar
            </Button>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={downloading === "salon"}
              onClick={() => {
                setDownloading("salon");
                onOpenChange(false);
                window.location.href = "/api/yeliz-samet/zip?album=salon";
              }}
            >
              Salon fotolarını toplu indir
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={downloading === "yat"}
              onClick={() => {
                setDownloading("yat");
                onOpenChange(false);
                window.location.href = "/api/yeliz-samet/zip?album=yat";
              }}
            >
              Yat fotolarını toplu indir
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

