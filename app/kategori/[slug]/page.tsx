import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categories, getCategoryBySlug } from "@/lib/categories"
import { ChevronRight, Home } from "lucide-react"

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Mock products - gerçek uygulamada API'den gelecek
  const mockProducts = [
    {
      id: 1,
      name: `${category.label} Ürün 1`,
      description: "Yüksek kaliteli ürün",
      price: "₺1.299",
    },
    {
      id: 2,
      name: `${category.label} Ürün 2`,
      description: "Premium tasarım",
      price: "₺2.499",
    },
    {
      id: 3,
      name: `${category.label} Ürün 3`,
      description: "Modern ve şık",
      price: "₺899",
    },
    {
      id: 4,
      name: `${category.label} Ürün 4`,
      description: "Klasik koleksiyon",
      price: "₺1.599",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <section className="container py-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category.label}</span>
        </nav>
      </section>

      {/* Category Header */}
      <section className="container py-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{category.label}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-base px-4 py-2">
              {category.label}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {mockProducts.length} ürün bulundu
            </span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container py-8 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="aspect-square w-full rounded-lg bg-muted mb-4 flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">Görsel</div>
                </div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{product.price}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Sepete Ekle</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

