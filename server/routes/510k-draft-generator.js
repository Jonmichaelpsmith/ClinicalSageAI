/**
 * 510(k) Draft Generator API
 * 
 * Handles the generation of complete 510(k) submission draft documents
 * based on device profiles and predicate comparisons.
 */

const express = require('express');
const router = express.Router();
const { generateDocx } = require('../services/wordGenerationService');
const { generatePdf } = require('../services/pdfGenerationService');

/**
 * Generate a complete 510(k) draft document
 * POST /api/510k/generate-draft
 */
router.post('/generate-draft', async (req, res) => {
  try {
    const { deviceProfile, predicateDevices, format = 'docx' } = req.body;
    
    if (!deviceProfile || !predicateDevices || predicateDevices.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required data - device profile and predicates are required'
      });
    }
    
    // Generate content structure for the 510(k) document
    const documentContent = await generate510kContent(deviceProfile, predicateDevices);
    
    // Generate the requested document format
    let result;
    if (format === 'docx') {
      result = await generateDocx(documentContent, `510k-${deviceProfile.deviceName.replace(/\s+/g, '-')}.docx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="510k-draft.docx"`);
      return res.send(result);
    } else if (format === 'pdf') {
      result = await generatePdf(documentContent, `510k-${deviceProfile.deviceName.replace(/\s+/g, '-')}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="510k-draft.pdf"`);
      return res.send(result);
    } else {
      // If format is not recognized, return JSON
      return res.json({ documentContent });
    }
  } catch (error) {
    console.error('Error generating 510(k) draft:', error);
    return res.status(500).json({ 
      error: 'Failed to generate document',
      details: error.message
    });
  }
});

/**
 * Generate structured content for a 510(k) submission
 */
async function generate510kContent(deviceProfile, predicateDevices) {
  // Create document sections structure
  const content = {
    title: `510(k) PREMARKET NOTIFICATION`,
    subtitle: `${deviceProfile.deviceName}`,
    sections: [
      {
        title: "ADMINISTRATIVE INFORMATION",
        content: [
          {
            heading: "Device Common Name",
            text: deviceProfile.commonName || `${deviceProfile.deviceName} ${deviceProfile.deviceType || ''}`
          },
          {
            heading: "Device Classification",
            text: `Class ${deviceProfile.deviceClass || 'II'}`
          },
          {
            heading: "Manufacturer",
            text: deviceProfile.manufacturer || 'Not specified'
          },
          {
            heading: "Submission Type",
            text: "Traditional 510(k)"
          }
        ]
      },
      {
        title: "DEVICE DESCRIPTION",
        content: [
          {
            heading: "Intended Use",
            text: deviceProfile.intendedUse || "The device is intended for [INTENDED USE STATEMENT]."
          },
          {
            heading: "Indications for Use",
            text: deviceProfile.indications || "This device is indicated for use in [INDICATIONS FOR USE]."
          },
          {
            heading: "Device Components",
            text: deviceProfile.components || "The device consists of the following components: [COMPONENT LIST]."
          },
          {
            heading: "Principles of Operation",
            text: deviceProfile.operation || "The device operates by [PRINCIPLES OF OPERATION]."
          }
        ]
      },
      {
        title: "SUBSTANTIAL EQUIVALENCE",
        content: [
          {
            heading: "Predicate Device(s)",
            text: predicateDevices.map(p => 
              `${p.name || 'Predicate Device'} (510(k) Number: ${p.k_number || 'Not Available'})`
            ).join('\\n')
          },
          {
            heading: "Comparison Table",
            table: {
              headers: ["Feature", "Subject Device", "Predicate Device", "Substantial Equivalence"],
              rows: generateComparisonRows(deviceProfile, predicateDevices[0] || {})
            }
          },
          {
            heading: "Discussion of Differences",
            text: "The subject device and predicate device(s) have the following differences: [DIFFERENCES DISCUSSION]."
          }
        ]
      },
      {
        title: "PERFORMANCE DATA",
        content: [
          {
            heading: "Non-Clinical Testing Summary",
            text: "The following non-clinical tests were conducted: [LIST OF NON-CLINICAL TESTS]."
          },
          {
            heading: "Clinical Testing Summary",
            text: deviceProfile.clinicalData || "No clinical testing was conducted for this device as it is not required."
          },
          {
            heading: "Standards Compliance",
            text: "This device complies with the following standards: [LIST OF STANDARDS]."
          }
        ]
      },
      {
        title: "CONCLUSION",
        content: [
          {
            text: `The ${deviceProfile.deviceName} is substantially equivalent to the predicate device(s) and does not raise different questions of safety and effectiveness.`
          }
        ]
      }
    ],
    footer: {
      text: "FDA 510(k) Submission Draft - Generated via TrialSage™ Platform",
      pageNumbers: true
    }
  };
  
  return content;
}

/**
 * Generate comparison rows for the substantial equivalence table
 */
function generateComparisonRows(deviceProfile, predicateDevice) {
  const comparisonFeatures = [
    { feature: "Intended Use", subject: deviceProfile.intendedUse, predicate: predicateDevice.intendedUse },
    { feature: "Indications for Use", subject: deviceProfile.indications, predicate: predicateDevice.indications },
    { feature: "Technology", subject: deviceProfile.technology, predicate: predicateDevice.technology },
    { feature: "Materials", subject: deviceProfile.materials, predicate: predicateDevice.materials },
    { feature: "Energy Source", subject: deviceProfile.energySource, predicate: predicateDevice.energySource },
    { feature: "Performance", subject: deviceProfile.performance, predicate: predicateDevice.performance },
    { feature: "Sterilization", subject: deviceProfile.sterilization, predicate: predicateDevice.sterilization },
    { feature: "Biocompatibility", subject: deviceProfile.biocompatibility, predicate: predicateDevice.biocompatibility },
    { feature: "Standards Met", subject: deviceProfile.standards, predicate: predicateDevice.standards }
  ];
  
  return comparisonFeatures.map(item => {
    const subjectValue = item.subject || "Information not provided";
    const predicateValue = item.predicate || "Information not provided";
    
    // Determine substantial equivalence based on feature comparison
    let equivalence = "Yes";
    if (!item.subject && !item.predicate) {
      equivalence = "Unknown (insufficient data)";
    } else if (!item.subject || !item.predicate) {
      equivalence = "Unknown (incomplete data)";
    } else if (typeof item.subject === 'string' && typeof item.predicate === 'string') {
      if (item.subject.toLowerCase() !== item.predicate.toLowerCase()) {
        equivalence = "No (different specifications)";
      }
    }
    
    return [item.feature, subjectValue, predicateValue, equivalence];
  });
}

module.exports = router;