"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { formatTRY } from "@/lib/format"
import { Product, ProductColor, ProductSize } from "@/lib/products"
import { useCartStore } from "@/lib/store/cart-store"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({
  product,
}: ProductDetailProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    // Set first available color and size as default
    if (product && !selectedColor && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
    if (product && !selectedSize && product.sizes.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.available)
      if (firstAvailable) {
        setSelectedSize(firstAvailable)
      }
    }
  }, [product, selectedColor, selectedSize])

  const canAddToCart = selectedColor !== null && selectedSize !== null

  const handleAddToCart = () => {
    if (!canAddToCart || !product) return

    const variant = `${selectedColor?.name} / ${selectedSize?.label}`
    addItem({
      title: product.title,
      price: product.price,
      imageSrc: product.images[0],
      variant,
      qty: 1,
    })

    // Open drawer to show success
    setDrawerOpen(true)
  }

  const getButtonLabel = () => {
    if (!canAddToCart) {
      return "Renk ve beden seç"
    }
    return "Sepete Ekle"
  }

  return (
    <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      {/* Badge + Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {product.badge && (
            <Badge variant="default" className="text-xs">
              {product.badge}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl desktop:text-3xl font-semibold tracking-tight">
          {product.title}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {formatTRY(product.price)}
        </span>
      </div>

      <Separator />

      {/* Color Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Renk: {selectedColor ? selectedColor.name : "Seçiniz"}
        </label>
        <div className="flex gap-3 flex-wrap">
          {product.colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "h-11 w-11 rounded-full ring-1 ring-border/60 transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedColor?.name === color.name && "ring-2 ring-primary"
              )}
              style={{ backgroundColor: color.valueHex }}
              aria-label={`Renk: ${color.name}`}
              aria-pressed={selectedColor?.name === color.name}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Beden: {selectedSize ? selectedSize.label : "Seçiniz"}
        </label>
        <div className="flex gap-3 flex-wrap">
          {product.sizes.map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => size.available && setSelectedSize(size)}
              disabled={!size.available}
              className={cn(
                "min-h-[44px] px-4 rounded-xl border transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedSize?.label === size.label
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-border",
                !size.available && "opacity-50 pointer-events-none"
              )}
              aria-label={`Beden: ${size.label}${!size.available ? " (Stokta yok)" : ""}`}
              aria-pressed={selectedSize?.label === size.label}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            !isDescriptionExpanded && "line-clamp-3"
          )}
        >
          {product.description}
        </p>
        {product.description.length > 100 && (
          <button
            type="button"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-1 text-sm text-primary hover:underline min-h-[44px] -ml-2 pl-2 pr-2"
          >
            {isDescriptionExpanded ? (
              <>
                Daha az göster
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Devamını oku
                <ChevronRight className="h-4 w-4 rotate-90" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Desktop Add to Cart Button - Mobile'da gizli */}
      <div className="space-y-3 pt-4 hidden md:block">
        {!canAddToCart && (
          <p className="text-sm text-muted-foreground">
            Lütfen renk ve beden seçin.
          </p>
        )}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          size="lg"
          className="w-full h-12 rounded-xl"
        >
          Sepete Ekle
        </Button>
      </div>

      {/* Mobile Sticky Bar - Sadece mobile'da görünür */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 px-4">
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Fiyat</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatTRY(product.price)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              size="lg"
              className="h-11 rounded-xl flex-1 max-w-[200px]"
            >
              {getButtonLabel()}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sepete Eklendi</DrawerTitle>
            <DrawerDescription>
              Ürün sepetinize eklendi. Sepetinizi görüntülemek için üst menüden sepet ikonuna tıklayın.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={() => setDrawerOpen(false)} className="w-full">
              Tamam
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

