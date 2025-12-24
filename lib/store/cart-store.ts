"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (payload) => {
        const { title, variant, price, imageSrc, qty = 1 } = payload
        const items = get().items
        const existingItem = items.find(
          (item) => item.title === title && item.variant === variant
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, qty: item.qty + qty }
                : item
            ),
          })
        } else {
          const newItem: CartItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            variant,
            price,
            qty,
            imageSrc,
          }
          set({ items: [...items, newItem] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },
      setQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, qty } : item
            ),
          })
        }
      },
      clear: () => {
        set({ items: [] })
      },
    }),
    {
      name: "cart-storage",
    }
  )
)

// Selectors
export const useCartTotalQty = () => {
  return useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0)
  )
}

export const useCartSubtotal = () => {
  return useCartStore((state) =>
    state.items.reduce(
      (total, item) => total + item.price * item.qty,
      0
    )
  )
}

