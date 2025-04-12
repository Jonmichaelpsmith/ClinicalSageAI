import OpenAI from "openai";
import { 
  generateStructuredResponse,
  analyzeText
} from "../../server/services/openai-service";
import fs from "fs";
import path from "path";

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in the environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Initialize the TrialSage assistant
 */
export async function initializeAssistant() {
  try {
    // Load assistant profile from JSON
    const profilePath = path.join(__dirname, 'assistant-profile.json');
    const profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    
    // Check if assistant already exists (using a file-based approach for simplicity)
    const assistantIdPath = path.join(__dirname, '.assistant-id');
    if (fs.existsSync(assistantIdPath)) {
      const assistantId = fs.readFileSync(assistantIdPath, 'utf8');
      console.log(`Using existing assistant ID: ${assistantId}`);
      return assistantId;
    }

    // Create new assistant
    const assistant = await openai.beta.assistants.create({
      name: profileData.assistant.name,
      instructions: profileData.assistant.instructions,
      tools: profileData.assistant.tools,
      model: "gpt-4o",
    });
    
    // Save assistant ID for future use
    fs.writeFileSync(assistantIdPath, assistant.id);
    console.log(`Created new assistant with ID: ${assistant.id}`);
    return assistant.id;
  } catch (error) {
    console.error("Error initializing assistant:", error);
    throw error;
  }
}

/**
 * Create a conversation with the TrialSage assistant
 */
export async function createAssistantThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error("Error creating assistant thread:", error);
    throw error;
  }
}

/**
 * Get a response from the TrialSage assistant
 */
