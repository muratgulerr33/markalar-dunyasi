import { getGalleryManifest } from "@/lib/yeliz-samet-manifest";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";
import { YelizSametYatClient } from "@/components/yeliz-samet-yat-client";

export const metadata = {
  title: "Yat Fotolar",
  robots: { index: false, follow: false },
};

export default async function YelizSametYatPage() {
  const manifest = await getGalleryManifest();
  const allItems = manifest.yat;
  
  // Server-side'da silinen fotoğrafları filtrele
  const deleted = await deletedStorage.get("yat");
  const deletedSet = new Set(deleted);
  const items = allItems.filter((item) => {
    const filename = item.split("/").pop() || item;
    return !deletedSet.has(filename);
  });

  return <YelizSametYatClient items={items} />;
}

