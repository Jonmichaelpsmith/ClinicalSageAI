/**
 * eSTAR Package Builder Service
 * 
 * This service handles the construction and validation of FDA eSTAR submission packages
 * for 510(k) clearance applications. It provides utilities for assembling documents,
 * creating XML manifests, and validating package completeness.
 */

import { v4 as uuidv4 } from 'crypto';

class ESTARPackageBuilder {
  /**
   * Create a properly formatted XML manifest for an eSTAR package
   * 
   * @param {Object} metadata - Package metadata
   * @param {string} metadata.submissionId - The submission ID
   * @param {string} metadata.manufacturerName - Name of the manufacturer
   * @param {string} metadata.deviceName - Name of the device
   * @param {Array} files - List of files in the package
   * @returns {string} - XML manifest
   */
  generateXMLManifest(metadata, files) {
    const { submissionId, manufacturerName, deviceName } = metadata;
    const submissionDate = new Date().toISOString().split('T')[0];
    const manifestId = uuidv4();
    
    let fileEntries = '';
    files.forEach(file => {
      const fileId = uuidv4();
      fileEntries += `
        <file id="${fileId}">
          <fileName>${file.name}</fileName>
          <fileType>${file.type}</fileType>
          <fileSize>${file.size}</fileSize>
          <filePath>${file.path || ''}</filePath>
          <sectionReference>${file.section || ''}</sectionReference>
        </file>
      `;
    });
    
    const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<estarSubmission xmlns="http://www.fda.gov/estar/schema/1.0">
  <manifestMetadata>
    <manifestId>${manifestId}</manifestId>
    <submissionId>${submissionId}</submissionId>
    <submissionType>Traditional 510(k)</submissionType>
    <submissionDate>${submissionDate}</submissionDate>
    <manufacturerName>${manufacturerName}</manufacturerName>
    <deviceName>${deviceName}</deviceName>
    <version>1.0</version>
  </manifestMetadata>
  <files>
    ${fileEntries}
  </files>
  <digitalSignature>
    <signatureId>${uuidv4()}</signatureId>
    <signatureMethod>RSA-SHA256</signatureMethod>
    <certificate>Base64EncodedCertificateWouldGoHere</certificate>
    <signedInfo>
      <canonicalizationMethod>http://www.w3.org/2001/10/xml-exc-c14n#</canonicalizationMethod>
      <signatureMethod>http://www.w3.org/2001/04/xmldsig-more#rsa-sha256</signatureMethod>
      <reference>
        <digestMethod>http://www.w3.org/2001/04/xmlenc#sha256</digestMethod>
        <digestValue>DigestValueWouldGoHere</digestValue>
      </reference>
    </signedInfo>
    <signatureValue>Base64EncodedSignatureWouldGoHere</signatureValue>
  </digitalSignature>
</estarSubmission>`;
    
    return manifest;
  }
  
  /**
   * Validate an eSTAR package for completeness
   * 
   * @param {Object} package - The eSTAR package object
   * @returns {Object} - Validation result with issues list
   */
  validatePackage(package) {
    const requiredSections = [
      'Administrative Information',
      'Device Description',
      'Substantial Equivalence',
      'Performance Testing',
      'Sterilization/Shelf-life',
      'Biocompatibility',
      'Software',
      'Declarations and Certifications'
    ];
    
    const issues = [];
    const presentSections = new Set();
    
    // Check which sections are present in the package
    package.files.forEach(file => {
      const section = file.section || '';
      presentSections.add(section);
    });
    
    // Find missing required sections
    requiredSections.forEach(section => {
      if (!presentSections.has(section)) {
        issues.push({
          severity: 'critical',
          message: `Required section "${section}" is missing from the package`,
          recommendation: `Add documentation for the "${section}" section`
        });
      }
    });
    
    // Check for digital signature
    if (!package.manifest.includes('<digitalSignature>')) {
      issues.push({
        severity: 'critical',
        message: 'Digital signature is missing',
        recommendation: 'Digitally sign the package before submission'
      });
    }
    
    // Check file sizes
    let totalSize = 0;
    package.files.forEach(file => {
      totalSize += file.size;
      if (file.size > 100 * 1024 * 1024) { // 100 MB
        issues.push({
          severity: 'warning',
          message: `File "${file.name}" exceeds 100 MB`,
          recommendation: 'Consider optimizing file size or splitting into multiple files'
        });
      }
    });
    
    // Check total package size
    if (totalSize > 1 * 1024 * 1024 * 1024) { // 1 GB
      issues.push({
        severity: 'warning',
        message: 'Total package size exceeds 1 GB',
        recommendation: 'Consider optimizing file sizes to improve submission processing'
      });
    }
    
    return {
      valid: issues.filter(issue => issue.severity === 'critical').length === 0,
      issues,
      totalIssues: issues.length,
      criticalIssues: issues.filter(issue => issue.severity === 'critical').length,
      warnings: issues.filter(issue => issue.severity === 'warning').length
    };
  }
  
  /**
   * Generate a cover letter for an eSTAR package
   * 
   * @param {Object} metadata - Metadata for the cover letter
   * @param {string} metadata.manufacturerName - Name of the manufacturer
   * @param {string} metadata.deviceName - Name of the device
   * @param {string} metadata.contactName - Name of the contact person
   * @param {string} metadata.contactEmail - Email of the contact person
   * @param {string} metadata.contactPhone - Phone number of the contact person
   * @returns {string} - Cover letter content
   */
  generateCoverLetter(metadata) {
    const { 
      manufacturerName, 
      deviceName, 
      contactName, 
      contactEmail, 
      contactPhone 
    } = metadata;
    
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const coverLetter = `
${date}

Food and Drug Administration
Center for Devices and Radiological Health
Document Control Center - WO66-G609
10903 New Hampshire Avenue
Silver Spring, MD 20993-0002

Re: 510(k) Submission for ${deviceName}

To whom it may concern:

On behalf of ${manufacturerName}, I am pleased to submit this 510(k) premarket notification for ${deviceName}. This submission has been prepared in accordance with the FDA's eSTAR program requirements.

The attached eSTAR package contains all the required documentation to demonstrate substantial equivalence to legally marketed predicate devices. We believe that the information provided in this submission is sufficient to support FDA clearance of the ${deviceName}.

If you have any questions or require additional information during the review of this submission, please do not hesitate to contact me:

${contactName}
${manufacturerName}
Email: ${contactEmail}
Phone: ${contactPhone}

Sincerely,

${contactName}
${manufacturerName}
    `;
    
    return coverLetter;
  }
  
  /**
   * Create a declaration of conformity document
   * 
   * @param {Object} metadata - Metadata for the declaration
   * @param {string} metadata.manufacturerName - Name of the manufacturer
   * @param {string} metadata.deviceName - Name of the device
   * @param {Array} standards - List of standards the device conforms to
   * @returns {string} - Declaration of conformity content
   */
  generateDeclarationOfConformity(metadata, standards) {
    const { manufacturerName, deviceName } = metadata;
    
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let standardsList = '';
    standards.forEach(standard => {
      standardsList += `• ${standard}\n`;
    });
    
    const declaration = `
DECLARATION OF CONFORMITY

Manufacturer: ${manufacturerName}
Device Name: ${deviceName}
Date: ${date}

We hereby declare that the above-referenced medical device conforms to the following standards:

${standardsList}

This declaration of conformity is issued under the sole responsibility of the manufacturer.

Signed on behalf of ${manufacturerName}:

______________________________
Authorized Representative
${manufacturerName}
    `;
    
    return declaration;
  }
}

// Create and export a singleton instance
const estarPackageBuilder = new ESTARPackageBuilder();
export default estarPackageBuilder;