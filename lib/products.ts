export interface ProductColor {
  name: string
  valueHex: string
}

export interface ProductSize {
  label: string
  available: boolean
}

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

export const mockProducts: Product[] = [
  {
    slug: "gucci-kadin-cantasi",
    title: "Gucci Kadın Çantası",
    price: 15999,
    images: ["/canta.webp", "/canta.png"],
    colors: [
      { name: "Siyah", valueHex: "#000000" },
      { name: "Kahverengi", valueHex: "#8B4513" },
      { name: "Kırmızı", valueHex: "#DC143C" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: false },
    ],
    description: "Premium deri, şık tasarım. Gucci'nin ikonik koleksiyonundan özel bir parça. Günlük kullanım için ideal, şık ve fonksiyonel.",
    badge: "Yeni",
  },
  {
    slug: "deri-ceket",
    title: "Deri Ceket",
    price: 3999,
    images: ["/ceket.webp", "/ceket.png"],
    colors: [
      { name: "Siyah", valueHex: "#000000" },
      { name: "Kahverengi", valueHex: "#8B4513" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    description: "Klasik ve şık tasarım, kaliteli işçilik. Deri ceket koleksiyonumuzdan özenle seçilmiş bir parça. Her mevsim için uygun.",
  },
  {
    slug: "spor-ayakkabi",
    title: "Spor Ayakkabı",
    price: 899,
    images: ["/spor.webp", "/spor.png"],
    colors: [
      { name: "Beyaz", valueHex: "#FFFFFF" },
      { name: "Siyah", valueHex: "#000000" },
      { name: "Gri", valueHex: "#808080" },
    ],
    sizes: [
      { label: "36", available: true },
      { label: "37", available: true },
      { label: "38", available: true },
      { label: "39", available: false },
      { label: "40", available: true },
    ],
    description: "Rahat ve dayanıklı, günlük kullanım için ideal. Spor aktivitelerinizde ve günlük hayatınızda konfor sağlar.",
  },
  {
    slug: "kadin-elbisesi",
    title: "Kadın Elbisesi",
    price: 2499,
    images: ["/elbise.webp", "/elbise.png"],
    colors: [
      { name: "Kırmızı", valueHex: "#DC143C" },
      { name: "Mavi", valueHex: "#0000FF" },
      { name: "Siyah", valueHex: "#000000" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
    ],
    description: "Şık ve zarif, özel tasarım. Özel günleriniz için mükemmel bir seçim. Yüksek kaliteli kumaş ve işçilik.",
  },
  {
    slug: "gunluk-giyim-seti",
    title: "Günlük Giyim Seti",
    price: 1799,
    images: ["/günlük.webp", "/günlük.png"],
    colors: [
      { name: "Gri", valueHex: "#808080" },
      { name: "Siyah", valueHex: "#000000" },
      { name: "Beyaz", valueHex: "#FFFFFF" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
    ],
    description: "Rahat ve şık kombin. Günlük kullanım için ideal, modern tasarım ve yüksek konfor.",
  },
  {
    slug: "kadin-kazak",
    title: "Kadın Kazak",
    price: 1299,
    images: ["/kazak.webp", "/kazak.png"],
    colors: [
      { name: "Krem", valueHex: "#FFF8DC" },
      { name: "Beyaz", valueHex: "#FFFFFF" },
      { name: "Gri", valueHex: "#808080" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
    ],
    description: "Yumuşak kumaş, kış koleksiyonu. Soğuk havalarda sıcak tutar, şık görünüm sağlar.",
  },
  {
    slug: "kadin-tunik",
    title: "Kadın Tunik",
    price: 899,
    images: ["/tunik.webp", "/tunik.png"],
    colors: [
      { name: "Beyaz", valueHex: "#FFFFFF" },
      { name: "Siyah", valueHex: "#000000" },
      { name: "Mavi", valueHex: "#0000FF" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
    ],
    description: "Rahat kesim, günlük kullanım. Modern ve şık tasarım, her mevsim için uygun.",
  },
  {
    slug: "spor-tayt",
    title: "Spor Tayt",
    price: 599,
    images: ["/tayt.webp", "/tayt.png"],
    colors: [
      { name: "Siyah", valueHex: "#000000" },
      { name: "Gri", valueHex: "#808080" },
      { name: "Koyu Mavi", valueHex: "#00008B" },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
    ],
    description: "Esnek ve konforlu, fitness için ideal. Spor aktivitelerinizde maksimum hareket özgürlüğü sağlar.",
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug)
}

