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
import { Download, Loader2, Share2 } from "lucide-react";

interface YelizSametMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YelizSametMenuDrawer({
  open,
  onOpenChange,
}: YelizSametMenuDrawerProps) {
  const router = useRouter();
  const { setForward } = useNavDirection();
  const [downloadingSalon, setDownloadingSalon] = useState(false);
  const [downloadingYat, setDownloadingYat] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleNavigate = (path: string) => {
    setForward();
    onOpenChange(false);
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  const handleDownloadZip = async (album: "salon" | "yat") => {
    if (album === "salon" && downloadingSalon) return;
    if (album === "yat" && downloadingYat) return;

    if (album === "salon") {
      setDownloadingSalon(true);
    } else {
      setDownloadingYat(true);
    }

    try {
      const response = await fetch(`/api/yeliz-samet/zip?album=${album}`);
      if (!response.ok) {
        throw new Error("İndirme hatası");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Yeliz-Samet-${album === "salon" ? "Salon" : "Yat"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP indirme hatası:", error);
      alert("İndirme sırasında bir hata oluştu.");
    } finally {
      if (album === "salon") {
        setDownloadingSalon(false);
      } else {
        setDownloadingYat(false);
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.origin + "/yeliz-samet";
    const shareData = {
      title: "Yeliz & Samet",
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Kullanıcı paylaşmayı iptal etti veya hata oluştu
        console.log("Paylaşım iptal edildi veya desteklenmiyor");
      }
    } else {
      // Web Share API desteklenmiyorsa clipboard'a kopyala
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (error) {
        console.error("Kopyalama hatası:", error);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-[100dvh] flex-col overflow-hidden bg-black/95 text-zinc-100 backdrop-blur-xl border-l border-white/10 rounded-l-2xl"
      >
        <SheetHeader className="shrink-0 px-6 pt-6 pb-4">
          <SheetTitle className="text-zinc-100">Menü</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 native-scroll scrollbar-none">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 px-4 text-[15px] font-medium justify-start"
              onClick={() => handleNavigate("/yeliz-samet")}
            >
              Anasayfa
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 px-4 text-[15px] font-medium justify-start"
              onClick={() => handleNavigate("/yeliz-samet/salon")}
            >
              Salon Fotoğrafları
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 px-4 text-[15px] font-medium justify-start"
              onClick={() => handleNavigate("/yeliz-samet/yat")}
            >
              Yat Fotoğrafları
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 px-4 text-[15px] font-medium justify-start"
              onClick={() => handleDownloadZip("salon")}
              disabled={downloadingSalon}
            >
              {downloadingSalon ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  İndiriliyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Salon ZIP indir
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 px-4 text-[15px] font-medium justify-start"
              onClick={() => handleDownloadZip("yat")}
              disabled={downloadingYat}
            >
              {downloadingYat ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  İndiriliyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Yat ZIP indir
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5 text-sm leading-6 text-zinc-200/90 whitespace-normal break-words">
              <p>7 Ocak 2026 · Akdeniz Belediyesi Nikah Dairesi</p>
              <p>Nikah sonrası: Mersin Marina</p>
              <p>Smile Organizasyon katkılarıyla</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)] border-t border-border bg-black/60 backdrop-blur">
          <Button
            variant="default"
            onClick={handleShare}
            className="h-11 w-full rounded-2xl gap-2"
          >
            <Share2 className="h-4 w-4" />
            {shareCopied ? "Link kopyalandı!" : "Albümü Paylaş"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
