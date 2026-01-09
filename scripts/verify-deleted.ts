/**
 * Script to verify deleted photos in production
 * Calls the API to check if deleted photos are stored correctly
 */

async function verifyDeleted() {
  console.log('🔍 Verifying deleted photos in production...\n');

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://markalar-dunyasi.vercel.app';

  try {
    // Check salon deleted photos
    console.log('📋 Checking salon deleted photos...');
    const salonResponse = await fetch(`${baseUrl}/api/yeliz-samet/deleted?albumSlug=salon`, {
      cache: 'no-store',
    });
    
    if (!salonResponse.ok) {
      throw new Error(`Salon API error: ${salonResponse.status}`);
    }
    
    const salonData = await salonResponse.json();
    console.log(`   ✅ Salon deleted: ${salonData.deleted?.length || 0} photos`);
    
    if (salonData.deleted && salonData.deleted.length > 0) {
      console.log('   First 5 deleted salon photos:');
      salonData.deleted.slice(0, 5).forEach((f: string) => console.log(`     - ${f}`));
    }
    console.log('');

    // Check yat deleted photos
    console.log('📋 Checking yat deleted photos...');
    const yatResponse = await fetch(`${baseUrl}/api/yeliz-samet/deleted?albumSlug=yat`, {
      cache: 'no-store',
    });
    
    if (!yatResponse.ok) {
      throw new Error(`Yat API error: ${yatResponse.status}`);
    }
    
    const yatData = await yatResponse.json();
    console.log(`   ✅ Yat deleted: ${yatData.deleted?.length || 0} photos`);
    
    if (yatData.deleted && yatData.deleted.length > 0) {
      console.log('   First 5 deleted yat photos:');
      yatData.deleted.slice(0, 5).forEach((f: string) => console.log(`     - ${f}`));
    }
    console.log('');

    // Summary
    const totalDeleted = (salonData.deleted?.length || 0) + (yatData.deleted?.length || 0);
    console.log('📊 Summary:');
    console.log(`   Total deleted photos: ${totalDeleted}`);
    console.log(`   Salon: ${salonData.deleted?.length || 0}`);
    console.log(`   Yat: ${yatData.deleted?.length || 0}\n`);

    if (totalDeleted === 71) {
      console.log('✅ SUCCESS: All 71 deleted photos are stored correctly!\n');
    } else if (totalDeleted === 0) {
      console.log('⚠️  WARNING: No deleted photos found. Migration may not have run yet.\n');
      console.log('   Run migration:');
      console.log(`   curl -X POST ${baseUrl}/api/yeliz-samet/migrate-deleted \\`);
      console.log('     -H "Authorization: Bearer migration-secret-2025"\n');
    } else {
      console.log(`⚠️  WARNING: Expected 71 deleted photos, found ${totalDeleted}\n`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('fetch')) {
      console.log('\n💡 Tip: Make sure the production URL is correct and accessible.\n');
    }
    process.exit(1);
  }
}

verifyDeleted();
