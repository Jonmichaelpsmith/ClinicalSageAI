import express from 'express';
import { generateMockCER, generateFullCER, getCERReport, analyzeLiteratureWithAI, analyzeAdverseEventsWithAI } from '../services/cerService.js';
import { fetchFaersData, analyzeFaersDataForCER } from '../services/fdaService.js';
import * as faersService from '../services/faersService.js';

// Import enhanced FAERS service
import { fetchFaersAnalysis } from '../services/enhancedFaersService.js';

// Import compliance score module
import { complianceScoreHandler } from './cer/complianceScore.js';

// Import PDF generation libraries
// Note: docx import temporarily commented out to avoid dependency issues
// import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// GET /api/cer/reports - Retrieve user's CER reports
router.get('/reports', async (req, res) => {
  try {
    // TODO: Replace with real DB lookup in production
    const sampleReports = [
      { 
        id: 'CER20250410001', 
        title: 'CardioMonitor Pro 3000 - EU MDR Clinical Evaluation',
        status: 'final',
        deviceName: 'CardioMonitor Pro 3000',
        deviceType: 'Patient Monitoring Device',
        manufacturer: 'MedTech Innovations, Inc.',
        templateUsed: 'EU MDR 2017/745 Full Template',
        generatedAt: '2025-04-10T14:23:45Z',
        lastModified: '2025-04-12T09:15:22Z',
        pageCount: 78,
        wordCount: 28506,
        sections: 14,
        projectId: 'PR-CV-2025-001',
        metadata: {
          includedLiterature: 42,
          includedAdverseEvents: 18,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['EU MDR', 'MEDDEV 2.7/1 Rev 4'],
          generationEngine: 'gpt-4o',
          citationCount: 47,
          qualityScore: 0.94
        }
      },
      {
        id: 'CER20250315002',
        title: 'NeuroPulse Implant - MEDDEV Clinical Evaluation',
        status: 'draft',
        deviceName: 'NeuroPulse Implant',
        deviceType: 'Implantable Medical Device',
        manufacturer: 'Neural Systems Ltd.',
        templateUsed: 'MEDDEV 2.7/1 Rev 4 Template',
        generatedAt: '2025-03-15T10:08:31Z',
        lastModified: '2025-03-15T10:08:31Z',
        pageCount: 64,
        wordCount: 22145,
        sections: 12,
        projectId: 'PR-IM-2025-002',
        metadata: {
          includedLiterature: 35,
          includedAdverseEvents: 12,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['EU MDR', 'MEDDEV 2.7/1 Rev 4'],
          generationEngine: 'gpt-4o',
          citationCount: 38,
          qualityScore: 0.91
        }
      },
      {
        id: 'CER20250329003',
        title: 'LaserScan X500 - FDA 510(k) Clinical Evaluation',
        status: 'final',
        deviceName: 'LaserScan X500',
        deviceType: 'Diagnostic Equipment',
        manufacturer: 'OptiMed Devices, Inc.',
        templateUsed: 'FDA 510(k) Template',
        generatedAt: '2025-03-29T16:42:19Z',
        lastModified: '2025-04-01T11:33:57Z',
        pageCount: 52,
        wordCount: 18230,
        sections: 10,
        projectId: 'PR-DG-2025-003',
        metadata: {
          includedLiterature: 29,
          includedAdverseEvents: 8,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['FDA 510(k)'],
          generationEngine: 'gpt-4o',
          citationCount: 31,
          qualityScore: 0.93
        }
      }
    ];
    
    res.json(sampleReports);
  } catch (error) {
    console.error('Error fetching CER reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/cer/report/:id - Get a specific CER report
router.get('/report/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getCERReport(id);
    res.json(report);
  } catch (error) {
    console.error(`Error fetching CER report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/cer/generate-full - Generate a full CER report
router.post('/generate-full', async (req, res) => {
  try {
    const { deviceInfo, literature, fdaData, templateId } = req.body;
    
    // Generate CER with enhanced AI workflow
    const report = await generateFullCER({ deviceInfo, literature, fdaData, templateId });
    res.json(report);
  } catch (error) {
    console.error('Error generating full CER:', error);
    res.status(500).json({ error: 'Failed to generate CER report' });
  }
});

// POST /api/cer/sample - Generate a sample CER
router.post('/sample', async (req, res) => {
  try {
    const { template } = req.body;
    
    // Generate a URL to a sample CER based on the template
    const sampleUrl = `/samples/cer-${template}-sample.pdf`;
    
    res.json({ url: sampleUrl });
  } catch (error) {
    console.error('Error generating sample CER:', error);
    res.status(500).json({ error: 'Failed to generate sample' });
  }
});

// GET /api/cer/workflows/:id - Get workflow status
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate a workflow status response
    res.json({
      id,
      status: 'processing',
      progress: 0.65,
      currentStep: 'sectionGeneration',
      steps: [
        { id: 'dataPreparation', name: 'Data Preparation', status: 'completed', completedAt: new Date(Date.now() - 180000).toISOString() },
        { id: 'aiAnalysis', name: 'AI Analysis', status: 'completed', completedAt: new Date(Date.now() - 120000).toISOString() },
        { id: 'sectionGeneration', name: 'Section Generation', status: 'processing', startedAt: new Date(Date.now() - 60000).toISOString() },
        { id: 'qualityCheck', name: 'Quality Check', status: 'pending' },
        { id: 'finalCompilation', name: 'Final Compilation', status: 'pending' }
      ],
      estimatedCompletionTime: new Date(Date.now() + 120000).toISOString() // 2 minutes from now
    });
  } catch (error) {
    console.error(`Error fetching workflow ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch workflow status' });
  }
});

// POST /api/cer/analyze/literature - Analyze literature with AI
router.post('/analyze/literature', async (req, res) => {
  try {
    const { literature } = req.body;
    
    // Call AI analysis service
    const analysis = await analyzeLiteratureWithAI(literature);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing literature with AI:', error);
    res.status(500).json({ error: 'Failed to analyze literature' });
  }
});

// POST /api/cer/analyze/adverse-events - Analyze FDA adverse events with AI
router.post('/analyze/adverse-events', async (req, res) => {
  try {
    const { fdaData } = req.body;
    
    // Call AI analysis service
    const analysis = await analyzeAdverseEventsWithAI(fdaData);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing adverse events with AI:', error);
    res.status(500).json({ error: 'Failed to analyze adverse events' });
  }
});

// GET /api/cer/faers/data - Fetch adverse event data from FDA FAERS database
router.get('/faers/data', async (req, res) => {
  try {
    const { productName, manufacturerName, startDate, endDate, limit } = req.query;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    // Use the enhanced FAERS service which includes UNII resolution and risk scoring
    const faersData = await faersService.getFaersData(productName);
    
    res.json(faersData);
  } catch (error) {
    console.error('Error fetching FAERS data:', error);
    res.status(500).json({ error: 'Failed to fetch FAERS data' });
  }
});

// POST /api/cer/fetch-faers - Fetch and store FAERS data for a specific CER including comparator analysis
router.post('/fetch-faers', async (req, res) => {
  try {
    const { productName, cerId, includeComparators = true, comparatorLimit = 3, useATC = true, useMoA = true } = req.body;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!cerId) {
      return res.status(400).json({ error: 'CER ID is required' });
    }
    
    // Step 1: Fetch FAERS data with comparator analysis using our enhanced service
    console.log(`Fetching FAERS data for product: ${productName}, CER ID: ${cerId}, with comparators: ${includeComparators}, useATC: ${useATC}, useMoA: ${useMoA}`);
    
    // Use the enhanced FAERS analysis service that handles ATC codes and mechanism of action
    const faersData = await fetchFaersAnalysis(productName, cerId);
    
    // Step 2: Process the data for the response
    const responseData = {
      success: true,
      productName,
      cerId,
      reports: faersData.reportsData || [],
      riskScore: faersData.riskScore,
      reportCount: faersData.reportCount,
      classification: faersData.classification,
      message: `Successfully analyzed ${faersData.reportCount} FAERS reports for ${productName}`
    };
    
    // Add comparator data if it exists
    if (faersData.comparators && faersData.comparators.length > 0) {
      responseData.comparators = faersData.comparators;
      responseData.message += ` with ${faersData.comparators.length} comparative products analyzed using `;
      
      const methods = [];
      if (faersData.classification?.atcCodes?.length > 0) methods.push('ATC codes');
      if (faersData.classification?.mechanismOfAction?.length > 0) methods.push('mechanism of action');
      if (faersData.classification?.pharmacologicalClass?.length > 0) methods.push('pharmacological class');
      
      if (methods.length > 0) {
        responseData.message += methods.join(', ');
      } else {
        responseData.message += 'substance similarity';
      }
    }
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching and storing FAERS data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch and store FAERS data',
      message: error.message
    });
  }
});

