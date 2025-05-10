/**
 * CoAuthor Service
 * 
 * Provides core functionality for the eCTD Co-Author feature:
 * - Context retrieval from document repositories
 * - Draft validation against regulatory guidelines
 * - Section generation using AI with context
 */

// Import OpenAI for regulatory validation
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Search the document store for context related to a specific query
 * 
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of snippet objects
 */
export async function retrieveContext(query) {
  console.log('🔎 Searching for context with query:', query);
  
  // For now, return synthetic sample data
  // This would be replaced with actual search logic against your vector DB
  return [
    {
      text: "Section 2.7 should contain a concise critical assessment of the clinical data submitted in the NDA/BLA. The assessment should examine all pertinent data, including unfavorable or inconclusive outcomes, to determine the benefit-risk profile of the drug.",
      source: "ICH M4E Guideline",
      docId: "ICH-M4E-2016"
    },
    {
      text: "Safety data must be presented by appropriate demographic subgroups (e.g., age, sex, race), with careful attention to potential differences in adverse event profiles. Any differences should be discussed in relation to the overall safety profile.",
      source: "FDA Guidance for Industry",
      docId: "FDA-GFI-CTD-2019"
    },
    {
      text: "The Clinical Overview (Module 2.5) should provide a detailed, factual summarization of all clinical findings with references to more detailed information in Module 5. It should not exceed 30 pages in length.",
      source: "EMA Regulatory Guidelines",
      docId: "EMA-2023-eCTD"
    }
  ];
}

/**
 * Validate a section text against regulatory guidelines
 * 
 * @param {string} sectionText - The text of the section to validate
 * @param {string} moduleId - The module ID (e.g., "m2")
 * @param {string} sectionId - The section ID (e.g., "2.7")
 * @returns {Promise<Array>} - Array of validation issues
 */
