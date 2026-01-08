import { glob } from 'fast-glob';
import { writeFileSync } from 'fs';
import { join } from 'path';

const YELIZ_SAMET_DIR = 'public/yeliz-samet';
const MANIFEST_PATH = 'public/yeliz-samet/manifest.json';

interface ImageManifest {
  salon: string[];
  yat: string[];
}

async function generateManifest() {
  try {
    // Salon fotoğrafları - sadece .webp
    const salonImages = await glob('salon-foto/**/*.webp', {
      cwd: YELIZ_SAMET_DIR,
      absolute: false,
    });

    // Yat fotoğrafları - sadece .webp
    const yatImages = await glob('yat-foto/**/*.webp', {
      cwd: YELIZ_SAMET_DIR,
      absolute: false,
    });

    // Sıralama (localeCompare numeric)
    salonImages.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    yatImages.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // Relative path'ler (prefix olmadan)
    const manifest: ImageManifest = {
      salon: salonImages,
      yat: yatImages,
    };

    // JSON dosyasını yaz
    writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log(`✅ Manifest oluşturuldu: ${MANIFEST_PATH}`);
    console.log(`   Salon: ${manifest.salon.length} görsel`);
    console.log(`   Yat: ${manifest.yat.length} görsel`);
    console.log(`   Toplam: ${manifest.salon.length + manifest.yat.length} görsel`);
  } catch (error) {
    console.error('❌ Manifest oluşturulurken hata:', error);
    process.exit(1);
  }
}

generateManifest();

