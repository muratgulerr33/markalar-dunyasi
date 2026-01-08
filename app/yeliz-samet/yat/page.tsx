import { getGalleryManifest } from "@/lib/yeliz-samet-manifest";
import { YelizSametYatClient } from "@/components/yeliz-samet-yat-client";

export const metadata = {
  title: "Yat Fotolar",
  robots: { index: false, follow: false },
};

export default async function YelizSametYatPage() {
  const manifest = await getGalleryManifest();
  const items = manifest.yat;

  return <YelizSametYatClient items={items} />;
}

