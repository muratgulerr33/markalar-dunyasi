# ÜRÜN DETAY KARTI - KLONLAMA RAPORU

Bu rapor, sistemdeki **Ürün Detay Kartı** bileşenini sıfırdan başka bir projeye klonlamak için gereken tüm dosyaları, bileşenleri, fonksiyonları, route'ları, API'leri ve bağımlılıkları içermektedir.

---

## 📋 İÇİNDEKİLER

1. [Ana Bileşenler](#ana-bileşenler)
2. [Route Yapısı](#route-yapısı)
3. [State Management](#state-management)
4. [Yardımcı Fonksiyonlar](#yardımcı-fonksiyonlar)
5. [UI Bileşenleri](#ui-bileşenleri)
6. [📱 Mobil Davranışlar ve Responsive Özellikler](#-mobil-davranışlar-ve-responsive-özellikler)
7. [Bağımlılıklar](#bağımlılıklar)
8. [Dosya Ağacı](#dosya-ağacı)
9. [Klonlama Adımları](#klonlama-adımları)

---

## 🎯 ANA BİLEŞENLER

### 1. ProductDetail Bileşeni
**Dosya:** `components/product-detail.tsx`

**Açıklama:** Ürün detay kartının ana bileşenidir. Ürün bilgilerini, renk/beden seçimini, açıklamayı ve sepete ekleme işlevini içerir.

**Özellikler:**
- Breadcrumb navigasyonu
- Badge gösterimi (opsiyonel)
- Ürün başlığı
- Fiyat gösterimi (TRY formatında)
- Renk seçimi (renk paleti ile)
- Beden seçimi (stok durumuna göre)
- Açıklama metni (genişletilebilir)
- Sepete ekleme butonu (desktop ve mobile)
- Mobile sticky bar (alt sabit bar)
- Sepete ekleme başarı drawer'ı (mobile)

**Props:**
```typescript
interface ProductDetailProps {
  product: Product
}
```

**State Yönetimi:**
- `isDescriptionExpanded`: Açıklama genişletilmiş mi?
- `selectedColor`: Seçili renk
- `selectedSize`: Seçili beden
- `drawerOpen`: Mobile drawer açık mı?

**Kullanılan Hook'lar:**
- `useState` (React)
- `useEffect` (React)
- `useCartStore` (Zustand)

**Bağımlılıklar:**
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/separator`
- `@/components/ui/drawer`
- `@/lib/utils` (cn fonksiyonu)
- `@/lib/format` (formatTRY fonksiyonu)
- `@/lib/products` (Product, ProductColor, ProductSize tipleri)
- `@/lib/store/cart-store` (useCartStore)
- `next/link` (Link bileşeni)
- `lucide-react` (ChevronRight, ChevronDown ikonları)

---

### 2. ProductGallery Bileşeni
**Dosya:** `components/product-gallery.tsx`

**Açıklama:** Ürün görsellerini gösteren galeri bileşenidir. Lightbox, swipe, thumbnail ve pagination özellikleri içerir.

**Özellikler:**
- Ana görsel gösterimi (track yapısı ile)
- Thumbnail strip
- Pagination dots (mobile)
- Fullscreen lightbox
- Touch/swipe desteği (mobile)
- Pointer drag desteği (desktop)
- Klavye navigasyonu (ESC, Arrow keys)
- Desktop navigation arrows

**Props:**
```typescript
interface ProductGalleryProps {
  images: string[]
  title: string
}
```

**State Yönetimi:**
- `selectedIndex`: Seçili görsel index'i
- `lightboxOpen`: Lightbox açık mı?
- `lightboxIndex`: Lightbox'ta seçili görsel
- `lightboxIsDragging`: Drag işlemi devam ediyor mu?
- `dragOffset`: Drag sırasındaki offset değeri

**Bağımlılıklar:**
- `next/image` (Image bileşeni)
- `@/components/ui/dialog`
- `@/components/ui/button`
- `@/lib/utils` (cn fonksiyonu)
- `lucide-react` (ChevronLeft, ChevronRight, X ikonları)
- `@radix-ui/react-visually-hidden`

---

### 3. Ürün Detay Sayfası (Route)
**Dosya:** `app/urun/[slug]/page.tsx`

**Açıklama:** Next.js App Router ile dinamik route. Slug parametresine göre ürünü getirir ve ProductDetail ile ProductGallery bileşenlerini render eder.

**Route Yapısı:**
- Path: `/urun/[slug]`
- Örnek: `/urun/gucci-kadin-cantasi`

**Özellikler:**
- Server Component (async)
- Slug decode işlemi
- Ürün bulunamazsa 404 (notFound)
- Responsive grid layout
- Desktop sticky panel
- Card wrapper

**Kullanılan Fonksiyonlar:**
- `getProductBySlug(slug: string)`: Ürünü slug'a göre getirir

**Bağımlılıklar:**
- `next/navigation` (notFound)
- `@/lib/products` (getProductBySlug)
- `@/components/product-detail` (ProductDetail)
- `@/components/product-gallery` (ProductGallery)
- `@/components/ui/card` (Card)

---

## 🔄 STATE MANAGEMENT

### Cart Store (Zustand)
**Dosya:** `lib/store/cart-store.ts`

**Açıklama:** Sepet state yönetimi için Zustand store. LocalStorage'a persist edilir.

**Interface:**
```typescript
interface CartItem {
  id: string
  title: string
  variant?: string
  price: number
  qty: number
  imageSrc?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (payload: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}
```

**Fonksiyonlar:**
- `addItem`: Sepete ürün ekler (aynı ürün varsa miktar artar)
- `removeItem`: Sepetten ürün çıkarır
- `setQty`: Ürün miktarını günceller
- `clear`: Sepeti temizler

**Selectors:**
- `useCartTotalQty`: Toplam ürün miktarı
- `useCartSubtotal`: Toplam fiyat

**Storage:**
- Key: `"cart-storage"`
- Middleware: `persist` (zustand/middleware)

**Bağımlılıklar:**
- `zustand`
- `zustand/middleware` (persist)

---

## 🛠️ YARDIMCI FONKSİYONLAR

### 1. formatTRY
**Dosya:** `lib/format.ts`

**Açıklama:** Sayıyı Türk Lirası formatına çevirir.

```typescript
export function formatTRY(value: number): string
```

**Kullanım:**
```typescript
formatTRY(15999) // "₺15.999,00"
```

**Bağımlılıklar:**
- Intl.NumberFormat (built-in)

---

### 2. cn
**Dosya:** `lib/utils.ts`

**Açıklama:** Class name birleştirme fonksiyonu (clsx + tailwind-merge).

```typescript
export function cn(...inputs: ClassValue[]): string
```

**Bağımlılıklar:**
- `clsx`
- `tailwind-merge`

---

### 3. getProductBySlug
**Dosya:** `lib/products.ts`

**Açıklama:** Slug'a göre ürün getirir.

```typescript
export function getProductBySlug(slug: string): Product | undefined
```

**Bağımlılıklar:**
- `mockProducts` array'i

---

## 📦 VERİ MODELLERİ

### Product Interface
**Dosya:** `lib/products.ts`

```typescript
export interface Product {
  slug: string
  title: string
  price: number
  images: string[]
  colors: ProductColor[]
  sizes: ProductSize[]
  description: string
  badge?: string
}

export interface ProductColor {
  name: string
  valueHex: string
}

export interface ProductSize {
  label: string
  available: boolean
}
```

**Mock Data:**
- `mockProducts`: Product[] array'i
- 8 örnek ürün içerir

---

## 🎨 UI BİLEŞENLERİ

### 1. Button
**Dosya:** `components/ui/button.tsx`

**Variant'lar:**
- default
- destructive
- outline
- secondary
- ghost
- link

**Size'lar:**
- default
- sm
- lg
- icon
- icon-sm
- icon-lg

**Bağımlılıklar:**
- `@radix-ui/react-slot`
- `class-variance-authority`
- `@/lib/utils` (cn)

---

### 2. Badge
**Dosya:** `components/ui/badge.tsx`

**Variant'lar:**
- default
- secondary
- destructive
- outline

**Bağımlılıklar:**
- `@radix-ui/react-slot`
- `class-variance-authority`
- `@/lib/utils` (cn)

---

### 3. Card
**Dosya:** `components/ui/card.tsx`

**Alt Bileşenler:**
- Card
- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardFooter
- CardAction

**Bağımlılıklar:**
- `@/lib/utils` (cn)

---

### 4. Drawer
**Dosya:** `components/ui/drawer.tsx`

**Alt Bileşenler:**
- Drawer (Root)
- DrawerTrigger
- DrawerPortal
- DrawerClose
- DrawerOverlay
- DrawerContent
- DrawerHeader
- DrawerFooter
- DrawerTitle
- DrawerDescription

**Bağımlılıklar:**
- `vaul`
- `@/lib/utils` (cn)

---

### 5. Separator
**Dosya:** `components/ui/separator.tsx`

**Bağımlılıklar:**
- `@radix-ui/react-separator`
- `@/lib/utils` (cn)

---

### 6. Dialog
**Dosya:** `components/ui/dialog.tsx`

**Alt Bileşenler:**
- Dialog (Root)
- DialogTrigger
- DialogPortal
- DialogClose
- DialogOverlay
- DialogContent
- DialogHeader
- DialogFooter
- DialogTitle
- DialogDescription

**Bağımlılıklar:**
- `@radix-ui/react-dialog`
- `lucide-react` (X ikonu)
- `@/lib/utils` (cn)

---

## 📱 MOBİL DAVRANIŞLAR VE RESPONSIVE ÖZELLİKLER

Bu bölüm, ürün detay kartının mobil cihazlardaki tüm davranışlarını, responsive özelliklerini ve mobile-first yaklaşımını detaylı olarak açıklar.

### 🎯 MOBILE-FIRST YAKLAŞIM

Sistem **mobile-first** yaklaşımı kullanır. Tüm stiller önce mobil için yazılır, desktop için `md:` veya `desktop:` prefix'leri ile override edilir.

**Breakpoint Değerleri:**
- **Mobile:** `< 768px` (varsayılan, prefix yok)
- **Tablet/Desktop:** `≥ 768px` (`md:` prefix)
- **Desktop:** `≥ 1124px` (`desktop:` custom breakpoint)

**Tailwind Config:**
```typescript
screens: {
  desktop: "1124px",  // Custom breakpoint
}
```

---

### 📐 RESPONSIVE LAYOUT YAPISI

#### ProductDetail Container
```tsx
<div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-0">
```

**Mobil Davranış:**
- `pb-[calc(env(safe-area-inset-bottom)+96px)]`: Alt padding, safe area + 96px (sticky bar yüksekliği için alan)
- `space-y-6`: Dikey boşluk 24px (1.5rem)

**Desktop Davranış:**
- `md:pb-0`: Desktop'ta alt padding yok (sticky bar yok)

---

### 🎨 MOBİL STICKY BAR (Fixed Bottom Bar)

**Konum:** `components/product-detail.tsx` (Satır 201-221)

**CSS Sınıfları:**
```tsx
<div className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
```

**Özellikler:**

1. **Positioning:**
   - `fixed`: Ekrana sabitlenmiş
   - `bottom-0`: Alt kenara yapışık
   - `inset-x-0`: Sol ve sağ kenarlara yapışık (width: 100%)
   - `z-50`: Üstte görünür (z-index: 50)

2. **Görünürlük:**
   - `md:hidden`: Desktop'ta gizli (≥768px)

3. **Stil:**
   - `border-t`: Üst kenarda border
   - `bg-background/80`: %80 opaklıkta arka plan
   - `backdrop-blur`: Blur efekti
   - `supports-[backdrop-filter]:bg-background/60`: Backdrop filter destekleniyorsa %60 opaklık

**İç Yapı:**
```tsx
<div className="pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 px-4">
```

**Safe Area Desteği:**
- `pb-[calc(env(safe-area-inset-bottom)+0.75rem)]`: Alt padding, safe area + 12px
- iPhone X ve üzeri cihazlarda home indicator için alan
- `pt-3`: Üst padding 12px
- `px-4`: Yan padding 16px

**İçerik Layout:**
```tsx
<div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
```
- Flexbox: Yatay hizalama
- `justify-between`: Fiyat solda, buton sağda
- `gap-4`: Elemanlar arası 16px boşluk
- `max-w-6xl mx-auto`: Maksimum genişlik ve ortalanmış

**Fiyat Gösterimi:**
```tsx
<div className="flex flex-col">
  <span className="text-xs text-muted-foreground">Fiyat</span>
  <span className="text-lg font-semibold tabular-nums">
    {formatTRY(product.price)}
  </span>
</div>
```
- `text-xs`: 12px font
- `text-lg`: 18px font (fiyat)
- `tabular-nums`: Sayılar için sabit genişlik (hizalama)

**Buton:**
```tsx
<Button
  size="lg"
  className="h-11 rounded-xl flex-1 max-w-[200px]"
>
```
- `h-11`: Yükseklik 44px (minimum touch target)
- `rounded-xl`: 12px border radius
- `flex-1`: Maksimum genişlikte
- `max-w-[200px]`: Maksimum 200px genişlik

---

### 🎯 TOUCH TARGET BOYUTLARI (Accessibility)

Tüm tıklanabilir elementler **minimum 44x44px** boyutundadır (WCAG 2.1 AA standardı).

**Örnekler:**

1. **Renk Seçimi Butonları:**
```tsx
className="h-11 w-11 rounded-full"
```
- `h-11 w-11`: 44x44px

2. **Beden Seçimi Butonları:**
```tsx
className="min-h-[44px] px-4 rounded-xl"
```
- `min-h-[44px]`: Minimum 44px yükseklik

3. **Thumbnail Butonları:**
```tsx
className="min-h-[44px] min-w-[44px]"
```
- Her iki eksende minimum 44px

4. **Pagination Dots:**
```tsx
className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -m-2"
```
- `p-2 -m-2`: Padding + negatif margin = 44px touch area

---

### 👆 TOUCH/SWIPE DAVRANIŞLARI

#### ProductGallery - Ana Görsel Swipe

**Konum:** `components/product-gallery.tsx` (Satır 64-85)

**Touch Event Handlers:**
```tsx
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
```

**Değerler:**
- `minSwipeDistance = 40`: Minimum swipe mesafesi (40px)
- Sol swipe: `distance > 40px` → Sonraki görsel
- Sağ swipe: `distance < -40px` → Önceki görsel

**Overlay Yapısı:**
```tsx
<div
  className="absolute inset-0 touch-none"
  onTouchStart={onTouchStart}
  onTouchMove={onTouchMove}
  onTouchEnd={onTouchEnd}
/>
```
- `touch-none`: Alt elementlerin touch event'lerini engeller
- `absolute inset-0`: Tüm alanı kaplar

---

#### Lightbox Touch/Swipe

**Konum:** `components/product-gallery.tsx` (Satır 151-172)

**Touch Handlers:**
```tsx
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
```

**Pointer Events (Desktop Drag):**
```tsx
const onLightboxPointerDown = (e: React.PointerEvent) => {
  setLightboxIsDragging(true)
  lightboxPointerStartX.current = e.clientX
  lightboxPointerCurrentX.current = e.clientX
}

const onLightboxPointerMove = (e: React.PointerEvent) => {
  const deltaX = lightboxPointerStartX.current - e.clientX
  const maxOffset = lightboxTrackRef.current?.clientWidth || 0
  const constrainedDelta = Math.max(-maxOffset * 0.3, Math.min(maxOffset * 0.3, deltaX))
  setDragOffset(constrainedDelta)
}

const onLightboxPointerUp = () => {
  const deltaX = lightboxPointerStartX.current - lightboxPointerCurrentX.current
  const threshold = 50
  
  if (deltaX > threshold && lightboxIndex < images.length - 1) {
    setLightboxIndex(lightboxIndex + 1)
  } else if (deltaX < -threshold && lightboxIndex > 0) {
    setLightboxIndex(lightboxIndex - 1)
  }
}
```

**Değerler:**
- `threshold = 50`: Pointer drag için minimum mesafe (50px)
- `maxOffset * 0.3`: Drag sırasında maksimum offset (%30)
- Smooth transition: `300ms ease-out`

---

### 🖼️ GÖRSEL GALERİ MOBİL ÖZELLİKLERİ

#### Ana Görsel Container
```tsx
<div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/30">
```

**Özellikler:**
- `aspect-[4/5]`: 4:5 en-boy oranı (portrait)
- `rounded-2xl`: 16px border radius
- `bg-muted/30`: %30 opaklıkta arka plan (loading state)

**Image Sizes (Responsive):**
```tsx
sizes="(max-width: 1124px) 100vw, 50vw"
```
- Mobile: `100vw` (tam genişlik)
- Desktop: `50vw` (yarı genişlik)

---

#### Thumbnail Strip
```tsx
<div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
```

**Özellikler:**
- `overflow-x-auto`: Yatay scroll
- `scrollbar-hide`: Scrollbar gizli (custom CSS)
- `snap-x snap-mandatory`: Snap scroll (her thumbnail'e yapışır)
- `-mx-4 px-4`: Kenar boşlukları (container padding'i aşar)

**Thumbnail Boyutları:**
```tsx
className="aspect-[4/5] w-20 rounded-xl min-h-[44px] min-w-[44px]"
```
- `w-20`: 80px genişlik
- `aspect-[4/5]`: 4:5 oran (64px yükseklik)
- `min-h-[44px] min-w-[44px]`: Minimum touch target

---

#### Pagination Dots (Mobile Only)
```tsx
<div className="flex justify-center gap-2 desktop:hidden">
```

**Görünürlük:**
- `desktop:hidden`: Sadece mobilde görünür

**Dot Stilleri:**
```tsx
className={cn(
  "h-2 rounded-full transition-all min-h-[44px] min-w-[44px]",
  selectedIndex === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
)}
```
- Aktif: `w-8` (32px genişlik)
- Pasif: `w-2` (8px genişlik)
- `h-2`: 8px yükseklik
- Touch area: `min-h-[44px] min-w-[44px]`

---

### 📱 MOBİL DRAWER (Sepete Ekleme Başarı)

**Konum:** `components/product-detail.tsx` (Satır 223-238)

**Kullanım:**
```tsx
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
```

**Davranış:**
- Sepete ekleme sonrası otomatik açılır
- Kullanıcı "Tamam" butonuna tıklayınca kapanır
- Drawer alt taraftan yukarı kayar (vaul kütüphanesi)

---

### 📏 TYPOGRAPHY RESPONSIVE DEĞERLERİ

#### Başlık
```tsx
<h1 className="text-2xl desktop:text-3xl font-semibold tracking-tight">
```
- Mobile: `text-2xl` (24px / 1.5rem)
- Desktop: `text-3xl` (30px / 1.875rem)

#### Fiyat (Sticky Bar)
```tsx
<span className="text-lg font-semibold tabular-nums">
```
- `text-lg`: 18px (1.125rem)
- `tabular-nums`: Sayılar için sabit genişlik

#### Fiyat (Ana Alan)
```tsx
<span className="text-3xl font-semibold tabular-nums">
```
- `text-3xl`: 30px (1.875rem)

#### Açıklama
```tsx
<p className="text-muted-foreground leading-relaxed">
```
- `leading-relaxed`: 1.625 line-height

---

### 🎨 RENK VE BEDEN SEÇİMİ MOBİL

#### Renk Butonları
```tsx
<button
  className="h-11 w-11 rounded-full ring-1 ring-border/60 transition-all"
  style={{ backgroundColor: color.valueHex }}
>
```

**Özellikler:**
- `h-11 w-11`: 44x44px (touch target)
- `rounded-full`: Tam yuvarlak
- `ring-1`: 1px border ring
- `ring-border/60`: %60 opaklık
- Seçili: `ring-2 ring-primary`

#### Beden Butonları
```tsx
<button
  className="min-h-[44px] px-4 rounded-xl border transition-all"
  disabled={!size.available}
>
```

**Özellikler:**
- `min-h-[44px]`: Minimum 44px yükseklik
- `px-4`: 16px yatay padding
- `rounded-xl`: 12px border radius
- Seçili: `bg-primary text-primary-foreground`
- Stokta yok: `opacity-50 pointer-events-none`

---

### 🔄 STATE YÖNETİMİ MOBİL

#### Default Seçimler
```tsx
useEffect(() => {
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
```

**Davranış:**
- İlk renk otomatik seçilir
- İlk müsait beden otomatik seçilir
- Component mount olduğunda çalışır

---

### 📐 SAFE AREA INSETS

**Kullanım Yerleri:**

1. **ProductDetail Container:**
```tsx
pb-[calc(env(safe-area-inset-bottom)+96px)]
```
- Alt padding: safe area + 96px (sticky bar için)

2. **Sticky Bar:**
```tsx
pb-[calc(env(safe-area-inset-bottom)+0.75rem)]
```
- Alt padding: safe area + 12px

**Desteklenen Cihazlar:**
- iPhone X ve üzeri (home indicator)
- Android cihazlar (navigation bar)

---

### 🎯 RESPONSIVE GÖRÜNÜRLÜK KURALLARI

#### Desktop'ta Gizli (Mobile Only)
- `md:hidden`: Sticky bar
- `desktop:hidden`: Pagination dots

#### Mobile'da Gizli (Desktop Only)
- `hidden md:block`: Desktop sepete ekle butonu

**Örnek:**
```tsx
{/* Desktop Add to Cart Button - Mobile'da gizli */}
<div className="space-y-3 pt-4 hidden md:block">
  <Button>Sepete Ekle</Button>
</div>

{/* Mobile Sticky Bar - Sadece mobile'da görünür */}
<div className="fixed bottom-0 md:hidden">
  <Button>Sepete Ekle</Button>
</div>
```

---

### ⚡ PERFORMANS OPTİMİZASYONLARI

#### Image Loading
```tsx
<Image
  priority={index === 0}
  sizes="(max-width: 1124px) 100vw, 50vw"
/>
```
- İlk görsel: `priority={true}` (preload)
- Diğer görseller: Lazy load

#### Will-Change
```tsx
className="will-change-transform"
```
- Transform animasyonları için GPU hızlandırma

#### Transition
```tsx
style={{
  transform: `translateX(-${selectedIndex * 100}%)`,
  transition: 'transform 300ms ease-out'
}}
```
- `300ms`: Smooth geçiş süresi
- `ease-out`: Yavaşlayan animasyon

---

### 📱 MOBİL ÖZEL CSS SINIFLARI

**globals.css'de tanımlı:**

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Kullanım:**
- `scrollbar-hide`: Thumbnail strip scrollbar'ı gizler
- `line-clamp-3`: Açıklama metni 3 satırla sınırlar

---

### 🎨 BACKDROP BLUR VE TRANSPARENCY

**Sticky Bar:**
```tsx
className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
```

**Değerler:**
- `bg-background/80`: %80 opaklık (fallback)
- `backdrop-blur`: Blur efekti
- `supports-[backdrop-filter]:bg-background/60`: Backdrop filter varsa %60 opaklık

**Destek:**
- Modern tarayıcılar: Backdrop filter
- Eski tarayıcılar: Solid background

---

### 📊 RESPONSIVE BREAKPOINT ÖZETİ

| Breakpoint | Değer | Prefix | Kullanım |
|------------|-------|--------|----------|
| Mobile | < 768px | (yok) | Varsayılan |
| Tablet/Desktop | ≥ 768px | `md:` | Orta ekranlar |
| Desktop | ≥ 1124px | `desktop:` | Büyük ekranlar |

**Örnek Kullanımlar:**
- `md:hidden`: Desktop'ta gizli
- `desktop:hidden`: Desktop'ta gizli
- `hidden md:block`: Mobile'da gizli, desktop'ta görünür
- `desktop:sticky`: Desktop'ta sticky

---

### ✅ MOBİL TEST KONTROL LİSTESİ

1. ✅ Sticky bar alt tarafta sabit
2. ✅ Safe area insets çalışıyor
3. ✅ Touch target'lar minimum 44x44px
4. ✅ Swipe ile görsel değişimi
5. ✅ Thumbnail scroll çalışıyor
6. ✅ Pagination dots görünür
7. ✅ Drawer açılıp kapanıyor
8. ✅ Backdrop blur çalışıyor
9. ✅ Renk/beden seçimi çalışıyor
10. ✅ Sepete ekleme çalışıyor

---

## 📚 BAĞIMLILIKLAR

### NPM Paketleri

#### Production Dependencies:
```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-slot": "^1.2.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.562.0",
  "next": "16.1.1",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwind-merge": "^3.4.0",
  "vaul": "^1.1.2",
  "zustand": "^5.0.9"
}
```

#### Dev Dependencies:
```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

---

## 📁 DOSYA AĞACI

```
markalar-dunyasi/
├── app/
│   ├── layout.tsx                    # Root layout (gerekli)
│   ├── globals.css                   # Global stiller (gerekli)
│   └── urun/
│       └── [slug]/
│           └── page.tsx              # ✅ ÜRÜN DETAY ROUTE
│
├── components/
│   ├── product-detail.tsx            # ✅ ANA BİLEŞEN
│   ├── product-gallery.tsx           # ✅ GALERİ BİLEŞENİ
│   └── ui/
│       ├── badge.tsx                 # ✅ UI BİLEŞENİ
│       ├── button.tsx                # ✅ UI BİLEŞENİ
│       ├── card.tsx                  # ✅ UI BİLEŞENİ
│       ├── dialog.tsx                # ✅ UI BİLEŞENİ
│       ├── drawer.tsx                # ✅ UI BİLEŞENİ
│       └── separator.tsx             # ✅ UI BİLEŞENİ
│
├── lib/
│   ├── format.ts                     # ✅ FORMAT FONKSİYONU
│   ├── products.ts                   # ✅ ÜRÜN VERİ MODELİ
│   ├── store/
│   │   └── cart-store.ts             # ✅ STATE MANAGEMENT
│   └── utils.ts                      # ✅ YARDIMCI FONKSİYON
│
├── package.json                      # ✅ BAĞIMLILIKLAR
├── tailwind.config.ts                # ✅ TAILWIND YAPILANDIRMA
├── tsconfig.json                     # ✅ TYPESCRIPT YAPILANDIRMA
└── next.config.ts                    # ✅ NEXT.JS YAPILANDIRMA
```

---

## 🚀 KLONLAMA ADIMLARI

### 1. Proje Kurulumu

```bash
# Yeni Next.js projesi oluştur
npx create-next-app@latest yeni-proje --typescript --tailwind --app

# Bağımlılıkları yükle
npm install @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge vaul zustand
```

### 2. Dosya Kopyalama Sırası

#### Adım 1: Yardımcı Dosyalar
1. `lib/utils.ts` → Kopyala
2. `lib/format.ts` → Kopyala
3. `lib/products.ts` → Kopyala (veya kendi veri modelinizi oluşturun)
4. `lib/store/cart-store.ts` → Kopyala

#### Adım 2: UI Bileşenleri
1. `components/ui/button.tsx` → Kopyala
2. `components/ui/badge.tsx` → Kopyala
3. `components/ui/card.tsx` → Kopyala
4. `components/ui/separator.tsx` → Kopyala
5. `components/ui/drawer.tsx` → Kopyala
6. `components/ui/dialog.tsx` → Kopyala

#### Adım 3: Ana Bileşenler
1. `components/product-gallery.tsx` → Kopyala
2. `components/product-detail.tsx` → Kopyala

#### Adım 4: Route
1. `app/urun/[slug]/page.tsx` → Kopyala (veya kendi route yapınıza göre uyarlayın)

### 3. Yapılandırma Dosyaları

#### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        desktop: "1124px",
      },
    },
  },
  safelist: [
    "hidden",
    "sticky",
    "backdrop-blur",
    "bg-background/95",
    "supports-[backdrop-filter]:bg-background/60",
    "desktop:hidden",
    "desktop:flex",
    "desktop:grid",
    "desktop:grid-cols-2",
    "desktop:grid-cols-4",
    "desktop:gap-6",
    "aspect-[4/5]",
    "aspect-[16/9]",
    "aspect-[4/3]",
  ],
};

export default config;
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### 4. Gerekli CSS Değişkenleri

`globals.css` dosyasına aşağıdaki CSS değişkenlerinin tanımlı olduğundan emin olun:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --border: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;
}
```

### 5. Test Etme

1. Ürün verilerini hazırlayın (`lib/products.ts`)
2. Route'u test edin: `/urun/[slug]`
3. Tüm özellikleri test edin:
   - Renk seçimi
   - Beden seçimi
   - Sepete ekleme
   - Mobile sticky bar
   - Lightbox
   - Swipe/drag işlemleri

---

## 🔗 BAĞLANTILAR VE İLİŞKİLER

### Bileşen Hiyerarşisi

```
app/urun/[slug]/page.tsx
├── ProductGallery (images, title)
│   ├── Image (next/image)
│   ├── Dialog (lightbox)
│   └── Button (navigation)
│
└── Card
    └── ProductDetail (product)
        ├── Badge (product.badge)
        ├── Button (add to cart)
        ├── Drawer (mobile success)
        └── Separator
```

### Veri Akışı

```
1. Route: /urun/[slug]
   ↓
2. getProductBySlug(slug)
   ↓
3. Product object
   ↓
4. ProductDetail + ProductGallery
   ↓
5. User Interaction (renk/beden seçimi)
   ↓
6. addItem() → cart-store
   ↓
7. LocalStorage (persist)
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Next.js Image:** `next/image` kullanıldığı için `next.config.ts`'de image domain'leri yapılandırılmalı (eğer external image kullanılıyorsa).

2. **Client Components:** `ProductDetail` ve `ProductGallery` "use client" direktifi ile işaretlenmiş. Bu bileşenler client-side state kullanıyor.

3. **Server Component:** `app/urun/[slug]/page.tsx` server component. Async/await kullanıyor.

4. **Zustand Persist:** Cart store localStorage'a kaydediliyor. Tarayıcı desteği kontrol edilmeli.

5. **Responsive Design:** Desktop breakpoint: `1124px` (tailwind.config.ts'de `desktop` olarak tanımlı).

6. **Accessibility:** ARIA label'lar ve keyboard navigation desteği mevcut.

7. **Touch/Swipe:** Mobile için touch event'ler, desktop için pointer event'ler kullanılıyor.

---

## 📝 ÖZET

Ürün Detay Kartı için gerekli dosyalar:

**Toplam Dosya Sayısı:** 13 dosya
- 1 Route dosyası
- 2 Ana bileşen
- 6 UI bileşeni
- 4 Yardımcı dosya (lib)

**Toplam Bağımlılık:** 11 npm paketi
- Radix UI: 3 paket
- Zustand: 1 paket
- Diğer: 7 paket

**Özellikler:**
- ✅ Responsive design
- ✅ Mobile-first approach
- ✅ Touch/swipe desteği
- ✅ Lightbox galeri
- ✅ State management (Zustand)
- ✅ LocalStorage persist
- ✅ Accessibility
- ✅ TypeScript support

---

**Rapor Tarihi:** 2024
**Versiyon:** 1.0.0

