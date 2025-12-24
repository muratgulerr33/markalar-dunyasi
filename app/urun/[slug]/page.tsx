import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/products"
import { ProductDetail } from "@/components/product-detail"
import { ProductGallery } from "@/components/product-gallery"
import { Card } from "@/components/ui/card"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const safeSlug = decodeURIComponent(slug)
  const product = getProductBySlug(safeSlug)

  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 desktop:px-6 py-6 desktop:py-10">
      <div className="grid gap-8 desktop:grid-cols-[1.1fr_0.9fr]">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product Info - Desktop Sticky Panel */}
        <div className="desktop:sticky desktop:top-24 desktop:self-start">
          <Card className="rounded-2xl border bg-card/60 backdrop-blur p-6 desktop:p-8">
            <ProductDetail product={product} />
          </Card>
        </div>
      </div>
    </main>
  )
}
