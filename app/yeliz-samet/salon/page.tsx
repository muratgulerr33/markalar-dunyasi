import { getGalleryManifest } from "@/lib/yeliz-samet-manifest";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";
import { YelizSametSalonClient } from "@/components/yeliz-samet-salon-client";

export const metadata = {
  title: "Salon Fotolar",
  robots: { index: false, follow: false },
};

export default async function YelizSametSalonPage() {
  const manifest = await getGalleryManifest();
  const allItems = manifest.salon;
  
  // Server-side'da silinen fotoğrafları filtrele
  const deleted = await deletedStorage.get("salon");
  const deletedSet = new Set(deleted);
  const items = allItems.filter((item) => {
    const filename = item.split("/").pop() || item;
    return !deletedSet.has(filename);
  });

  return <YelizSametSalonClient items={items} />;
}

