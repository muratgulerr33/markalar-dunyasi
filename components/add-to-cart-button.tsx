"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"

interface AddToCartButtonProps {
  title: string
  price: number
  imageSrc?: string
  variant?: string
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCartButton({
  title,
  price,
  imageSrc,
  variant,
  className,
  size = "default",
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleClick = () => {
    addItem({
      title,
      price,
      imageSrc,
      variant,
      qty: 1,
    })
  }

  return (
    <Button className={className} size={size} onClick={handleClick}>
      Sepete Ekle
    </Button>
  )
}

