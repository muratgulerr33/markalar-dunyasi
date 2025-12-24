import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface ProductCardProps {
  title: string
  subtitle?: string
  price: string | number
  imageSrc?: string
  href?: string
  variant?: string
}

export function ProductCard({
  title,
  subtitle,
  price,
  imageSrc,
  href,
  variant,
}: ProductCardProps) {
  // Parse price string to number if needed
  // Turkish format: "₺1.299" -> 1299 (dot is thousands separator)
  const priceNumber =
    typeof price === "string"
      ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."))
      : price
  const cardContent = (
    <Card className="group h-full overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-border/80 motion-safe:hover:-translate-y-0.5">
      <CardHeader className="p-0">
        <div className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/50">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1124px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Görsel
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground line-clamp-2 min-h-[2.75rem]">{title}</h3>
        {subtitle && (
          <p className="text-xs leading-snug text-muted-foreground line-clamp-1 min-h-[1.25rem]">{subtitle}</p>
        )}
        <p className="tabular-nums text-lg font-semibold text-foreground">{price}</p>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-3 pt-2">
        <AddToCartButton
          title={title}
          price={priceNumber}
          imageSrc={imageSrc}
          variant={variant}
          className="h-10 w-full rounded-xl"
          size="default"
        />
      </CardFooter>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

