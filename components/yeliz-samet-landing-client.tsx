"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { YelizSametTopbar } from "@/components/yeliz-samet-topbar";
import { YelizSametMenuDrawer } from "@/components/yeliz-samet-menu-drawer";
import { Button } from "@/components/ui/button";
import { TapButton } from "@/components/ui/tap";

const heroImages = [
  "/yeliz-samet/salon-foto/IMG-20260107-WA0182.webp",
  "/yeliz-samet/yat-foto/update-hero.webp",
  "/yeliz-samet/yat-foto/IMG_6614 kopya.webp",
  "/yeliz-samet/yat-foto/IMG_6594.webp",
  "/yeliz-samet/yat-foto/IMG_6637 kopya.webp",
];

export function YelizSametLandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Preload images on idle
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = document.createElement("img");
      img.src = src;
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const preloadNextImages = () => {
      const nextIndices = [
        (currentImageIndex + 1) % heroImages.length,
        (currentImageIndex + 2) % heroImages.length,
        (currentImageIndex + 3) % heroImages.length,
      ];
      
      nextIndices.forEach((idx) => {
        if (!loadedImages.has(idx)) {
          preloadImage(heroImages[idx]);
          setLoadedImages((prev) => new Set([...prev, idx]));
        }
      });
    };

    const schedulePreload = () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(preloadNextImages, { timeout: 2000 });
      } else {
        setTimeout(preloadNextImages, 100);
      }
    };

    schedulePreload();
  }, [currentImageIndex, loadedImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Preload first hero image
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroImages[0];
    link.type = "image/webp";
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <>
      <YelizSametTopbar onMenuClick={() => setMenuOpen(true)} />
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100svh-3.5rem-env(safe-area-inset-top))] overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] flex flex-col justify-end">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 hero-slide ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              willChange: "opacity",
            }}
          >
            <img
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
              src={src}
              alt="Yeliz & Samet"
              className={`absolute inset-0 h-full w-full ${index === 1 ? "object-contain" : "object-cover"} object-center`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              draggable={false}
              onLoad={() => {
                if (index === currentImageIndex) {
                  setLoadedImages((prev) => new Set([...prev, index]));
                }
              }}
            />
          </div>
        ))}
        {/* Fixed overlay - sabit katman (slide başına değil, flicker olmaması için) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/80 pointer-events-none" />
        
        {/* Hero Content - Alt bölgeye taşındı */}
        <div className="relative z-10 flex flex-col items-center justify-end px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] text-center">
          {/* Glass Panel */}
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 shadow-2xl p-6 md:p-8 space-y-4">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white tracking-tight drop-shadow-lg">
                Yeliz & Samet
              </h1>
              <p className="text-base md:text-lg text-zinc-200/90 mb-6 leading-relaxed">
                7 Ocak 2026 • Akdeniz Belediyesi Nikah Dairesi
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <TapButton asChild>
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                  >
                    <Link href="/yeliz-samet/salon">Salon Albümü</Link>
                  </Button>
                </TapButton>
                <TapButton asChild>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-sm"
                  >
                    <Link href="/yeliz-samet/yat">Yat Albümü</Link>
                  </Button>
                </TapButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hikaye / Günün Akışı Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-white">
            Günün Akışı
          </h2>
          <div className="space-y-6">
            {/* Timeline Card 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xl">💍</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Nikah</h3>
                  <p className="text-white/80">7 Ocak 2026</p>
                  <p className="text-white/70">Akdeniz Belediyesi Nikah Dairesi</p>
                </div>
              </div>
            </div>

            {/* Timeline Card 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xl">⛵</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Nikah Sonrası Yat Organizasyonu</h3>
                  <p className="text-white/80">Mersin Marina</p>
                </div>
              </div>
            </div>

            {/* Timeline Card 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Katkı</h3>
                  <p className="text-white/80">Smile Organizasyon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Albüm Kartları Section */}
      <section className="py-16 px-4 bg-black/20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-white">
            Albümler
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Salon Album Card */}
            <Link
              href="/yeliz-samet/salon"
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:border-white/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/yeliz-samet/salon-foto/IMG-20260107-WA0014.webp"
                  alt="Salon Albümü"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Salon Fotoğrafları</h3>
                <p className="text-white/70">
                  Nikah salonunda çekilen özel anlarımız
                </p>
              </div>
            </Link>

            {/* Yat Album Card */}
            <Link
              href="/yeliz-samet/yat"
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:border-white/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/yeliz-samet/yat-foto/IMG_6594.webp"
                  alt="Yat Albümü"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Yat Fotoğrafları</h3>
                <p className="text-white/70">
                  Mersin Marina&apos;da yat organizasyonu anıları
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-white/60 text-sm">
        <p>Yeliz & Samet • 7 Ocak 2026</p>
      </footer>

      <YelizSametMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
