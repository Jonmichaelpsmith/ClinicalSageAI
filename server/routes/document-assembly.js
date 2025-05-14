/**
 * Document Assembly Routes
 * 
 * This module provides API endpoints for assembling CER documents from
 * various sections, including literature reviews and predicate device comparisons.
 */

import express from 'express';
import { 
  assembleCERDocument, 
  generateCERDocument, 
  enhanceCERWithAI, 
  generateAndSaveCER 
} from '../services/documentAssemblyService.js';

const router = express.Router();

/**
 * POST /api/document-assembly/preview - Generate a preview of an assembled CER document
 */
router.post('/preview', async (req, res) => {
  try {
    const { cerData } = req.body;
    
    if (!cerData || !cerData.deviceProfile) {
      return res.status(400).json({
        success: false,
        error: 'Missing cerData or deviceProfile'
      });
    }
    
    console.log(`Generating preview for CER document: ${cerData.deviceProfile.deviceName || 'Unknown Device'}`);
    
    // Generate the CER document without AI enhancement for preview
    const cerDocument = await generateCERDocument(cerData);
    
    res.json({
      success: true,
      document: cerDocument,
      message: 'CER document preview generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating CER document preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CER document preview',
      message: error.message
    });
  }
});

/**
 * POST /api/document-assembly/generate - Generate a complete CER document and save it
 */
router.post('/generate', async (req, res) => {
  try {
    const { cerData, enhance = true } = req.body;
    
    if (!cerData || !cerData.deviceProfile) {
      return res.status(400).json({
        success: false,
        error: 'Missing cerData or deviceProfile'
      });
    }
    
    console.log(`Generating CER document for: ${cerData.deviceProfile.deviceName || 'Unknown Device'}`);
    
    // Generate and save the CER document
    const result = await generateAndSaveCER(cerData, enhance);
    
    res.json({
      success: true,
      ...result,
      message: 'CER document generated and saved successfully'
    });
    
  } catch (error) {
    console.error('Error generating and saving CER document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate and save CER document',
      message: error.message
    });
  }
});

/**
 * POST /api/document-assembly/section/:sectionKey - Generate a specific section for a CER
 */
router.post('/section/:sectionKey', async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { deviceProfile, sectionData } = req.body;
    
    if (!sectionKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing section key'
      });
    }
    
    if (!deviceProfile) {
      return res.status(400).json({
        success: false,
        error: 'Missing device profile'
      });
    }
    
    console.log(`Generating ${sectionKey} section for ${deviceProfile.deviceName || 'Unknown Device'}`);
    
    // Placeholder for section-specific generation logic
    // In a real implementation, this would delegate to specific generators for each section type
    let sectionContent;
    
    if (sectionKey === 'literature-review' && sectionData && sectionData.literatureReferences) {
      // Use OpenAI to generate the literature review section
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const prompt = `
Generate a comprehensive literature review section for a Clinical Evaluation Report (CER) for the medical device "${deviceProfile.deviceName || 'medical device'}".

Device Information:
- Name: ${deviceProfile.deviceName || 'Unknown'}
- Classification: ${deviceProfile.deviceClass || 'Unknown'}
- Intended Use: ${deviceProfile.intendedUse || 'Unknown'}

Based on the following literature references:
${sectionData.literatureReferences.map((ref, i) => `
${i+1}. ${ref.title || 'Unknown Title'}
   Authors: ${ref.authors || 'Unknown Authors'}
   Year: ${ref.year || 'Unknown Year'}
   Journal: ${ref.journal || 'Unknown Journal'}
   ${ref.abstract ? `Abstract: ${ref.abstract}` : ''}
`).join('\n')}

The literature review should follow MEDDEV 2.7/1 Rev 4 guidelines and include:
1. Introduction to the search strategy
2. Summary of relevant papers
3. Critical analysis of the literature
4. Evaluation of safety and performance data
5. Identification of any gaps in evidence
6. Conclusions based on the literature

Format the response as HTML suitable for inclusion in a CER document.
      `;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a medical device regulatory expert specializing in clinical evaluation reports and literature reviews. You follow MEDDEV 2.7/1 Rev 4 guidelines and produce comprehensive, evidence-based analyses for medical device manufacturers."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
      });
      
      sectionContent = completion.choices[0].message.content;
    } else {
      sectionContent = `<h2>${sectionKey.replace(/-/g, ' ').replace(/^\w|\s\w/g, c => c.toUpperCase())}</h2>
<p>This section requires specific data to be generated.</p>`;
    }
    
    res.json({
      success: true,
      sectionKey,
      content: sectionContent,
      message: `${sectionKey} section generated successfully`
    });
    
  } catch (error) {
    console.error(`Error generating section ${req.params.sectionKey}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to generate ${req.params.sectionKey} section`,
      message: error.message
    });
  }
});

export default router;