export async function validateSection(sectionText, moduleId = "m2", sectionId = "2.7") {
  console.log(`🔍 Validating section ${moduleId}/${sectionId}`);
  
  if (!sectionText || sectionText.trim().length < 50) {
    return [
      {
        type: "error",
        message: "Section content is too brief for regulatory submission. Detailed information is required.",
        location: "content-length"
      }
    ];
  }
  
  try {
    // Use OpenAI to validate the section content
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a pharmaceutical regulatory expert specializing in eCTD submissions for the FDA, EMA, and other global regulatory bodies. 
          Evaluate the provided section ${moduleId.toUpperCase()} ${sectionId} content for compliance with ICH guidelines and regulatory requirements.
          Focus on identifying any issues related to:
          1. Missing required information
          2. Non-compliant formatting or presentation
          3. Potential scientific or regulatory gaps
          4. Claims without proper substantiation
          5. Inconsistencies with standard CTD structure
          
          Return ONLY an array of issues in JSON format with each issue having: 
          - type: "error" | "warning" | "suggestion"
          - message: A clear explanation of the issue
          - location: The part of the content where the issue occurs (e.g., "paragraph-1", "section-header", etc.)
          
          If no issues are found, return an empty array.`
        },
        {
          role: "user",
          content: sectionText
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    try {
      const validationResults = JSON.parse(response.choices[0].message.content);
      return validationResults.issues || [];
    } catch (parseError) {
      console.error('Error parsing OpenAI validation response:', parseError);
      // Fallback to basic validation
      return basicValidation(sectionText, moduleId, sectionId);
    }
  } catch (error) {
    console.error('Error during OpenAI validation:', error);
    // Fallback to basic validation
    return basicValidation(sectionText, moduleId, sectionId);
  }
}

/**
 * Simple validation rules as fallback when AI validation fails
 */
function basicValidation(text, moduleId, sectionId) {
  const issues = [];
  
  // Length checks
  if (text.length < 200) {
    issues.push({
      type: "warning",
      message: "Content appears too brief for a comprehensive regulatory submission.",
      location: "document-length"
    });
  }
  
  // Check for common section headings that should be present
  const commonHeadings = ["Introduction", "Background", "Methods", "Results", "Discussion", "Conclusion"];
  const missingHeadings = commonHeadings.filter(heading => 
    !text.toLowerCase().includes(heading.toLowerCase())
  );
  
  if (missingHeadings.length > 3) {
    issues.push({
      type: "warning",
      message: `Section may be missing standard headings: ${missingHeadings.join(", ")}`,
      location: "section-structure"
    });
  }
  
  // Check for references
  if (!text.includes("reference") && !text.includes("study") && text.length > 500) {
    issues.push({
      type: "warning",
      message: "No references to studies or literature detected. Regulatory submissions typically require data substantiation.",
      location: "references"
    });
  }
  
  return issues;
}

/**
 * Generate a draft section using AI with context
 * 
 * @param {string} moduleId - The module ID
 * @param {string} sectionId - The section ID
 * @param {string} prompt - The user's prompt/instructions
 * @param {Array} context - Array of context snippets
 * @returns {Promise<string>} - The generated draft
 */
export async function generateDraft(moduleId, sectionId, prompt, context = []) {
  console.log(`🖋️ Generating draft for ${moduleId}/${sectionId}`);
  
  try {
    // Format the context for the AI
    const formattedContext = context.length > 0 
      ? `\n\nRELEVANT CONTEXT:\n${context.map((c, i) => `[${i+1}] ${c.text || c}`).join('\n\n')}`
      : "";
    
    // Get the section details based on CTD structure
    const sectionInfo = getCtdSectionInfo(moduleId, sectionId);
    
    // Generate the draft using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an expert regulatory medical writer specializing in CTD submissions.
          You are drafting content for eCTD Module ${moduleId.replace('m', '')} Section ${sectionId}: ${sectionInfo.title}.
          
          PURPOSE OF THIS SECTION:
          ${sectionInfo.description}
          
          WRITING STYLE:
          - Write in formal, scientific language appropriate for regulatory submissions
          - Be concise but comprehensive
          - Use clear section headings and subheadings
          - Maintain consistent tense throughout
          - Avoid marketing language or unsupported claims
          - Focus on scientific data and objective analysis
          - Follow ICH guidelines for content and structure
          
          OUTPUT FORMAT:
          - Markdown format with clear headings and subheadings
          - Include appropriate placeholders for data or study references
          - Structure according to regulatory expectations${formattedContext}`
        },
        {
          role: "user",
          content: `Draft content for Module ${moduleId.replace('m', '')} Section ${sectionId} with the following guidance: ${prompt}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating draft:', error);
    throw new Error(`Failed to generate draft: ${error.message}`);
  }
}

/**
 * Get CTD section information based on moduleId and sectionId
 */
function getCtdSectionInfo(moduleId, sectionId) {
  // Map of common CTD sections
  const ctdMap = {
    'm1': {
      '1.1': {
        title: 'Table of Contents',
        description: 'Comprehensive table of contents for the entire application.'
      },
      '1.2': {
        title: 'Application Form',
        description: 'Completed application form for the submission.'
      }
    },
    'm2': {
      '2.1': {
        title: 'CTD Table of Contents',
        description: 'Table of contents for Module 2-5.'
      },
      '2.2': {
        title: 'Introduction',
        description: 'Brief introduction to the medicinal product, including its pharmacological class, mode of action, and proposed clinical use.'
      },
      '2.3': {
        title: 'Quality Overall Summary',
        description: 'Summary of quality information related to the drug substance and drug product.'
      },
      '2.4': {
        title: 'Nonclinical Overview',
        description: 'Integrated overview and assessment of the pharmacologic, pharmacokinetic, and toxicologic evaluations.'
      },
      '2.5': {
        title: 'Clinical Overview',
        description: 'Critical assessment of clinical data, including benefits and risks of the medicinal product in its intended use.'
      },
      '2.6': {
        title: 'Nonclinical Written and Tabulated Summaries',
        description: 'Detailed summaries of nonclinical information, including pharmacology, pharmacokinetics, and toxicology.'
      },
      '2.7': {
        title: 'Clinical Summary',
        description: 'Detailed summary of clinical information, including biopharmaceutic studies, clinical pharmacology studies, clinical efficacy, clinical safety, and literature references.'
      }
    },
    'm3': {
      '3.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 3.'
      },
      '3.2': {
        title: 'Body of Data',
        description: 'Comprehensive quality data including drug substance and drug product information.'
      }
    },
    'm4': {
      '4.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 4.'
      },
      '4.2': {
        title: 'Study Reports',
        description: 'Nonclinical study reports, including pharmacology, pharmacokinetics, and toxicology.'
      }
    },
    'm5': {
      '5.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 5.'
      },
      '5.2': {
        title: 'Tabular Listing of All Clinical Studies',
        description: 'Tabular listing of all clinical studies.'
      },
      '5.3': {
        title: 'Clinical Study Reports',
        description: 'Reports of biopharmaceutic studies, clinical pharmacology studies, clinical efficacy and safety studies, and published literature.'
      },
      '5.4': {
        title: 'Literature References',
        description: 'Literature references cited in the application.'
      }
    }
  };
  
  // Return the section info if found, or a generic description
  if (ctdMap[moduleId]?.[sectionId]) {
    return ctdMap[moduleId][sectionId];
  }
  
  return {
    title: `Section ${sectionId}`,
    description: `Content for CTD module ${moduleId.replace('m', '')} section ${sectionId}.`
  };
}