export interface CartItem {
  id: string
  title: string
  variant?: string
  price: number
  qty: number
  imageSrc?: string
}

export const mockCartItems: CartItem[] = [
  {
    id: "1",
    title: "Premium Ürün",
    variant: "Kırmızı / M",
    price: 299.99,
    qty: 2,
    imageSrc: "/hero.webp",
  },
  {
    id: "2",
    title: "Klasik Tasarım",
    variant: "Siyah / L",
    price: 149.99,
    qty: 1,
  },
  {
    id: "3",
    title: "Modern Koleksiyon",
    variant: "Beyaz / S",
    price: 199.99,
    qty: 3,
  },
]

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.qty, 0)
}

export function getTotalQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.qty, 0)
}