// POST /api/cer/generate-section - Generate a specific section for CER with AI
router.post('/generate-section', async (req, res) => {
  try {
    const { section, context, productName } = req.body;
    
    if (!section || !context) {
      return res.status(400).json({ error: 'Section type and context are required' });
    }
    
    console.log(`Generating ${section} section with context length: ${context.length}`);
    
    // Sample section generation logic - in production this would use OpenAI or similar
    let content = '';
    
    // Initialize with appropriate content based on section type
    switch(section) {
      case 'benefit-risk':
        content = `# Benefit-Risk Analysis\n\nThis benefit-risk analysis evaluates the clinical benefits of ${productName || 'the device'} against its potential risks, based on available clinical data and post-market surveillance information.\n\nThe analysis demonstrates a favorable benefit-risk profile, with significant clinical benefits outweighing the identified risks. Key benefits include improved patient outcomes and reduced procedural complications, while risks are well-characterized and mitigated through appropriate control measures.\n\nBased on the context provided: ${context.substring(0, 100)}...`;
        break;
        
      case 'safety':
        content = `# Safety Analysis\n\nThe safety profile of ${productName || 'the device'} has been thoroughly evaluated through clinical studies and post-market surveillance data.\n\nSerious adverse events are rare, occurring in less than 1% of cases. The most common adverse events include minor discomfort and temporary inflammation, which typically resolve without intervention.\n\nBased on the context provided: ${context.substring(0, 100)}...`;
        break;
        
      case 'clinical-background':
        content = `# Clinical Background\n\nThis section provides the clinical context for the evaluation of ${productName || 'the device'}, including the medical condition it addresses, current standard of care, and unmet clinical needs.\n\nThe clinical literature demonstrates a clear need for innovative solutions in this therapeutic area, with current approaches showing limitations in efficacy and safety.\n\nBased on the context provided: ${context.substring(0, 100)}...`;
        break;
        
      default:
        content = `# ${section.charAt(0).toUpperCase() + section.slice(1)}\n\nThis section provides key information about ${section} for ${productName || 'the device'}.\n\nAnalysis of available data shows favorable outcomes and supports the clinical performance and safety of the device.\n\nBased on the context provided: ${context.substring(0, 100)}...`;
    }
    
    // Return the generated content
    res.json({
      section,
      content,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating section:', error);
    res.status(500).json({ error: 'Failed to generate section' });
  }
});

// POST /api/cer/preview - Generate a preview of the full CER report
router.post('/preview', async (req, res) => {
  try {
    const { title, sections, faers, comparators } = req.body;
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one section is required' });
    }
    
    // Prepare the preview data
    const previewData = {
      title: title || 'Clinical Evaluation Report',
      generatedAt: new Date().toISOString(),
      sections: sections,
      faersData: faers || [],
      comparatorData: comparators || [],
      metadata: {
        totalSections: sections.length,
        hasFaersData: Boolean(faers && faers.length > 0),
        hasComparatorData: Boolean(comparators && comparators.length > 0)
      }
    };
    
    res.json(previewData);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// POST /api/cer/export-pdf - Export CER as PDF
router.post('/export-pdf', async (req, res) => {
  try {
    const { title, sections, faers, comparators } = req.body;
    
    // In a real implementation, this would generate a PDF using a library like PDFKit
    // For now, we'll return a mock PDF response
    
    console.log(`Exporting PDF with title: ${title}, sections: ${sections?.length || 0}`);
    
    // Set the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cer_report.pdf"');
    
    // In a real implementation, we would generate and stream the PDF here
    // For demonstration, we'll just send a placeholder message
    res.send('PDF generation would happen here in production');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// POST /api/cer/compliance-score - Calculate compliance score using GPT-4o
const complianceScoreHandler = require('./cer/complianceScore');
router.post('/compliance-score', complianceScoreHandler);

// POST /api/cer/export-docx - Export CER as DOCX
router.post('/export-docx', async (req, res) => {
  try {
    const { title, sections, faers, comparators } = req.body;
    
    // Create a new Document
    const doc = new Document({
      title: title || 'Clinical Evaluation Report',
      description: 'Generated by TrialSage CER Generator',
      styles: {
        paragraphStyles: [
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: '2E74B5'
            },
            paragraph: {
              spacing: {
                after: 120
              }
            }
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 24,
              bold: true,
              color: '2E74B5'
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120
              }
            }
          }
        ]
      }
    });
    
    // Add title page
    doc.addSection({
      properties: {},
      children: [
        new Paragraph({
          text: title || 'Clinical Evaluation Report',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400
          }
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: ' ',
          spacing: {
            after: 400
          }
        }),
        new Paragraph({
          text: 'CONFIDENTIAL',
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400
          }
        })
      ]
    });
    
    // Add sections content
    const mainSection = {
      properties: {},
      children: [
        new Paragraph({
          text: 'Table of Contents',
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true
        }),
        // TOC would be generated here in a real implementation
        new Paragraph({
          text: ' ',
          spacing: {
            after: 400
          }
        })
      ]
    };
    
    // Add each section
    if (sections && sections.length > 0) {
      for (const section of sections) {
        mainSection.children.push(
          new Paragraph({
            text: section.title || section.type || 'Section',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true
          })
        );
        
        // Split content by newline and add each paragraph
        if (section.content) {
          const paragraphs = section.content.split('\n');
          for (const para of paragraphs) {
            if (para.trim()) {
              mainSection.children.push(
                new Paragraph({
                  text: para,
                  spacing: {
                    after: 120
                  }
                })
              );
            }
          }
        }
      }
    }
    
    // Add FAERS data if available
    if (faers && faers.length > 0) {
      mainSection.children.push(
        new Paragraph({
          text: 'FDA Adverse Event Analysis',
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true
        }),
        new Paragraph({
          text: `This section presents the analysis of ${faers.length} adverse event reports from the FDA Adverse Event Reporting System (FAERS).`,
          spacing: {
            after: 120
          }
        })
      );
    }
    
    // Add comparator data if available
    if (comparators && comparators.length > 0) {
      mainSection.children.push(
        new Paragraph({
          text: 'Comparative Product Analysis',
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true
        }),
        new Paragraph({
          text: `This section presents comparative analysis with ${comparators.length} similar products.`,
          spacing: {
            after: 120
          }
        })
      );
    }
    
    doc.addSection(mainSection);
    
    // Generate the document
    const buffer = await Packer.toBuffer(doc);
    
    // Set the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="cer_report.docx"');
    
    // Send the document
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    res.status(500).json({ error: 'Failed to export DOCX' });
  }
});

// GET /api/cer/faers/analysis - Get analyzed FAERS data for CER inclusion with comparative analysis
router.get('/faers/analysis', async (req, res) => {
  try {
    const { productName, includeComparators = 'true', useATC = 'true', useMoA = 'true' } = req.query;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    // Use the new enhanced FAERS service with ATC codes and MoA
    console.log(`Analyzing FAERS data for ${productName} with comparative analysis`);
    
    // Fetch the enhanced analysis with ATC and MoA-based comparisons
    const faersData = await fetchFaersAnalysis(productName);
    
    // Process the data for clinical evaluation reporting
    const reportCount = faersData.reportCount || 0;
    const seriousCount = faersData.reportsData?.filter(r => r.is_serious)?.length || 0;
    const riskScore = faersData.riskScore || 0;
    const severityLevel = getSeverityLevel(riskScore);
    
    // Extract most common adverse events
    const eventCounts = {};
    if (faersData.reportsData && faersData.reportsData.length > 0) {
      faersData.reportsData.forEach(report => {
        const reaction = report.reaction;
        if (reaction) {
          eventCounts[reaction] = (eventCounts[reaction] || 0) + 1;
        }
      });
    }
    
    // Convert to sorted array of reaction counts
    const topReactions = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([reaction, count]) => ({
        event: reaction,
        count: count,
        percentage: `${((count / reportCount) * 100).toFixed(1)}%`
      }));
    
    // Extract demographics
    const demographics = {
      ageDistribution: extractAgeDistribution(faersData.reportsData || [], reportCount),
      genderDistribution: extractGenderDistribution(faersData.reportsData || [], reportCount)
    };
    
    // Format the response specifically for CER inclusion
    const analysis = {
      productInfo: {
        name: productName,
        unii: faersData.substance?.unii || null,
        substanceName: faersData.substance || productName,
        classification: faersData.classification || {}
      },
      reportingPeriod: {
        start: "2020-01-01",  // In production, this should be dynamically determined
        end: new Date().toISOString().split('T')[0],
        durationMonths: 48
      },
      summary: {
        totalReports: reportCount,
        seriousEvents: seriousCount,
        seriousEventsPercentage: reportCount > 0 ? `${((seriousCount / reportCount) * 100).toFixed(1)}%` : '0%',
        eventsPerTenThousand: (riskScore * 100).toFixed(2),
        severityAssessment: severityLevel
      },
      topEvents: topReactions,
      demographics,
    };
    
    // Add pharmacological classification information
    if (faersData.classification) {
      analysis.pharmacology = {
        atcCodes: faersData.classification.atcCodes || [],
        mechanismOfAction: faersData.classification.mechanismOfAction || [],
        pharmacologicalClass: faersData.classification.pharmacologicalClass || []
      };
    }
    
    // Add comparator analysis if available
    if (faersData.comparators && faersData.comparators.length > 0) {
      analysis.comparativeAnalysis = {
        products: faersData.comparators.map(comp => ({
          name: comp.comparator,
          riskScore: comp.riskScore,
          reportCount: comp.reportCount,
          severityAssessment: getSeverityLevel(comp.riskScore),
          relativeSafety: getRelativeSafety(riskScore, comp.riskScore)
        })),
        matchingCriteria: buildMatchingCriteria(faersData.classification),
        summary: `Compared to ${faersData.comparators.length} similar products in its class, ${productName} shows ${getComparativeConclusion(faersData.riskScore, faersData.comparators)}`
      };
      
      // Enhanced conclusion with comparative data and classification info
      let classificationInfo = '';
      if (faersData.classification?.atcCodes?.length > 0) {
        classificationInfo = ` As a ${faersData.classification.atcCodes[0].split(':')[0]} class pharmaceutical,`;
      } else if (faersData.classification?.mechanismOfAction?.length > 0) {
        classificationInfo = ` With a mechanism of action as ${faersData.classification.mechanismOfAction[0].toLowerCase()},`;
      }
      
      analysis.conclusion = `Based on the analysis of ${reportCount} adverse event reports from the FDA FAERS database, ${productName} demonstrates a ${severityLevel.toLowerCase()} risk profile with ${seriousCount} serious events reported.${classificationInfo} ${analysis.comparativeAnalysis.summary} The most common adverse events were ${topReactions.slice(0, 3).map(r => r.event).join(', ')}. This data should be considered in the overall benefit-risk assessment of the product.`;
    } else {
      // Standard conclusion without comparators
      analysis.conclusion = `Based on the analysis of ${reportCount} adverse event reports from the FDA FAERS database, ${productName} demonstrates a ${severityLevel.toLowerCase()} risk profile with ${seriousCount} serious events reported. The most common adverse events were ${topReactions.slice(0, 3).map(r => r.event).join(', ')}. This data should be considered in the overall benefit-risk assessment of the product.`;
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing FAERS data for CER:', error);
    res.status(500).json({ 
      error: 'Failed to analyze FAERS data for CER',
      message: error.message 
    });
  }
});

// Helper function to extract age distribution from FAERS reports
function extractAgeDistribution(reports, totalReports) {
  const ageGroups = {
    '0-17': 0,
    '18-44': 0,
    '45-64': 0,
    '65-74': 0,
    '75+': 0,
    'Unknown': 0
  };
  
  reports.forEach(report => {
    const age = report.age ? parseInt(report.age, 10) : null;
    
    if (age === null || isNaN(age)) {
      ageGroups['Unknown']++;
    } else if (age < 18) {
      ageGroups['0-17']++;
    } else if (age < 45) {
      ageGroups['18-44']++;
    } else if (age < 65) {
      ageGroups['45-64']++;
    } else if (age < 75) {
      ageGroups['65-74']++;
    } else {
      ageGroups['75+']++;
    }
  });
  
  return Object.entries(ageGroups).map(([group, count]) => ({
    group,
    count,
    percentage: totalReports > 0 ? `${((count / totalReports) * 100).toFixed(1)}%` : '0%'
  }));
}

// Helper function to extract gender distribution from FAERS reports
function extractGenderDistribution(reports, totalReports) {
  const genderCounts = {
    'Male': 0,
    'Female': 0,
    'Unknown': 0
  };
  
  reports.forEach(report => {
    const sex = report.sex;
    
    if (!sex) {
      genderCounts['Unknown']++;
    } else if (sex === '1') {
      genderCounts['Male']++;
    } else if (sex === '2') {
      genderCounts['Female']++;
    } else {
      genderCounts['Unknown']++;
    }
  });
  
  return Object.entries(genderCounts).map(([gender, count]) => ({
    gender,
    count,
    percentage: totalReports > 0 ? `${((count / totalReports) * 100).toFixed(1)}%` : '0%'
  }));
}

// Helper function to build matching criteria description
function buildMatchingCriteria(classification) {
  if (!classification) return 'substance similarity';
  
  const criteria = [];
  
  if (classification.atcCodes && classification.atcCodes.length > 0) {
    criteria.push('ATC classification codes');
  }
  
  if (classification.mechanismOfAction && classification.mechanismOfAction.length > 0) {
    criteria.push('mechanism of action');
  }
  
  if (classification.pharmacologicalClass && classification.pharmacologicalClass.length > 0) {
    criteria.push('pharmacological class');
  }
  
  return criteria.length > 0 ? criteria.join(', ') : 'substance similarity';
}

// Helper function to determine severity level based on risk score
function getSeverityLevel(riskScore) {
  if (riskScore > 1.5) return 'High';
  if (riskScore > 0.5) return 'Medium';
  return 'Low';
}

// Helper function to determine relative safety compared to reference product
function getRelativeSafety(referenceScore, comparatorScore) {
  const ratio = comparatorScore / referenceScore;
  
  if (ratio < 0.8) return 'better';
  if (ratio > 1.2) return 'worse';
  return 'similar';
}

// Helper function to generate comparative conclusion
function getComparativeConclusion(faersData) {
  if (!faersData.comparators || faersData.comparators.length === 0) {
    return '';
  }
  
  // Count comparative ratings
  const safetyCounts = {
    better: 0,
    similar: 0,
    worse: 0
  };
  
  faersData.comparators.forEach(comp => {
    const relativeSafety = getRelativeSafety(faersData.riskScore, comp.riskScore);
    safetyCounts[relativeSafety]++;
  });
  
  // Generate conclusion based on counts
  if (safetyCounts.better > safetyCounts.worse && safetyCounts.better > safetyCounts.similar) {
    return `a more favorable safety profile than most similar products in its class.`;
  }
  
  if (safetyCounts.worse > safetyCounts.better && safetyCounts.worse > safetyCounts.similar) {
    return `a less favorable safety profile than most similar products in its class.`;
  }
  
  if (safetyCounts.similar > safetyCounts.better && safetyCounts.similar > safetyCounts.worse) {
    return `a safety profile consistent with other products in its class.`;
  }
  
  // Mixed results
  if (safetyCounts.better === safetyCounts.worse) {
    return `a variable safety profile compared to other products in its class.`;
  }
  
  return `a safety profile that should be evaluated in context with other products in its class.`;
}

// POST /api/cer/export/:id - Export CER to various formats
router.post('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body; // pdf, docx, html, etc.
    
    // Simulate export processing
    setTimeout(() => {
      res.json({
        id,
        format,
        url: `/api/cer/exports/${id}.${format}`,
        status: 'completed',
        exportedAt: new Date().toISOString()
      });
    }, 1500);
  } catch (error) {
    console.error(`Error exporting CER ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to export CER' });
  }
});

// POST /api/cer/generate-full - Generate a complete CER with AI
const generateFullCER = require('./cer/generateFullCER');
router.post('/generate-full', generateFullCER);

// GET /api/cer/templates - Get available CER templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'eu-mdr-full',
        name: 'EU MDR 2017/745 Full Template',
        description: 'Complete template for EU MDR 2017/745 compliance',
        regulatoryFramework: 'EU MDR',
        sectionCount: 14,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de', 'it', 'es'],
        aiEnhanced: true,
        lastUpdated: '2025-03-01T00:00:00Z'
      },
      {
        id: 'meddev-rev4',
        name: 'MEDDEV 2.7/1 Rev 4 Template',
        description: 'Template following MEDDEV 2.7/1 Rev 4 guidelines',
        regulatoryFramework: 'MEDDEV',
        sectionCount: 12,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de'],
        aiEnhanced: true,
        lastUpdated: '2025-02-15T00:00:00Z'
      },
      {
        id: 'fda-510k',
        name: 'FDA 510(k) Template',
        description: 'Template for FDA 510(k) clinical evaluation',
        regulatoryFramework: 'FDA',
        sectionCount: 10,
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        aiEnhanced: true,
        lastUpdated: '2025-01-20T00:00:00Z'
      },
      {
        id: 'pmcf',
        name: 'PMCF Evaluation Report Template',
        description: 'Post-Market Clinical Follow-up report template',
        regulatoryFramework: 'EU MDR',
        sectionCount: 8,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de', 'it', 'es'],
        aiEnhanced: true,
        lastUpdated: '2025-04-05T00:00:00Z'
      }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching CER templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST /api/cer/export-pdf - Export FAERS data as PDF
router.post('/export-pdf', async (req, res) => {
  try {
    const { faersData, productName } = req.body;
    
    if (!faersData) {
      return res.status(400).json({ 
        success: false,
        error: 'FAERS data is required' 
      });
    }
    
    console.log(`Generating PDF export for ${productName || 'unknown product'}`);
    
    // In a production environment, this would generate an actual PDF
    // For this demo, we'll return a mock response
    setTimeout(() => {
      res.json({
        success: true,
        format: 'pdf',
        filename: `faers_report_${productName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        message: 'PDF export generated successfully',
        url: `/api/cer/downloads/faers_${Date.now()}.pdf`
      });
    }, 1500);
  } catch (error) {
    console.error('Error exporting FAERS data to PDF:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export FAERS data to PDF',
      message: error.message 
    });
  }
});

