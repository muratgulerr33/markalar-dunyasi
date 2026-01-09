/**
 * Migration script to add deleted photos to Redis
 * This script reads deleted photos from git and adds them via API
 * Run this script after deployment to populate Redis with deleted photos
 * 
 * Usage: 
 *   KV_REDIS_URL=your_redis_url npx tsx scripts/migrate-deleted-to-redis.ts
 *   Or set environment variable in Vercel and run via API
 */

import { deletedStorage } from '../lib/yeliz-samet-deleted-storage';
import { execSync } from 'child_process';

async function migrateDeletedPhotos() {
  console.log('🔄 Migrating deleted photos to Redis...\n');

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

    // Check if Redis is available
    const redisUrl = process.env.KV_REDIS_URL || process.env.REDIS_URL || process.env.VERCEL_REDIS_URL;
    if (!redisUrl) {
      console.log('⚠️  WARNING: No Redis URL found. Using in-memory storage.');
      console.log('   Set KV_REDIS_URL, REDIS_URL, or VERCEL_REDIS_URL environment variable.\n');
    } else {
      console.log('✅ Redis URL found, using Redis storage.\n');
    }

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
      console.log('✅ SUCCESS: All deleted photos migrated to storage!\n');
      console.log('📊 Summary:');
      console.log(`   Total deleted photos: ${salonPhotos.length + yatPhotos.length}`);
      console.log(`   Salon: ${salonPhotos.length}`);
      console.log(`   Yat: ${yatPhotos.length}\n`);
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

migrateDeletedPhotos();
