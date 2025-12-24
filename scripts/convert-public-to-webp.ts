import sharp from 'sharp';
import { glob } from 'fast-glob';
import { stat, existsSync } from 'fs';
import { promisify } from 'util';
import { join, dirname, extname, basename } from 'path';
import chokidar from 'chokidar';

const statAsync = promisify(stat);

const PUBLIC_DIR = 'public';

interface ConversionStats {
  converted: number;
  skipped: number;
  errors: number;
  totalBefore: number;
  totalAfter: number;
  files: Array<{
    file: string;
    before: number;
    after: number;
    savings: number;
    savingsPercent: number;
    status: 'converted' | 'skipped' | 'error';
    error?: string;
  }>;
}

async function shouldSkipConversion(
  sourcePath: string,
  targetPath: string
): Promise<boolean> {
  if (!existsSync(targetPath)) {
    return false;
  }

  try {
    const sourceStat = await statAsync(sourcePath);
    const targetStat = await statAsync(targetPath);

    // Eğer hedef dosya kaynak dosyadan daha yeni ise skip
    return targetStat.mtime > sourceStat.mtime;
  } catch {
    return false;
  }
}

async function convertToWebP(
  sourcePath: string,
  targetPath: string,
  dryRun: boolean
): Promise<{ before: number; after: number } | null> {
  const sourceExt = extname(sourcePath).toLowerCase();
  const isPNG = sourceExt === '.png';
  const isJPG = sourceExt === '.jpg' || sourceExt === '.jpeg';

  if (!isPNG && !isJPG) {
    return null;
  }

  const beforeSize = (await statAsync(sourcePath)).size;

  if (dryRun) {
    return { before: beforeSize, after: beforeSize };
  }

  let sharpInstance = sharp(sourcePath).rotate().withMetadata();

  // Büyük dosyalar için özel işlem (5MB'dan büyükse)
  const isLargeFile = beforeSize > 5 * 1024 * 1024; // 5MB
  
  // Çok büyük dosyalar için resize yap (maksimum 1000px genişlik)
  if (isLargeFile) {
    sharpInstance = sharpInstance.resize(1000, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }
  
  // Maksimum sıkıştırma için lossy WebP kullan - hedef 100-150 KB
  // Büyük dosyalar için daha agresif sıkıştırma (kalite 55)
  const quality = isLargeFile ? 55 : 65;
  
  if (isPNG) {
    sharpInstance = sharpInstance.webp({ 
      quality,
      effort: 6,
      smartSubsample: true,
      nearLossless: false,
    });
  } else {
    // JPG için agresif sıkıştırma
    sharpInstance = sharpInstance.webp({
      quality,
      effort: 6,
      smartSubsample: true,
    });
  }

  await sharpInstance.toFile(targetPath);
  const afterSize = (await statAsync(targetPath)).size;

  return { before: beforeSize, after: afterSize };
}

async function processFiles(
  dryRun: boolean = false
): Promise<ConversionStats> {
  const stats: ConversionStats = {
    converted: 0,
    skipped: 0,
    errors: 0,
    totalBefore: 0,
    totalAfter: 0,
    files: [],
  };

  const imageFiles = await glob('**/*.{jpg,jpeg,png}', {
    cwd: PUBLIC_DIR,
    absolute: false,
  });

  console.log(`\n📸 ${imageFiles.length} görsel dosyası bulundu\n`);

  for (const file of imageFiles) {
    const sourcePath = join(PUBLIC_DIR, file);
    const ext = extname(file);
    const baseName = basename(file, ext);
    const dir = dirname(file);
    const targetPath = join(
      PUBLIC_DIR,
      dir === '.' ? `${baseName}.webp` : join(dir, `${baseName}.webp`)
    );

    try {
      const shouldSkip = await shouldSkipConversion(sourcePath, targetPath);

      if (shouldSkip) {
        const beforeSize = (await statAsync(sourcePath)).size;
        const afterSize = existsSync(targetPath)
          ? (await statAsync(targetPath)).size
          : beforeSize;
        const savings = beforeSize - afterSize;
        const savingsPercent =
          beforeSize > 0 ? (savings / beforeSize) * 100 : 0;

        stats.skipped++;
        stats.totalBefore += beforeSize;
        stats.totalAfter += afterSize;
        stats.files.push({
          file,
          before: beforeSize,
          after: afterSize,
          savings,
          savingsPercent,
          status: 'skipped',
        });

        console.log(`⏭️  SKIP: ${file} (hedef daha yeni)`);
        continue;
      }

      const result = await convertToWebP(sourcePath, targetPath, dryRun);

      if (result === null) {
        continue;
      }

      const { before, after } = result;
      const savings = before - after;
      const savingsPercent = before > 0 ? (savings / before) * 100 : 0;

      stats.converted++;
      stats.totalBefore += before;
      stats.totalAfter += after;
      stats.files.push({
        file,
        before,
        after,
        savings,
        savingsPercent,
        status: dryRun ? 'skipped' : 'converted',
      });

      if (dryRun) {
        console.log(
          `🔍 DRY-RUN: ${file} → ${basename(targetPath)} (${(before / 1024).toFixed(2)} KB → ~${(after / 1024).toFixed(2)} KB, ${savingsPercent.toFixed(1)}% kazanım)`
        );
      } else {
        console.log(
          `✅ ${file} → ${basename(targetPath)} (${(before / 1024).toFixed(2)} KB → ${(after / 1024).toFixed(2)} KB, ${savingsPercent.toFixed(1)}% kazanım)`
        );
      }
    } catch (error) {
      stats.errors++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      stats.files.push({
        file,
        before: 0,
        after: 0,
        savings: 0,
        savingsPercent: 0,
        status: 'error',
        error: errorMessage,
      });

      console.error(`❌ HATA: ${file} - ${errorMessage}`);
    }
  }

  return stats;
}

function printSummary(stats: ConversionStats, dryRun: boolean) {
  const totalSavings = stats.totalBefore - stats.totalAfter;
  const totalSavingsPercent =
    stats.totalBefore > 0 ? (totalSavings / stats.totalBefore) * 100 : 0;

  console.log('\n' + '='.repeat(60));
  console.log('📊 DÖNÜŞÜM ÖZETİ');
  console.log('='.repeat(60));
  console.log(`Dönüştürülen: ${stats.converted} dosya`);
  console.log(`Atlanan: ${stats.skipped} dosya`);
  console.log(`Hatalar: ${stats.errors} dosya`);
  console.log(`Toplam: ${stats.files.length} dosya`);
  console.log('\n📦 BOYUT BİLGİLERİ');
  console.log(`Önce: ${(stats.totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Sonra: ${(stats.totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `Kazanım: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${totalSavingsPercent.toFixed(1)}%)`
  );
  console.log('='.repeat(60) + '\n');

  if (stats.files.length > 0) {
    console.log('📋 DOSYA BAZLI RAPOR:\n');
    stats.files.forEach((f) => {
      const statusIcon =
        f.status === 'converted'
          ? '✅'
          : f.status === 'skipped'
            ? '⏭️'
            : '❌';
      console.log(
        `${statusIcon} ${f.file}: ${(f.before / 1024).toFixed(2)} KB → ${(f.after / 1024).toFixed(2)} KB (${f.savingsPercent.toFixed(1)}% kazanım)${f.error ? ` - HATA: ${f.error}` : ''}`
      );
    });
    console.log('');
  }
}

async function watchMode() {
  console.log('👀 Watch modu aktif - public/ klasörü izleniyor...\n');

  const watcher = chokidar.watch('**/*.{jpg,jpeg,png}', {
    cwd: PUBLIC_DIR,
    ignored: /node_modules/,
    persistent: true,
  });

  watcher.on('add', async (file) => {
    console.log(`\n🆕 Yeni dosya tespit edildi: ${file}`);
    await processSingleFile(join(PUBLIC_DIR, file), false);
  });

  watcher.on('change', async (file) => {
    console.log(`\n🔄 Dosya değişti: ${file}`);
    await processSingleFile(join(PUBLIC_DIR, file), false);
  });

  process.on('SIGINT', () => {
    console.log('\n\n👋 Watch modu kapatılıyor...');
    watcher.close();
    process.exit(0);
  });
}

async function processSingleFile(
  sourcePath: string,
  dryRun: boolean
): Promise<void> {
  const ext = extname(sourcePath).toLowerCase();
  const isPNG = ext === '.png';
  const isJPG = ext === '.jpg' || ext === '.jpeg';

  if (!isPNG && !isJPG) {
    return;
  }

  const file = sourcePath.replace(PUBLIC_DIR + '/', '');
  const baseName = basename(sourcePath, ext);
  const dir = dirname(file);
  const targetPath = join(
    PUBLIC_DIR,
    dir === '.' ? `${baseName}.webp` : join(dir, `${baseName}.webp`)
  );

  try {
    const shouldSkip = await shouldSkipConversion(sourcePath, targetPath);

    if (shouldSkip) {
      console.log(`⏭️  SKIP: ${file} (hedef daha yeni)`);
      return;
    }

    const result = await convertToWebP(sourcePath, targetPath, dryRun);

    if (result === null) {
      return;
    }

    const { before, after } = result;
    const savings = before - after;
    const savingsPercent = before > 0 ? (savings / before) * 100 : 0;

    if (dryRun) {
      console.log(
        `🔍 DRY-RUN: ${file} → ${basename(targetPath)} (${(before / 1024).toFixed(2)} KB → ~${(after / 1024).toFixed(2)} KB, ${savingsPercent.toFixed(1)}% kazanım)`
      );
    } else {
      console.log(
        `✅ ${file} → ${basename(targetPath)} (${(before / 1024).toFixed(2)} KB → ${(after / 1024).toFixed(2)} KB, ${savingsPercent.toFixed(1)}% kazanım)`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ HATA: ${file} - ${errorMessage}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const watch = args.includes('--watch');

  if (dryRun) {
    console.log('🔍 DRY-RUN modu: Dosyalar dönüştürülmeyecek, sadece rapor gösterilecek\n');
  }

  if (watch) {
    // İlk çalıştırmada tüm dosyaları işle
    const stats = await processFiles(dryRun);
    printSummary(stats, dryRun);
    // Sonra watch moduna geç
    await watchMode();
  } else {
    const stats = await processFiles(dryRun);
    printSummary(stats, dryRun);
  }
}

main().catch((error) => {
  console.error('❌ Kritik hata:', error);
  process.exit(1);
});