// POST /api/cer/export-word - Export FAERS data as DOCX
router.post('/export-word', async (req, res) => {
  try {
    const { faersData, productName } = req.body;
    
    if (!faersData) {
      return res.status(400).json({ 
        success: false,
        error: 'FAERS data is required' 
      });
    }
    
    console.log(`Generating Word export for ${productName || 'unknown product'}`);
    
    // In a production environment, this would generate an actual DOCX file
    // For this demo, we'll return a mock response
    setTimeout(() => {
      res.json({
        success: true,
        format: 'docx',
        filename: `faers_report_${productName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`,
        message: 'Word document generated successfully',
        url: `/api/cer/downloads/faers_${Date.now()}.docx`
      });
    }, 1500);
  } catch (error) {
    console.error('Error exporting FAERS data to Word:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export FAERS data to Word',
      message: error.message 
    });
  }
});

// POST /api/cer/preview - Generate HTML preview of CER report
router.post('/preview', async (req, res) => {
  try {
    console.log('Preview request body:', JSON.stringify(req.body, null, 2));
    const { title, sections = [], faers = [], comparators = [] } = req.body;
    
    // Allow preview with either sections or FAERS data
    const hasFaers = faers && Array.isArray(faers) && faers.length > 0;
    const hasSections = sections && Array.isArray(sections) && sections.length > 0;
    
    console.log(`FAERS data: ${hasFaers ? 'present' : 'missing'}, Sections: ${hasSections ? 'present' : 'missing'}`);
    
    if (!hasFaers && !hasSections) {
      console.log('No content found for preview');
      return res.status(400).json({ error: 'Either sections or FAERS data is required' });
    }
    
    console.log(`Generating HTML preview for ${title || 'unknown product'}`);
    
    // Extract some basic information for the preview
    const reportCount = faers?.length || 0;
    const seriousCount = faers?.filter(r => r.is_serious)?.length || 0;
    
    // Generate sample HTML preview with sections and/or FAERS data
    let sectionsHtml = '';
    if (hasSections) {
      sectionsHtml = sections.map(section => {
        return `
          <div class="cer-user-section">
            <h4>${section.title || 'Section'}</h4>
            <div class="cer-section-content">
              ${section.content || ''}
            </div>
          </div>
        `;
      }).join('');
    }
    
    let faersHtml = '';
    if (hasFaers) {
      faersHtml = `
        <div class="cer-summary">
          <p>
            Based on the analysis of ${reportCount} adverse event reports from the FDA FAERS database, 
            ${title?.split(':')[1] || 'The product'} demonstrates a moderate risk profile with ${seriousCount} serious events reported.
            This data has been considered in the overall benefit-risk assessment of the product.
          </p>
        </div>
        
        <div class="cer-section">
          <h4>Summary of FAERS Findings</h4>
          <ul>
            <li>Total reports analyzed: ${reportCount}</li>
            <li>Serious adverse events: ${seriousCount}</li>
            <li>Reporting period: 2020-01-01 to ${new Date().toISOString().split('T')[0]}</li>
          </ul>
        </div>
        
        <div class="cer-section">
          <h4>Risk Assessment</h4>
          <p>
            The adverse event profile for ${title?.split(':')[1] || 'the product'} is consistent with similar products in its class.
            Most reported events were non-serious and resolved without intervention.
          </p>
        </div>
      `;
    }
    
    const html = `
      <div class="cer-preview-content">
        <div class="cer-section">
          <h2>Clinical Evaluation Report</h2>
          <h3>${title || 'Device/Product Evaluation'}</h3>
          
          ${faersHtml}
          ${sectionsHtml}
          
          <div class="cer-section">
            <h4>Conclusion</h4>
            <p>
              The safety profile of ${title?.split(':')[1] || 'the product'} is well-characterized and acceptable for its intended use.
              Continuous monitoring of adverse events will ensure ongoing safety assessment.
            </p>
          </div>
        </div>
      </div>
    `;
    
    res.json({
      success: true,
      html
    });
  } catch (error) {
    console.error('Error generating CER preview:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate CER preview',
      message: error.message 
    });
  }
});

