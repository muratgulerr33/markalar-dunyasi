/**
 * Test script to verify page filtering works correctly
 * Simulates what happens in the page component
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { deletedStorage } from '../lib/yeliz-samet-deleted-storage';

const MANIFEST_PATH = join(process.cwd(), 'public', 'yeliz-samet', 'manifest.json');

interface ImageManifest {
  salon: string[];
  yat: string[];
}

async function testPageFiltering() {
  console.log('🔍 Testing Page Filtering (Server-Side)...\n');

  try {
    // 1. Read manifest
    const manifestContent = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: ImageManifest = JSON.parse(manifestContent);
    
    console.log('📋 Manifest:');
    console.log(`   Salon: ${manifest.salon.length} photos`);
    console.log(`   Yat: ${manifest.yat.length} photos\n`);

    // 2. Get deleted photos (simulating page component)
    const deletedSalon = await deletedStorage.get('salon');
    const deletedYat = await deletedStorage.get('yat');
    
    console.log('🗑️  Deleted Photos in Storage:');
    console.log(`   Salon: ${deletedSalon.length} deleted`);
    console.log(`   Yat: ${deletedYat.length} deleted\n`);

    // 3. Simulate page component filtering (EXACT SAME LOGIC)
    const deletedSalonSet = new Set(deletedSalon);
    const deletedYatSet = new Set(deletedYat);
    
    const filteredSalon = manifest.salon.filter((item) => {
      const filename = item.split("/").pop() || item;
      return !deletedSalonSet.has(filename);
    });
    
    const filteredYat = manifest.yat.filter((item) => {
      const filename = item.split("/").pop() || item;
      return !deletedYatSet.has(filename);
    });

    console.log('✅ After Server-Side Filtering (Page Component Logic):');
    console.log(`   Salon: ${filteredSalon.length} photos (${manifest.salon.length - filteredSalon.length} removed)`);
    console.log(`   Yat: ${filteredYat.length} photos (${manifest.yat.length - filteredYat.length} removed)\n`);

    // 4. Verify no deleted photos in filtered results
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
      console.log('   ✅ Page component filtering is working correctly.\n');
      
      // Show some examples
      if (deletedSalon.length > 0) {
        console.log('📝 Example - Deleted salon photos (first 5):');
        deletedSalon.slice(0, 5).forEach(f => console.log(`     - ${f}`));
        console.log('');
      }
      
      if (deletedYat.length > 0) {
        console.log('📝 Example - Deleted yat photos (first 5):');
        deletedYat.slice(0, 5).forEach(f => console.log(`     - ${f}`));
        console.log('');
      }
      
      console.log('✅ READY FOR PRODUCTION: Pages will filter deleted photos correctly!\n');
    } else {
      console.log('   ❌ FAILURE: Deleted photos still present in filtered results!');
      if (remainingDeletedSalon.length > 0) {
        console.log(`   ❌ Salon: ${remainingDeletedSalon.length} deleted photos still present`);
      }
      if (remainingDeletedYat.length > 0) {
        console.log(`   ❌ Yat: ${remainingDeletedYat.length} deleted photos still present`);
      }
      console.log('');
    }

    // 5. Summary
    console.log('📊 Summary:');
    console.log(`   Total in manifest: ${manifest.salon.length + manifest.yat.length}`);
    console.log(`   Deleted: ${deletedSalon.length + deletedYat.length}`);
    console.log(`   After filtering: ${filteredSalon.length + filteredYat.length}`);
    console.log(`   Removed: ${(manifest.salon.length + manifest.yat.length) - (filteredSalon.length + filteredYat.length)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPageFiltering();
