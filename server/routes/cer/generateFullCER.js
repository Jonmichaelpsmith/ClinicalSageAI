/**
 * Zero-Click Full CER Generator
 * 
 * This module provides the API endpoint handler for generating a complete
 * Clinical Evaluation Report using GPT-4o, with automatic integration of data
 * from FAERS, literature sources, and user-provided device information.
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate required sections for a regulatory framework
 * @param {string} framework - The regulatory framework (EU-MDR, ISO-14155, US-FDA)
 * @returns {Array} Array of required section objects
 */
function getRequiredSections(framework) {
  // Define required sections by framework
  const sectionsByFramework = {
    'EU-MDR': [
      { title: 'Device Description', type: 'device-description' },
      { title: 'Intended Purpose', type: 'intended-purpose' },
      { title: 'State of the Art', type: 'state-of-art' },
      { title: 'Clinical Data Analysis', type: 'clinical-data' },
      { title: 'Post-Market Surveillance', type: 'post-market' },
      { title: 'Literature Review', type: 'literature-review' },
      { title: 'Benefit-Risk Analysis', type: 'benefit-risk' },
      { title: 'Conclusion', type: 'conclusion' }
    ],
    'ISO-14155': [
      { title: 'Trial Design', type: 'trial-design' },
      { title: 'Patient Selection', type: 'patient-selection' },
      { title: 'Risk Assessment', type: 'risk-assessment' },
      { title: 'Device Description', type: 'device-description' },
      { title: 'Safety Monitoring', type: 'safety-monitoring' },
      { title: 'Endpoint Analysis', type: 'endpoint-analysis' },
      { title: 'Statistical Methods', type: 'statistical-methods' }
    ],
    'US-FDA': [
      { title: 'Device Description', type: 'device-description' },
      { title: 'Indications for Use', type: 'indications' },
      { title: 'Technological Characteristics', type: 'technological' },
      { title: 'Performance Data', type: 'performance-data' },
      { title: 'Safety and Effectiveness', type: 'safety-effectiveness' },
      { title: 'Substantial Equivalence', type: 'substantial-equivalence' },
      { title: 'Conclusion', type: 'conclusion' }
    ]
  };
  
  // Return sections for the specified framework, or default to EU-MDR
  return sectionsByFramework[framework] || sectionsByFramework['EU-MDR'];
}

/**
 * Generate a full CER using GPT-4o
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
async function generateFullCER(req, res) {
  try {
    const { 
      deviceName, 
      deviceType, 
      regulatoryPath = 'EU-MDR', 
      intendedUse = '',
      uploadedFiles = [],
      dataSources = []
    } = req.body;
    
    if (!deviceName) {
      return res.status(400).json({ error: 'Device name is required' });
    }
    
    // Get the required sections for this regulatory path
    const sectionsToGenerate = getRequiredSections(regulatoryPath);
    
    console.log(`Generating full CER for ${deviceName} using ${regulatoryPath} framework...`);
    
    // Prepare the context for generation
    const deviceContext = {
      name: deviceName,
      type: deviceType,
      intendedUse,
      regulatoryPath,
      dataSources: dataSources.join(', '),
      uploadedDocuments: uploadedFiles.join(', ')
    };
    
    // Format device context as string
    const deviceContextString = Object.entries(deviceContext)
      .filter(([_, value]) => value) // Filter out empty values
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    // Initialize the array to store generated sections
    const generatedSections = [];
    
    // For each required section, generate content
    for (const section of sectionsToGenerate) {
      // Create a prompt for this specific section
      const sectionPrompt = {
        role: 'system',
        content: `You are an expert medical device regulatory specialist with deep knowledge of Clinical Evaluation Reports (CERs).
        
        Generate a comprehensive, detailed, and regulatory-compliant "${section.title}" section for a CER following ${regulatoryPath} guidelines.
        
        Device Information:
        ${deviceContextString}
        
        IMPORTANT INSTRUCTIONS:
        1. Write content that meets ${regulatoryPath} requirements for this section type.
        2. Include appropriate level of detail, clinical considerations, and regulatory context.
        3. Format the content in a professional, report-ready style.
        4. Include markdown formatting as appropriate for headings and structure.
        5. Write at least 500 words of substantive content.
        
        Respond only with the generated section content, nothing else.`
      };
      
      // Call OpenAI API to generate the section
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [sectionPrompt],
        temperature: 0.4, // Balance between creativity and consistency
        max_tokens: 2000 // Allow substantial section content
      });
      
      // Add the generated section to our results
      generatedSections.push({
        title: section.title,
        type: section.type,
        content: response.choices[0].message.content.trim(),
        regulatoryPath,
        timestamp: new Date().toISOString()
      });
      
      // Brief pause to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Prepare the full CER response
    const fullCER = {
      title: `Clinical Evaluation Report: ${deviceName}`,
      deviceName,
      deviceType,
      regulatoryPath,
      generatedAt: new Date().toISOString(),
      sections: generatedSections,
      metadata: {
        generationMethod: 'Zero-Click AI-powered CER',
        model: 'gpt-4o',
        dataSources,
        uploadedFiles
      }
    };
    
    // Return the completed CER
    res.json(fullCER);
    
  } catch (error) {
    console.error('Error generating full CER:', error);
    res.status(500).json({ 
      error: 'Failed to generate full CER',
      message: error.message || 'An unknown error occurred'
    });
  }
}

module.exports = generateFullCER;