// Test preview route for debugging
router.post('/preview-test', async (req, res) => {
  try {
    console.log('Preview test body:', JSON.stringify(req.body, null, 2));
    const { title, sections, faers, comparators } = req.body;
    
    // Always return data for testing
    res.json({
      success: true,
      message: 'Preview test endpoint',
      receivedData: {
        hasFaers: faers && Array.isArray(faers) && faers.length > 0,
        hasSections: sections && Array.isArray(sections) && sections.length > 0,
        title: title || 'No title provided',
        sections: sections || [],
        faers: faers || [],
        comparators: comparators || []
      },
      html: '<div class="test-preview">Preview test generated content</div>'
    });
  } catch (error) {
    console.error('Error in preview test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Preview test error',
      message: error.message 
    });
  }
});

// POST /api/cer/compliance-score - Analyze CER content for regulatory compliance
router.post('/compliance-score', complianceScoreHandler);

// POST /api/cer/assistant - Get AI assistant response for CER development questions
const cerAssistantHandler = require('./cer/assistant');
router.post('/assistant', cerAssistantHandler);

// POST /api/cer/improve-compliance - Get AI-generated improvements for compliance
const improveComplianceHandler = require('./cer/improveCompliance');
router.post('/improve-compliance', improveComplianceHandler);

export { router as default };

// Export for CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = router;
}