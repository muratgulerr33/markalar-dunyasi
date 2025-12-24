export interface Category {
  label: string
  slug: string
}

export const categories: Category[] = [
  { label: "Elbise", slug: "elbise" },
  { label: "Ceket", slug: "ceket" },
  { label: "Kazak", slug: "kazak" },
  { label: "Jean", slug: "jean" },
  { label: "Eşofman", slug: "esofman" },
  { label: "Tunik", slug: "tunik" },
  { label: "Tayt", slug: "tayt" },
  { label: "Spor", slug: "spor" },
  { label: "Günlük", slug: "gunluk" },
  { label: "Çanta", slug: "canta" },
  { label: "Aksesuar", slug: "aksesuar" },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug)
}

