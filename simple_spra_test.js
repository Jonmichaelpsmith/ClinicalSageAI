/**
 * Simple test script to verify the SPRA Direct API functionality
 */

import http from 'http';

// Function to make a POST request to the SPRA analyze endpoint
function testSPRAAnalyze() {
  // Test data
  const protocolData = {
    sample_size: 200,
    duration: 52,
    therapeutic_area: "Oncology",
    phase: "Phase 2",
    randomization: "Double-blind",
    primary_endpoint: "Overall Survival"
  };

  // Prepare request options
  const requestOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/spra/direct-analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(protocolData))
    }
  };

  // Make the request
  const req = http.request(requestOptions, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ SPRA Analysis Successful');
          console.log('Result:', JSON.stringify(result, null, 2));
          
          // Validate key aspects of the result
          if (typeof result.prediction === 'number' && 
              typeof result.best_sample_size === 'number' &&
              typeof result.best_duration === 'number' &&
              result.insights && 
              result.insights.total_trials &&
              result.insights.therapeutic_area) {
            console.log('✅ Result structure validation passed');
          } else {
            console.log('❌ Result structure validation failed');
            console.log('Expected prediction, best_sample_size, best_duration, and insights');
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
        }
      } else {
        console.error(`❌ Request failed with status: ${res.statusCode}`);
        console.error('Response data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });
  
  // Send the data
  req.write(JSON.stringify(protocolData));
  req.end();
}

// Function to check the health of the SPRA API
function testSPRAHealth() {
  // Prepare request options
  const requestOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/spra/direct-health',
    method: 'GET'
  };

  // Make the request
  const req = http.request(requestOptions, (res) => {
    console.log(`Health Check Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ SPRA Health Check Successful');
          console.log('Status:', result.status);
          console.log('Message:', result.message);
          console.log('Timestamp:', result.timestamp);
          
          // Now test the analyze endpoint
          testSPRAAnalyze();
        } catch (error) {
          console.error('❌ Error parsing health check response:', error.message);
        }
      } else {
        console.error(`❌ Health check failed with status: ${res.statusCode}`);
        console.error('Response data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Health check error:', error.message);
  });
  
  req.end();
}

// Run the tests
console.log('🏃 Running SPRA Direct API Tests...');
testSPRAHealth();