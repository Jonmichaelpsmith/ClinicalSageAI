/**
 * Test script for multi-source API
 */

async function testMultiApi() {
  try {
    console.log('Testing /api/narrative/multi endpoint...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('http://localhost:3500/api/narrative/multi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ndc_codes: ['00002-3227'],
        device_codes: [],
        periods: 1
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response size:', JSON.stringify(data).length, 'bytes');
      console.log('Response contains narrative:', !!data.narrative);
      console.log('Narrative length:', data.narrative?.length || 0);
      if (data.narrative?.length > 0) {
        console.log('Narrative preview:', data.narrative.substring(0, 100) + '...');
      }
    } else {
      console.error('Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testMultiApi();