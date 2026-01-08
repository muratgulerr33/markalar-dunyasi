import { getGalleryManifest } from "@/lib/yeliz-samet-manifest";
import { YelizSametSalonClient } from "@/components/yeliz-samet-salon-client";

export const metadata = {
  title: "Salon Fotolar",
  robots: { index: false, follow: false },
};

export default async function YelizSametSalonPage() {
  const manifest = await getGalleryManifest();
  const items = manifest.salon;

  return <YelizSametSalonClient items={items} />;
}

