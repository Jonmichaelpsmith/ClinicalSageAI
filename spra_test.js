/**
 * SPRA (Strategic Protocol Recommendations Advisor) Test Script
 * 
 * This script tests the functionality of the SPRA API endpoint directly 
 * without relying on the main application startup.
 */

import express from 'express';
import bodyParser from 'body-parser';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Setup database connection
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Import SPRA routes directly from file
import spraRoutes from './server/routes/spra-routes.js';

// Register SPRA routes
app.use('/api/spra', spraRoutes);

// Test SPRA API endpoint
const testSPRA = async () => {
  console.log("Starting SPRA test...");
  
  try {
    // Make a direct database query to verify database connection
    const result = await pool.query('SELECT COUNT(*) as count FROM csr_reports');
    console.log(`Database connected - Total CSR reports: ${result.rows[0].count}`);
    
    // Mock a sample protocol analysis request
    const testProtocol = {
      sample_size: 300,
      duration: 52,
      therapeutic_area: "Oncology",
      phase: "Phase 3",
      randomization: "Simple",
      primary_endpoint: "Clinical"
    };
    
    // Start server
    const port = 5050;
    const server = app.listen(port, () => {
      console.log(`Test server listening on port ${port}`);
      
      // Make a request to the SPRA endpoint
      // Using http module already imported
      
      // Prepare the request options
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/spra/analyze',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(testProtocol))
        }
      };
      
      // Make the request
      const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log('SPRA Response Body:');
          console.log(responseData);
          
          try {
            const parsedResponse = JSON.parse(responseData);
            console.log('Test Result: Success');
            console.log(`Protocol analysis prediction: ${parsedResponse.prediction * 100}%`);
            console.log(`Optimized sample size: ${parsedResponse.best_sample_size}`);
            console.log(`Optimized duration: ${parsedResponse.best_duration} weeks`);
            console.log(`Mean probability with optimization: ${parsedResponse.mean_prob * 100}%`);
            
            // Close server after test
            server.close(() => {
              console.log('Test server closed');
              process.exit(0);
            });
          } catch (e) {
            console.error('Error parsing response:', e);
            server.close(() => {
              console.log('Test server closed');
              process.exit(1);
            });
          }
        });
      });
      
      req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
        server.close(() => {
          console.log('Test server closed');
          process.exit(1);
        });
      });
      
      // Write data to request body
      req.write(JSON.stringify(testProtocol));
      req.end();
    });
  } catch (error) {
    console.error('SPRA Test failed with error:', error);
    process.exit(1);
  }
};

// Run the test
testSPRA();