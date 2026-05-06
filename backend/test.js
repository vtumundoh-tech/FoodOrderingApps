// Simple test script
const apiUrl = 'http://localhost:8000';

async function testEndpoints() {
  try {
    console.log('🧪 Testing Backend API...\n');

    // Test 1: Health check
    console.log('1️⃣ Testing /api/health');
    const healthRes = await fetch(`${apiUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health:', JSON.stringify(healthData, null, 2));

    // Test 2: Orders summary
    console.log('\n2️⃣ Testing /api/orders/summary');
    const summaryRes = await fetch(`${apiUrl}/api/orders/summary`);
    const summaryData = await summaryRes.json();
    console.log('✅ Summary:', JSON.stringify(summaryData, null, 2));

    // Test 3: Manual trigger
    console.log('\n3️⃣ Testing /api/trigger/report (POST)');
    const triggerRes = await fetch(`${apiUrl}/api/trigger/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSinceDays: 1 })
    });
    const triggerData = await triggerRes.json();
    console.log('✅ Trigger:', JSON.stringify(triggerData, null, 2));

    console.log('\n✨ All tests passed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testEndpoints();
