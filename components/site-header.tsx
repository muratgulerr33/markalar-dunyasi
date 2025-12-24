"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, Search, User, Sun, Moon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CartDrawer } from "@/components/cart-drawer"
import { ClientOnly } from "@/components/client-only"
import { useTheme } from "next-themes"
import { categories } from "@/lib/categories"
import { navItems } from "@/lib/nav-config"
import { useCartTotalQty } from "@/lib/store/cart-store"

export function SiteHeader() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const cartQuantity = useCartTotalQty()
  const { theme, setTheme } = useTheme()
  // Mock auth state - şimdilik false
  const isLoggedIn = false

  // Escape key handler for sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [sidebarOpen])

  const isActive = (href: string) => pathname === href
  const isCategoryActive = (slug: string) => pathname === `/kategori/${slug}`

  const handleSearchClick = () => {
    document.getElementById("site-search")?.focus()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-6xl px-4 desktop:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo/Brand - SOLDA */}
          <Link href="/" className="flex items-center">
            <span className="font-semibold tracking-tight text-base">Markalar Dünyası</span>
          </Link>

          {/* Sağ aksiyon grubu */}
          <div className="flex items-center gap-0.5">
            {/* Mobile: Search, Cart, Profile, Menu */}
            <div className="flex items-center gap-0.5 desktop:hidden">
              {/* Search button */}
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Ara"
                onClick={handleSearchClick}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart Drawer */}
              <CartDrawer>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] relative"
                  aria-label="Sepet"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <ClientOnly>
                    {cartQuantity > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] tabular-nums"
                      >
                        {cartQuantity}
                      </Badge>
                    )}
                  </ClientOnly>
                </Button>
              </CartDrawer>

              {/* Profile button */}
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Profil"
                asChild
              >
                <Link href="/hesabim">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Hamburger Menu - EN SAĞDA */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Menüyü aç"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="p-0 w-[85vw] max-w-[420px] h-dvh rounded-none [&>button]:hidden data-[state=open]:animate-in data-[state=open]:duration-[400ms] data-[state=open]:slide-in-from-right data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:duration-[400ms] data-[state=closed]:slide-out-to-right data-[state=closed]:fade-out-0 transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b">
                      <SheetTitle className="text-lg font-bold">
                        Markalar Dünyası
                      </SheetTitle>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-[44px] min-w-[44px]"
                          aria-label="Menüyü kapat"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-2 py-3">
                      <SidebarMenu aria-label="Ana navigasyon">
                        {navItems.map((item) => (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              active={isActive(item.href)}
                              className="min-h-[44px] rounded-xl px-3 py-3 active:scale-[0.98] motion-safe:transition"
                            >
                              {item.label}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                        {navItems.length > 0 && (
                          <div className="my-4 border-t border-sidebar-border" />
                        )}
                        <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                          Kategoriler
                        </div>
                        {categories.map((category) => (
                          <SidebarMenuItem key={category.slug}>
                            <SidebarMenuButton
                              href={`/kategori/${category.slug}`}
                              onClick={() => setSidebarOpen(false)}
                              active={isCategoryActive(category.slug)}
                              className="min-h-[44px] rounded-xl px-3 py-3 active:scale-[0.98] motion-safe:transition bg-accent data-[active=true]:bg-accent"
                            >
                              {category.label}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </div>

                    {/* Footer - Sticky bottom with safe-area */}
                    <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                      <div className="space-y-3">
                        {/* Theme Toggle */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium">Tema</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            aria-label="Tema değiştir"
                          >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          </Button>
                        </div>
                        {isLoggedIn ? (
                          <>
                            <Button
                              size="lg"
                              className="w-full rounded-xl"
                              variant="default"
                              onClick={() => {
                                setSidebarOpen(false)
                                // Navigate to account page
                              }}
                            >
                              Hesabım
                            </Button>
                            <Button
                              size="lg"
                              className="w-full rounded-xl"
                              variant="outline"
                              onClick={() => {
                                setSidebarOpen(false)
                                // Handle logout
                              }}
                            >
                              Çıkış Yap
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="lg"
                              className="w-full rounded-xl"
                              variant="default"
                              onClick={() => {
                                setSidebarOpen(false)
                                // Navigate to login page
                              }}
                            >
                              Giriş Yap
                            </Button>
                            <Button
                              size="lg"
                              className="w-full rounded-xl"
                              variant="outline"
                              onClick={() => {
                                setSidebarOpen(false)
                                // Navigate to register page
                              }}
                            >
                              Kayıt Ol
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop: Profile + Cart */}
            <div className="hidden desktop:flex items-center gap-0.5">
              {/* Profile button */}
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Profil"
                asChild
              >
                <Link href="/hesabim">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Cart Drawer */}
              <CartDrawer>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] relative"
                  aria-label="Sepet"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <ClientOnly>
                    {cartQuantity > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] tabular-nums"
                      >
                        {cartQuantity}
                      </Badge>
                    )}
                  </ClientOnly>
                </Button>
              </CartDrawer>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
