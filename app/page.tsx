"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import { categories } from "@/lib/categories"
import { ProductCard } from "@/components/product-card"

// Hero görselleri - hero.webp varsa başlangıç resmi olarak kullanılır
const heroImages = [
  "/hero.webp",
  "/hero2.webp",
  "/hero3.webp",
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const chipScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000) // 4 saniye

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (chipScrollRef.current) {
      chipScrollRef.current.scrollTo({ left: 0, behavior: "auto" })
    }
  }, [])
  
  const products = [
    {
      id: 1,
      name: "Gucci Kadın Çantası",
      description: "Premium deri, şık tasarım",
      price: "₺15.999",
      image: "/çanta.webp",
      slug: "gucci-kadin-cantasi",
    },
    {
      id: 2,
      name: "Deri Ceket",
      description: "Klasik ve şık tasarım, kaliteli işçilik",
      price: "₺3.999",
      image: "/ceket.webp",
      slug: "deri-ceket",
    },
    {
      id: 3,
      name: "Spor Ayakkabı",
      description: "Rahat ve dayanıklı, günlük kullanım",
      price: "₺899",
      image: "/spor.webp",
      slug: "spor-ayakkabi",
    },
    {
      id: 4,
      name: "Kadın Elbisesi",
      description: "Şık ve zarif, özel tasarım",
      price: "₺2.499",
      image: "/elbise.webp",
      slug: "kadin-elbisesi",
    },
    {
      id: 5,
      name: "Günlük Giyim Seti",
      description: "Rahat ve şık kombin",
      price: "₺1.799",
      image: "/günlük.webp",
      slug: "gunluk-giyim-seti",
    },
    {
      id: 6,
      name: "Kadın Kazak",
      description: "Yumuşak kumaş, kış koleksiyonu",
      price: "₺1.299",
      image: "/kazak.webp",
      slug: "kadin-kazak",
    },
    {
      id: 7,
      name: "Kadın Tunik",
      description: "Rahat kesim, günlük kullanım",
      price: "₺899",
      image: "/tunik.webp",
      slug: "kadin-tunik",
    },
    {
      id: 8,
      name: "Spor Tayt",
      description: "Esnek ve konforlu, fitness için ideal",
      price: "₺599",
      image: "/tayt.webp",
      slug: "spor-tayt",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 desktop:px-6 pt-8 pb-8 desktop:pt-8 desktop:pb-10">
        <div className="flex flex-col desktop:grid desktop:grid-cols-2 desktop:gap-10 gap-6">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6 order-2 desktop:order-1">
            <Badge variant="default" className="w-fit">
              Yeni Sezon
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight desktop:text-5xl desktop:text-6xl">
              Markalar Dünyası
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              En yeni koleksiyonlar ve özel fırsatlar sizleri bekliyor. 
              Kaliteli ürünler, uygun fiyatlar.
            </p>
            <div className="flex flex-col gap-4 desktop:flex-row">
              <Button size="lg" className="w-full h-11 desktop:w-auto">
                Keşfet
              </Button>
              <Button size="lg" variant="secondary" className="w-full h-11 desktop:w-auto">
                Koleksiyonlar
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <div className="flex items-center justify-center order-1 desktop:order-2">
            <div className="relative w-full aspect-[4/5] desktop:aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              {heroImages.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt="Markalar Dünyası - Yeni Sezon Koleksiyonları"
                  fill
                  className={`object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentHeroIndex ? "opacity-100" : "opacity-0 absolute"
                  }`}
                  priority={index === 0}
                  sizes="(max-width: 1124px) 100vw, 50vw"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Input */}
      <section className="mx-auto max-w-6xl px-4 desktop:px-6 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="site-search"
            type="search"
            placeholder="Ürün ara..."
            className="pl-10 h-11"
          />
        </div>
      </section>

      {/* Categories Slider */}
      <section className="mx-auto max-w-6xl px-4 desktop:px-6 py-4 desktop:py-6">
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable chip container */}
          <div 
            ref={chipScrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory scroll-px-4 desktop:scroll-px-6 pl-4 desktop:pl-6 pr-4 desktop:pr-6 [-webkit-overflow-scrolling:touch]"
          >
            <div className="flex gap-3 min-w-max pb-2">
              {categories.map((category) => {
                const isActive = activeCategory === category.slug
                return (
                  <Link
                    key={category.slug}
                    href={`/kategori/${category.slug}`}
                    onClick={() => setActiveCategory(category.slug)}
                    className="snap-start shrink-0"
                  >
                    <Badge 
                      variant={isActive ? "default" : "outline"}
                      className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 px-4 py-2.5 text-sm font-medium h-11 flex items-center justify-center ${
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {category.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-6xl px-4 desktop:px-6 py-10">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 min-[1124px]:!grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.name}
              subtitle={product.description}
              price={product.price}
              imageSrc={product.image}
              href={`/urun/${product.slug}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
