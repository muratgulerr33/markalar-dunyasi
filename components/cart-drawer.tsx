"use client"

import * as React from "react"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCartStore, useCartSubtotal } from "@/lib/store/cart-store"
import { formatTRY } from "@/lib/format"

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQty = useCartStore((state) => state.setQty)
  const clear = useCartStore((state) => state.clear)
  const subtotal = useCartSubtotal()

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader>
          <DrawerTitle>Sepet</DrawerTitle>
          <DrawerDescription>
            Sepetinizde {items.length} ürün bulunmaktadır
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto max-h-[50vh] px-4">
          <div className="space-y-4 py-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Sepetiniz boş
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-start border-b pb-4 last:border-0"
                >
                  {item.imageSrc && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.variant}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="Azalt"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium tabular-nums min-w-[2ch] text-center">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="Artır"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums">
                          {formatTRY(item.price * item.qty)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                          aria-label="Kaldır"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {items.length > 0 && (
          <>
            <Separator />
            <DrawerFooter className="gap-2">
              <div className="flex items-center justify-between text-lg font-bold mb-2">
                <span>Toplam:</span>
                <span className="tabular-nums">{formatTRY(subtotal)}</span>
              </div>
              <Button size="lg" className="w-full">
                Satın Al
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={clear}
              >
                Sepeti Temizle
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

