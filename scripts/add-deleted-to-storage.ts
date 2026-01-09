/**
 * Script to add deleted photos to deleted storage
 * Reads deleted photos from git commit and adds them to storage
 */

import { deletedStorage } from '../lib/yeliz-samet-deleted-storage';
import { execSync } from 'child_process';

async function addDeletedPhotos() {
  console.log('🔄 Adding deleted photos to storage...\n');

  try {
    // Get all deleted photos from the commit
    const deletedFiles = execSync(
      'git show be2e6a4 --name-only --pretty=format: | grep "\\.webp$"',
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0);

    console.log(`📋 Found ${deletedFiles.length} deleted photos in commit be2e6a4\n`);

    // Separate salon and yat photos
    const salonPhotos: string[] = [];
    const yatPhotos: string[] = [];

    deletedFiles.forEach(file => {
      const filename = file.split('/').pop() || file;
      if (file.includes('salon-foto')) {
        salonPhotos.push(filename);
      } else if (file.includes('yat-foto')) {
        yatPhotos.push(filename);
      }
    });

    console.log(`   Salon: ${salonPhotos.length} photos`);
    console.log(`   Yat: ${yatPhotos.length} photos\n`);

    // Add to storage
    if (salonPhotos.length > 0) {
      console.log('📝 Adding salon photos to storage...');
      await deletedStorage.addMany('salon', salonPhotos);
      console.log(`   ✅ Added ${salonPhotos.length} salon photos\n`);
    }

    if (yatPhotos.length > 0) {
      console.log('📝 Adding yat photos to storage...');
      await deletedStorage.addMany('yat', yatPhotos);
      console.log(`   ✅ Added ${yatPhotos.length} yat photos\n`);
    }

    // Verify
    console.log('🔍 Verifying...');
    const deletedSalon = await deletedStorage.get('salon');
    const deletedYat = await deletedStorage.get('yat');
    
    console.log(`   Salon deleted: ${deletedSalon.length} photos`);
    console.log(`   Yat deleted: ${deletedYat.length} photos\n`);

    if (deletedSalon.length === salonPhotos.length && deletedYat.length === yatPhotos.length) {
      console.log('✅ SUCCESS: All deleted photos added to storage!\n');
    } else {
      console.log('⚠️  WARNING: Count mismatch!');
      console.log(`   Expected salon: ${salonPhotos.length}, got: ${deletedSalon.length}`);
      console.log(`   Expected yat: ${yatPhotos.length}, got: ${deletedYat.length}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDeletedPhotos();
