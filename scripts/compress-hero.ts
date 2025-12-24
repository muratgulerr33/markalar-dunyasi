import sharp from 'sharp';
import { join } from 'path';
import { stat } from 'fs';
import { promisify } from 'util';

const statAsync = promisify(stat);
const PUBLIC_DIR = 'public';

async function compressHeroImage(
  sourcePath: string,
  targetPath: string,
  targetSizeKB: number = 100
): Promise<void> {
  const beforeSize = (await statAsync(sourcePath)).size;
  console.log(`\n📸 Sıkıştırılıyor: ${sourcePath}`);
  console.log(`   Başlangıç boyutu: ${(beforeSize / 1024).toFixed(2)} KB`);

  // İlk deneme: kalite 50 ile başla
  let quality = 50;
  let currentSize = 0;
  let attempts = 0;
  const maxAttempts = 10;

  // Hedef boyuta yaklaşana kadar kaliteyi ayarla
  while (attempts < maxAttempts) {
    const sharpInstance = sharp(sourcePath)
      .rotate()
      .withMetadata()
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({
        quality,
        effort: 6,
        smartSubsample: true,
        nearLossless: false,
      });

    await sharpInstance.toFile(targetPath);
    const stats = await statAsync(targetPath);
    currentSize = stats.size;
    const currentSizeKB = currentSize / 1024;

    console.log(`   Deneme ${attempts + 1}: Kalite ${quality} → ${currentSizeKB.toFixed(2)} KB`);

    // Hedef boyuta yakınsak (90-110 KB arası) dur
    if (currentSizeKB >= targetSizeKB * 0.9 && currentSizeKB <= targetSizeKB * 1.1) {
      break;
    }

    // Eğer çok büyükse kaliteyi düşür
    if (currentSizeKB > targetSizeKB * 1.1) {
      quality = Math.max(30, quality - 5);
    } else {
      // Eğer çok küçükse kaliteyi artır (ama hedefin altında kal)
      quality = Math.min(70, quality + 3);
    }

    attempts++;
  }

  const savings = beforeSize - currentSize;
  const savingsPercent = (savings / beforeSize) * 100;

  console.log(`   ✅ Tamamlandı: ${(currentSize / 1024).toFixed(2)} KB`);
  console.log(`   📉 Kazanım: ${(savings / 1024).toFixed(2)} KB (${savingsPercent.toFixed(1)}%)\n`);
}

async function main() {
  const hero2Source = join(PUBLIC_DIR, 'hero2.png');
  const hero2Target = join(PUBLIC_DIR, 'hero2.webp');
  const hero3Source = join(PUBLIC_DIR, 'hero3.png');
  const hero3Target = join(PUBLIC_DIR, 'hero3.webp');

  try {
    await compressHeroImage(hero2Source, hero2Target, 100);
    await compressHeroImage(hero3Source, hero3Target, 100);
    console.log('✅ Tüm hero görselleri sıkıştırıldı!');
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

main();

