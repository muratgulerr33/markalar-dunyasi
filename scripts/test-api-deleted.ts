/**
 * Test API endpoint to verify deleted photos
 */

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');

  try {
    // Test salon deleted photos
    const salonResponse = await fetch('http://localhost:3000/api/yeliz-samet/deleted?albumSlug=salon');
    const salonData = await salonResponse.json();
    console.log('📋 Salon Deleted Photos (from API):');
    console.log(`   Count: ${salonData.deleted?.length || 0}`);
    if (salonData.deleted && salonData.deleted.length > 0) {
      console.log('   First 10:');
      salonData.deleted.slice(0, 10).forEach((f: string) => console.log(`     - ${f}`));
    }
    console.log('');

    // Test yat deleted photos
    const yatResponse = await fetch('http://localhost:3000/api/yeliz-samet/deleted?albumSlug=yat');
    const yatData = await yatResponse.json();
    console.log('📋 Yat Deleted Photos (from API):');
    console.log(`   Count: ${yatData.deleted?.length || 0}`);
    if (yatData.deleted && yatData.deleted.length > 0) {
      console.log('   First 10:');
      yatData.deleted.slice(0, 10).forEach((f: string) => console.log(`     - ${f}`));
    }
    console.log('');

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Dev server is not running. Please start it with: npm run dev');
      console.log('   Then run this script again.\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAPI();