export async function getAssistantResponse(threadId: string, userMessage: string) {
  try {
    // Get the assistant ID
    const assistantIdPath = path.join(__dirname, '.assistant-id');
    if (!fs.existsSync(assistantIdPath)) {
      throw new Error("Assistant ID not found. Please initialize the assistant first.");
    }
    const assistantId = fs.readFileSync(assistantIdPath, 'utf8');

    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (runStatus.status === "failed") {
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || "Unknown error"}`);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    if (assistantMessages.length === 0) {
      throw new Error("No assistant response found");
    }

    const latestMessage = assistantMessages[0];
    return latestMessage.content[0].text.value;
  } catch (error) {
    console.error("Error getting assistant response:", error);
    throw error;
  }
}

/**
 * Generate a protocol based on evidence from similar clinical trials
 * Also generates IND Module 2.5 and regulatory risk analysis
 */
export async function generateProtocolFromEvidence(
  indication: string, 
  phase: string = "Phase II",
  primaryEndpoint?: string
): Promise<{ 
  recommendation: string; 
  citations: string[]; 
  ind_module_2_5?: { section: string; content: string }; 
  risk_summary?: string 
}> {
  const systemPrompt = `
    You are TrialSage, an expert AI assisting with clinical trial protocol design. 
    Generate a detailed clinical trial protocol for the given indication and phase.
    
    Your response should be a JSON object with these fields:
    1. recommendation - A comprehensive protocol outline with these sections:
       - Title and Overview
       - Study Design (type, duration, arms)
       - Eligibility (inclusion/exclusion criteria)
       - Endpoints (primary and secondary)
       - Treatment Plan
       - Safety Assessments
       - Statistical Considerations
    2. citations - An array of real clinical study reports (CSRs) that informed this protocol
    
    Base your protocol on evidence from similar clinical trials. Be specific and practical.
  `;

  const userPrompt = `
    Generate a clinical trial protocol for a ${phase} trial investigating treatments for ${indication}.
    ${primaryEndpoint ? `The primary endpoint should be: ${primaryEndpoint}` : ''}
    
    Make sure to include specific dosing information, visit schedules, and endpoints that would 
    be appropriate for this type of trial. Cite real clinical study reports that informed your 
    recommendations.
  `;

  let recommendation = '';
  let citations: string[] = [];

  try {
    // Generate structured response for the protocol
    const protocolData = await generateStructuredResponse<{
      recommendation: string;
      citations: string[];
    }>(userPrompt, systemPrompt);
    
    recommendation = protocolData.recommendation;
    citations = protocolData.citations || [];
  } catch (error) {
    console.error("Error generating protocol from evidence:", error);
    // Fallback to direct text generation if structured response fails
    const textResponse = await analyzeText(
      userPrompt,
      `${systemPrompt}\nRespond in plain text with the protocol recommendation followed by citations.`
    );
    
    // Extract citations from text (simplified)
    citations = (textResponse.match(/Citations:([\s\S]*)/i) || ['', ''])[1]
      .split(/\n/)
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[•\-*]\s*/, '').trim());
    
    recommendation = textResponse.replace(/Citations:[\s\S]*/i, '').trim();
  }

  // Generate IND Module 2.5 (Clinical Overview)
  const ind25SystemPrompt = `
    You are TrialSage, an expert AI assisting with IND (Investigational New Drug) application preparation.
    Generate content for IND Module 2.5 (Clinical Overview) based on the provided protocol information.
    
    Your response should be comprehensive, evidence-based, and follow FDA guidance for IND applications.
    Structure your response with appropriate sections for a Clinical Overview document.
  `;

  const ind25UserPrompt = `
    Generate IND Module 2.5 (Clinical Overview) for a drug to treat ${indication} using the following protocol outline:
    
    ${recommendation}
    
    Output in clean prose format ready for submission in an IND application.
  `;

  // Generate Regulatory Risk Analysis
  const riskSystemPrompt = `
    You are TrialSage, an expert AI conducting regulatory risk assessment for clinical trial protocols.
    Based on the provided protocol information, identify potential regulatory concerns or reviewer questions
    that might arise during FDA/IRB review.
    
    Your response should be thorough, practical, and based on current regulatory expectations.
    Focus on specific aspects of the protocol that might raise concerns, with justification.
  `;

  const riskUserPrompt = `
    Based on this proposed protocol for ${indication}, what regulatory risks or reviewer questions are most likely to arise?
    Respond in list format with rationale for each concern.
    
    ${recommendation}
  `;

  try {
    // Run both additional analyses in parallel
    const [ind25Response, riskResponse] = await Promise.all([
      analyzeText(ind25UserPrompt, ind25SystemPrompt),
      analyzeText(riskUserPrompt, riskSystemPrompt)
    ]);

    return {
      recommendation,
      citations,
      ind_module_2_5: {
        section: "2.5",
        content: ind25Response
      },
      risk_summary: riskResponse
    };
  } catch (error) {
    console.error("Error generating extended protocol information:", error);
    
    // Return what we have even if extended analyses fail
    return {
      recommendation,
      citations
    };
  }
}

/**
 * Justify endpoint choice with evidence from clinical trials
 */
export async function justifyEndpointChoice(
  endpoint: string, 
  indication: string, 
  phase?: string
): Promise<{ justification: string; evidence: any[] }> {
  const systemPrompt = `
    You are TrialSage, an expert AI assisting with clinical trial endpoint selection.
    Provide a detailed justification for the chosen endpoint for the given indication.
    
    Your response should be a JSON object with these fields:
    1. justification - A detailed explanation of why this endpoint is appropriate
    2. evidence - An array of evidence items that support this endpoint choice
       Each evidence item should contain: source, description, and relevance
    
    Base your justification on regulatory precedent, clinical relevance, statistical 
    considerations, and historical usage.
  `;

  const userPrompt = `
    Justify the choice of "${endpoint}" as an endpoint for clinical trials in ${indication}
    ${phase ? `for ${phase} studies` : ''}.
    
    Explain the regulatory precedent, clinical relevance, and historical usage of this endpoint.
    Provide specific examples of trials that successfully used this endpoint.
  `;

  try {
    // Generate structured response
    const justificationData = await generateStructuredResponse<{
      justification: string;
      evidence: any[];
    }>(userPrompt, systemPrompt);
    
    return {
      justification: justificationData.justification,
      evidence: justificationData.evidence || []
    };
  } catch (error) {
    console.error("Error justifying endpoint choice:", error);
    // Fallback to direct text generation
    const textResponse = await analyzeText(
      userPrompt,
      `${systemPrompt}\nRespond in plain text with the justification followed by evidence items.`
    );
    
    // Simplified extraction
    return {
      justification: textResponse,
      evidence: []
    };
  }
}

/**
 * Build an IND module draft
 */
export async function buildINDModuleDraft(
  section: string,
  indication: string,
  drugMechanism?: string,
  relevantTrials?: string[]
): Promise<{ content: string; references: any[] }> {
  const systemPrompt = `
    You are TrialSage, an expert AI assisting with IND (Investigational New Drug) application preparation.
    Generate content for the specified section of an IND application.
    
    Your response should be a JSON object with these fields:
    1. content - The detailed content for the specified IND section
    2. references - An array of reference items that support this content
    
    Structure the content according to FDA guidance for IND applications.
  `;

  const userPrompt = `
    Generate content for the "${section}" section of an IND application for a drug to treat ${indication}
    ${drugMechanism ? `with the following mechanism of action: ${drugMechanism}` : ''}.
    ${relevantTrials && relevantTrials.length ? `These trials may be relevant: ${relevantTrials.join(', ')}` : ''}
    
    Make the content specific, detailed, and aligned with FDA expectations.
    Include appropriate regulatory references and scientific citations.
  `;

  try {
    // Generate structured response
    const moduleData = await generateStructuredResponse<{
      content: string;
      references: any[];
    }>(userPrompt, systemPrompt);
    
    return {
      content: moduleData.content,
      references: moduleData.references || []
    };
  } catch (error) {
    console.error("Error building IND module draft:", error);
    // Fallback to direct text generation
    const textResponse = await analyzeText(
      userPrompt,
      `${systemPrompt}\nRespond in plain text with the module content followed by references.`
    );
    
    // Simplified extraction
    return {
      content: textResponse,
      references: []
    };
  }
}

/**
 * Generate weekly intelligence brief
 */
export async function generateWeeklyIntelligenceBrief(
  therapeuticAreas: string[] = [], 
  maxTrials: number = 5
): Promise<{ brief: string; highlights: any[] }> {
  const systemPrompt = `
    You are TrialSage, an expert AI providing intelligence on clinical trial developments.
    Generate a weekly intelligence brief summarizing recent developments in clinical trials.
    
    Your response should be a JSON object with these fields:
    1. brief - A comprehensive intelligence summary with executive overview and detailed updates
    2. highlights - An array of key highlights, each containing: area, finding, and implication
    
    Focus on emerging trends, regulatory insights, and competitive analysis.
  `;

  const areasText = therapeuticAreas.length 
    ? `focusing on these therapeutic areas: ${therapeuticAreas.join(', ')}`
    : 'covering major therapeutic areas';

  const userPrompt = `
    Generate a weekly intelligence brief ${areasText}.
    Include up to ${maxTrials} significant trial updates.
    
    The brief should summarize key trial updates, emerging trends, regulatory insights,
    and competitive analysis. Conclude with strategic recommendations.
  `;

  try {
    // Generate structured response
    const briefData = await generateStructuredResponse<{
      brief: string;
      highlights: any[];
    }>(userPrompt, systemPrompt);
    
    return {
      brief: briefData.brief,
      highlights: briefData.highlights || []
    };
  } catch (error) {
    console.error("Error generating weekly intelligence brief:", error);
    // Fallback to direct text generation
    const textResponse = await analyzeText(
      userPrompt,
      `${systemPrompt}\nRespond in plain text with the intelligence brief.`
    );
    
    // Simplified extraction
    return {
      brief: textResponse,
      highlights: []
    };
  }
}

/**
 * Compare two clinical study protocols
 */
export async function compareProtocols(
  studyIds: string[],
  studySummaries: string[]
): Promise<{ 
  comparison: string; 
  strengths: { [key: string]: string[] };
  weaknesses: { [key: string]: string[] };
  recommendations: string[];
}> {
  if (studyIds.length !== 2 || studySummaries.length !== 2) {
    throw new Error("Exactly two study IDs and summaries are required for comparison");
  }

  const systemPrompt = `
    You are TrialSage, an expert AI assisting with clinical trial protocol analysis.
    Compare two clinical trial protocols and provide detailed analysis of their differences,
    strengths, weaknesses, and recommendations for improvement.
    
    Your response should be a JSON object with these fields:
    1. comparison - A comprehensive comparison highlighting key differences
    2. strengths - An object with study IDs as keys and arrays of strengths as values
    3. weaknesses - An object with study IDs as keys and arrays of weaknesses as values
    4. recommendations - An array of recommendations to improve the protocols
  `;

  const userPrompt = `
    Compare these two clinical trial protocols:
    
    Protocol 1 (${studyIds[0]}):
    ${studySummaries[0]}
    
    Protocol 2 (${studyIds[1]}):
    ${studySummaries[1]}
    
    Focus on study design, endpoints, inclusion/exclusion criteria, statistical approaches,
    and other critical elements. Provide specific, actionable recommendations for improvement.
  `;

  try {
    // Generate structured response
    const comparisonData = await generateStructuredResponse<{
      comparison: string;
      strengths: { [key: string]: string[] };
      weaknesses: { [key: string]: string[] };
      recommendations: string[];
    }>(userPrompt, systemPrompt);
    
    return {
      comparison: comparisonData.comparison,
      strengths: comparisonData.strengths || { [studyIds[0]]: [], [studyIds[1]]: [] },
      weaknesses: comparisonData.weaknesses || { [studyIds[0]]: [], [studyIds[1]]: [] },
      recommendations: comparisonData.recommendations || []
    };
  } catch (error) {
    console.error("Error comparing protocols:", error);
    // Fallback to direct text generation
    const textResponse = await analyzeText(
      userPrompt,
      `${systemPrompt}\nRespond in plain text with the protocol comparison.`
    );
    
    // Simplified extraction
    return {
      comparison: textResponse,
      strengths: { [studyIds[0]]: [], [studyIds[1]]: [] },
      weaknesses: { [studyIds[0]]: [], [studyIds[1]]: [] },
      recommendations: []
    };
  }
}

/**
 * Answer protocol design questions using AI
 */
export async function answerProtocolQuestion(
  question: string,
  relatedStudies: string[] = []
): Promise<string> {
  const systemPrompt = `
    You are TrialSage, an expert AI assisting with clinical trial protocol design and regulatory questions.
    Provide detailed, evidence-based answers to questions about clinical trial design, methodology, 
    regulatory considerations, and best practices.
    
    Base your answers on regulatory guidelines, scientific literature, and established best practices.
    Be specific, practical, and actionable in your responses.
  `;

  const studiesContext = relatedStudies.length 
    ? `Related studies for context: ${relatedStudies.join(', ')}`
    : '';

  const userPrompt = `
    Question about clinical trial protocols:
    ${question}
    
    ${studiesContext}
    
    Please provide a comprehensive answer with specific recommendations where applicable.
  `;

  try {
    // Use text analysis for natural Q&A format
    const answer = await analyzeText(userPrompt, systemPrompt);
    return answer;
  } catch (error) {
    console.error("Error answering protocol question:", error);
    throw error;
  }
}

/**
 * Generate an IND section using an existing thread for context
 */
export async function generateIndSection(
  studyId: string,
  section: string,
  context: string = "",
  threadId?: string
): Promise<{ section: string; content: string }> {
  // Create new thread if one isn't provided
  if (!threadId) {
    threadId = await createAssistantThread();
  }
  
  const prompt = `
    Generate content for IND module section "${section}" for study ${studyId}.
    
    Additional context: ${context}
    
    Ensure the content aligns with FDA guidance for this IND section.
    Include appropriate level of detail, regulatory references, and justifications.
  `;
  
  try {
    // Use the assistant's thread persistence capability
    const response = await getAssistantResponse(threadId, prompt);
    
    return {
      section,
      content: response
    };
  } catch (error) {
    console.error(`Error generating IND section ${section}:`, error);
    
    // Fallback to direct generation if thread-based approach fails
    const fallbackResponse = await buildINDModuleDraft(section, studyId);
    
    return {
      section,
      content: fallbackResponse.content
    };
  }
}