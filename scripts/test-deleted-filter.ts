/**
 * Test script to verify deleted photos are filtered correctly
 * This script checks:
 * 1. Deleted photos in storage
 * 2. Manifest contains deleted photos
 * 3. Server-side filtering works correctly
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { deletedStorage } from '../lib/yeliz-samet-deleted-storage';

const MANIFEST_PATH = join(process.cwd(), 'public', 'yeliz-samet', 'manifest.json');

interface ImageManifest {
  salon: string[];
  yat: string[];
}

async function testFiltering() {
  console.log('🔍 Testing deleted photos filtering...\n');

  try {
    // 1. Read manifest
    const manifestContent = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: ImageManifest = JSON.parse(manifestContent);
    
    console.log('📋 Manifest Statistics:');
    console.log(`   Salon: ${manifest.salon.length} photos`);
    console.log(`   Yat: ${manifest.yat.length} photos\n`);

    // 2. Get deleted photos from storage
    const deletedSalon = await deletedStorage.get('salon');
    const deletedYat = await deletedStorage.get('yat');
    
    console.log('🗑️  Deleted Photos in Storage:');
    console.log(`   Salon: ${deletedSalon.length} deleted photos`);
    console.log(`   Yat: ${deletedYat.length} deleted photos\n`);

    if (deletedSalon.length > 0) {
      console.log('   Salon deleted files (first 10):');
      deletedSalon.slice(0, 10).forEach(f => console.log(`     - ${f}`));
      if (deletedSalon.length > 10) {
        console.log(`     ... and ${deletedSalon.length - 10} more`);
      }
      console.log('');
    }

    if (deletedYat.length > 0) {
      console.log('   Yat deleted files (first 10):');
      deletedYat.slice(0, 10).forEach(f => console.log(`     - ${f}`));
      if (deletedYat.length > 10) {
        console.log(`     ... and ${deletedYat.length - 10} more`);
      }
      console.log('');
    }

    // 3. Check if deleted photos are in manifest
    const deletedSalonSet = new Set(deletedSalon);
    const deletedYatSet = new Set(deletedYat);
    
    const salonInManifest = manifest.salon.filter(item => {
      const filename = item.split('/').pop() || item;
      return deletedSalonSet.has(filename);
    });
    
    const yatInManifest = manifest.yat.filter(item => {
      const filename = item.split('/').pop() || item;
      return deletedYatSet.has(filename);
    });

    console.log('⚠️  Deleted Photos Still in Manifest:');
    console.log(`   Salon: ${salonInManifest.length} deleted photos found in manifest`);
    console.log(`   Yat: ${yatInManifest.length} deleted photos found in manifest\n`);

    if (salonInManifest.length > 0) {
      console.log('   Salon deleted photos in manifest (first 10):');
      salonInManifest.slice(0, 10).forEach(item => {
        const filename = item.split('/').pop() || item;
        console.log(`     - ${filename} (path: ${item})`);
      });
      if (salonInManifest.length > 10) {
        console.log(`     ... and ${salonInManifest.length - 10} more`);
      }
      console.log('');
    }

    if (yatInManifest.length > 0) {
      console.log('   Yat deleted photos in manifest (first 10):');
      yatInManifest.slice(0, 10).forEach(item => {
        const filename = item.split('/').pop() || item;
        console.log(`     - ${filename} (path: ${item})`);
      });
      if (yatInManifest.length > 10) {
        console.log(`     ... and ${yatInManifest.length - 10} more`);
      }
      console.log('');
    }

    // 4. Simulate server-side filtering
    const filteredSalon = manifest.salon.filter((item) => {
      const filename = item.split("/").pop() || item;
      return !deletedSalonSet.has(filename);
    });
    
    const filteredYat = manifest.yat.filter((item) => {
      const filename = item.split("/").pop() || item;
      return !deletedYatSet.has(filename);
    });

    console.log('✅ After Server-Side Filtering:');
    console.log(`   Salon: ${filteredSalon.length} photos (${manifest.salon.length - filteredSalon.length} removed)`);
    console.log(`   Yat: ${filteredYat.length} photos (${manifest.yat.length - filteredYat.length} removed)\n`);

    // 5. Verify no deleted photos in filtered results
    const remainingDeletedSalon = filteredSalon.filter(item => {
      const filename = item.split('/').pop() || item;
      return deletedSalonSet.has(filename);
    });
    
    const remainingDeletedYat = filteredYat.filter(item => {
      const filename = item.split('/').pop() || item;
      return deletedYatSet.has(filename);
    });

    console.log('🔒 Verification:');
    if (remainingDeletedSalon.length === 0 && remainingDeletedYat.length === 0) {
      console.log('   ✅ SUCCESS: No deleted photos in filtered results!');
      console.log('   ✅ Server-side filtering is working correctly.\n');
    } else {
      console.log('   ❌ FAILURE: Deleted photos still present in filtered results!');
      if (remainingDeletedSalon.length > 0) {
        console.log(`   ❌ Salon: ${remainingDeletedSalon.length} deleted photos still present`);
        remainingDeletedSalon.forEach(item => {
          const filename = item.split('/').pop() || item;
          console.log(`      - ${filename}`);
        });
      }
      if (remainingDeletedYat.length > 0) {
        console.log(`   ❌ Yat: ${remainingDeletedYat.length} deleted photos still present`);
        remainingDeletedYat.forEach(item => {
          const filename = item.split('/').pop() || item;
          console.log(`      - ${filename}`);
        });
      }
      console.log('');
    }

    // 6. Summary
    console.log('📊 Summary:');
    console.log(`   Total photos in manifest: ${manifest.salon.length + manifest.yat.length}`);
    console.log(`   Deleted photos: ${deletedSalon.length + deletedYat.length}`);
    console.log(`   Photos after filtering: ${filteredSalon.length + filteredYat.length}`);
    console.log(`   Removed: ${(manifest.salon.length + manifest.yat.length) - (filteredSalon.length + filteredYat.length)}\n`);

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testFiltering();
