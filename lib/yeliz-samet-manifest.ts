import { readFile } from 'fs/promises';
import { join } from 'path';

export type GalleryManifest = {
  salon: string[];
  yat: string[];
};

const MANIFEST_PATH = join(process.cwd(), 'public', 'yeliz-samet', 'manifest.json');

export async function getGalleryManifest(): Promise<GalleryManifest> {
  try {
    const fileContent = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: GalleryManifest = JSON.parse(fileContent);
    return manifest;
  } catch (error) {
    // Manifest yoksa boş manifest dön
    console.warn('Manifest dosyası bulunamadı, boş manifest dönülüyor:', error);
    return {
      salon: [],
      yat: [],
    };
  }
}

