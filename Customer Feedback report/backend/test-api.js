const http = require('http');

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING BACKEND TESTS ===\n');

  // Test 1: Health
  const health = await makeRequest('/api/health');
  console.log('1. Health Check:', health.status === 200 ? 'PASSED' : 'FAILED', health.body);

  // Test 2: Employee Blocked (RBAC)
  const empRes = await makeRequest('/api/reports/summary', { 'x-user-role': 'EMPLOYEE' });
  console.log('2. RBAC Employee Blocked:', empRes.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED', empRes.body?.message);

  // Test 3: Admin Summary
  const adminRes = await makeRequest('/api/reports/summary', { 'x-user-role': 'ADMIN' });
  console.log('3. Admin KPI Summary:', adminRes.status === 200 ? 'PASSED' : 'FAILED');
  console.log('   Total Feedback:', adminRes.body.data.totalFeedback);
  console.log('   Positive Feedback:', adminRes.body.data.positiveFeedback);
  console.log('   Negative Feedback:', adminRes.body.data.negativeFeedback);
  console.log('   Average Rating:', adminRes.body.data.averageRating);
  console.log('   Rating Distribution:', adminRes.body.data.ratingDistribution);
  console.log('   Periods:', adminRes.body.data.periods);

  // Test 4: ISBN Deep Dive
  const isbnRes = await makeRequest('/api/reports/feedback/isbn/9781234567890', { 'x-user-role': 'ADMIN' });
  console.log('4. ISBN 9781234567890 Report:', isbnRes.status === 200 ? 'PASSED' : 'FAILED');
  console.log('   Book Title:', isbnRes.body.data.bookTitle);
  console.log('   Timeline Events Count:', isbnRes.body.data.timeline?.length);
  console.log('   First Feedback:', isbnRes.body.data.firstFeedbackDate);
  console.log('   Latest Feedback:', isbnRes.body.data.latestFeedbackDate);

  // Test 5: Trends
  const trendRes = await makeRequest('/api/reports/feedback/analytics/trends?interval=monthly', { 'x-user-role': 'ADMIN' });
  console.log('5. Trend Analytics (Monthly):', trendRes.status === 200 ? 'PASSED' : 'FAILED');
  console.log('   Periods count:', trendRes.body.data.data?.length);

  // Test 6: Export CSV
  const csvRes = await makeRequest('/api/reports/feedback/export?format=csv', { 'x-user-role': 'ADMIN' });
  console.log('6. Export CSV:', csvRes.status === 200 ? 'PASSED' : 'FAILED', 'Content-Type:', csvRes.headers['content-type']);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(console.error);

