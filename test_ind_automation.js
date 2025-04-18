/**
 * Test IND Automation Integration
 * 
 * This script tests the connection between the Node.js server and the Python FastAPI microservice.
 */

import { indAutomationService } from './server/ind-automation-service.js';
import fs from 'fs';
import path from 'path';

async function testServiceConnection() {
  console.log("Testing IND Automation Service Connection...");
  
  try {
    // Start the service
    const started = await indAutomationService.startService();
    console.log(`Service started: ${started}`);
    
    if (started) {
      // Get service info
      const info = await indAutomationService.getServiceInfo();
      console.log("Service Info:", JSON.stringify(info, null, 2));
      
      // List projects
      const projects = await indAutomationService.listProjects();
      console.log("Available Projects:", JSON.stringify(projects, null, 2));
      
      // Test generating a document for a project
      if (projects && projects.length > 0) {
        const projectId = projects[0].id;
        console.log(`Testing document generation for project ${projectId}...`);
        
        const documentUrl = await indAutomationService.generateModule3Document(projectId);
        console.log(`Document URL: ${documentUrl}`);
      }
      
      // Test batch generation
      if (projects && projects.length >= 2) {
        const projectIds = projects.slice(0, 2).map(p => p.id);
        console.log(`Testing batch document generation for projects: ${projectIds.join(', ')}...`);
        
        const batchResults = await indAutomationService.batchGenerateModule3(projectIds);
        console.log("Batch Results:", JSON.stringify(batchResults, null, 2));
      }
      
      // Test manual data generation
      const testData = {
        drug_name: "Test Compound XYZ",
        manufacturing_site: "Test Manufacturing Site",
        batch_number: "TEST-BATCH-123",
        specifications: [
          {parameter: "Appearance", limit: "White powder", result: "White powder"},
          {parameter: "Purity", limit: ">99%", result: "99.5%"}
        ],
        stability_data: [
          {timepoint: "Initial", result: "99.5%"},
          {timepoint: "3 months", result: "99.0%"}
        ]
      };
      
      console.log("Testing document generation from manual data...");
      const documentBuffer = await indAutomationService.generateModule3FromData(testData);
      
      if (documentBuffer) {
        // Save the document to a file for inspection
        const outputPath = path.join(process.cwd(), 'test_output.docx');
        fs.writeFileSync(outputPath, documentBuffer);
        console.log(`Document saved to ${outputPath}`);
      }
    }
  } catch (error) {
    console.error("Error during testing:", error.message);
  } finally {
    // Stop the service
    indAutomationService.stopService();
    console.log("Service stopped.");
  }
}

testServiceConnection().catch(console.error);