/**
 * Enterprise Vault™ AI Assistant - Backend API
 * 
 * This service handles intelligent conversations about TrialSage Vault™, providing
 * specialized knowledge about clinical document management, regulatory compliance,
 * and AI-powered features.
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Memory storage for conversations (would move to database in production)
const conversationMemory = new Map();

// Assistant knowledge base with key information about Vault features
const vaultKnowledge = {
  overview: "TrialSage Vault™ is the world's first fully AI-driven, regulatory-grade Clinical Document Management Platform (cDMS) — designed to not just store files, but to understand them, organize them, and prepare them for submission automatically.",
  
  aiTagging: "Vault™ uses GPT-4 Turbo to automatically analyze every uploaded document. It extracts key metadata including trial phase, molecule ID, indication, endpoints, and even maps documents to the appropriate regulatory submission structure. This eliminates manual tagging and significantly reduces document processing time.",
  
  compliance: "Vault™ is built from the ground up for regulatory compliance, with full tenant isolation, AES-256 encryption, 21 CFR Part 11 compliant audit trails, and HIPAA alignment. Every document action is timestamped, user-attributed, and cryptographically secured.",
  
  auditTrail: "The comprehensive audit trail captures every document interaction: uploads, downloads, locks, unlocks, version changes, and even view events. Administrators can filter by user, document type, date range, or action type - essential for regulatory inspections and internal compliance reviews.",
  
  security: "Vault™ provides true multi-tenant architecture with complete database and storage isolation between clients. Documents are encrypted at rest (AES-256) and in transit (TLS 1.3), with granular role-based access controls and real-time anomaly detection to flag unusual activity patterns.",
  
  cmcUseCase: "For Chemistry, Manufacturing and Controls (CMC) teams, Vault™ automatically organizes batch records, validation reports, and specifications into the appropriate Module 3 structure. AI-generated summaries help reviewers quickly understand key document content without opening each file.",
  
  indPreparation: "When preparing an IND submission, Vault™ automatically maps documents to the appropriate regulatory modules, generates executive summaries, flags missing appendices, and provides a real-time dashboard of submission readiness across all required documents.",
  
  pricingOverview: "Vault™ offers flexible pricing tiers starting at $499/month for small biotech teams (up to 10 users), with Professional ($1,299/month) and Enterprise (custom pricing) plans for larger organizations. All plans include the core AI features, with Enterprise adding advanced security, custom integrations, and dedicated support.",
  
  veevaComparison: "Unlike Veeva Vault, TrialSage Vault™ was built specifically for modern biotech workflows with AI at its core. We offer automatic AI tagging and summarization (which Veeva lacks), intelligent document routing, and significantly more affordable pricing for emerging biotechs.",
  
  smartFoldering: "Vault™ doesn't just store files in static folders. It dynamically organizes documents based on their content, creating Smart Folders by study, molecule, phase, and regulatory module. As you upload documents, they're automatically placed in the appropriate locations.",
};

// Predefined conversation paths with suggested responses
const conversationFlows = {
  initial: [
    "Tell me about TrialSage Vault™",
    "How does AI tagging work?",
    "Explain Vault's compliance features",
    "What makes Vault better than Veeva?"
  ],
  
  afterOverview: [
    "How is document security handled?",
    "Tell me about the Smart Foldering system",
    "How does Vault help with IND submissions?",
    "What are the pricing options?"
  ],
  
  afterCompliance: [
    "Tell me more about audit trails",
    "How does Vault support 21 CFR Part 11?",
    "Show me CMC use cases"
  ],
  
  afterFeature: [
    "Can I schedule a demo?",
    "What are the pricing plans?",
    "How quickly can we implement Vault?"
  ]
};

// Generate suggestions based on conversation context
function getSuggestions(conversationHistory) {
  if (!conversationHistory || conversationHistory.length <= 1) {
    return conversationFlows.initial;
  }
  
  const lastMessage = conversationHistory[conversationHistory.length - 1].content.toLowerCase();
  
  if (lastMessage.includes("overview") || lastMessage.includes("what is") || lastMessage.includes("tell me about vault")) {
    return conversationFlows.afterOverview;
  } else if (lastMessage.includes("compliance") || lastMessage.includes("regulatory") || lastMessage.includes("21 cfr")) {
    return conversationFlows.afterCompliance;
  } else if (lastMessage.includes("tagging") || lastMessage.includes("feature") || lastMessage.includes("ai")) {
    return conversationFlows.afterFeature;
  }
  
  // Default suggestions
  return [
    "How does Vault handle document versions?",
    "Tell me about Vault's AI summarization",
    "How secure is Vault?"
  ];
}

// Identify intent from user message
function identifyIntent(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("pricing") || msg.includes("cost") || msg.includes("price")) {
    return "pricing";
  } else if (msg.includes("demo") || msg.includes("schedule") || msg.includes("contact")) {
    return "demo";
  } else if (msg.includes("security") || msg.includes("complian") || msg.includes("21 cfr") || msg.includes("hipaa")) {
    return "compliance";
  } else if (msg.includes("veeva") || msg.includes("better") || msg.includes("compare")) {
    return "comparison";
  } else if (msg.includes("tag") || msg.includes("ai ")) {
    return "ai_features";
  } else if (msg.includes("ind") || msg.includes("submission")) {
    return "ind_preparation";
  } else if (msg.includes("cmc") || msg.includes("module 3")) {
    return "cmc";
  } else if (msg.includes("audit") || msg.includes("track")) {
    return "audit_trail";
  } else if (msg.includes("folder") || msg.includes("organize")) {
    return "smart_foldering";
  }
  
  return "general";
}

// Format response based on intent
function formatResponse(intent, sessionId) {
  const knowledge = vaultKnowledge;
  
  switch (intent) {
    case "pricing":
      return {
        message: knowledge.pricingOverview,
        suggestions: [
          "Schedule a pricing consultation",
          "Tell me about the Professional plan",
          "What features are in the Enterprise tier?"
        ]
      };
      
    case "demo":
      return {
        message: "I'd be happy to arrange a personalized demo of TrialSage Vault™ for your team. Our clinical document experts can walk through specific use cases relevant to your organization. Would you like to provide your email to schedule a convenient time?",
        suggestions: [
          "Yes, I'd like to schedule a demo",
          "Tell me more about features first",
          "Send me pricing information"
        ],
        collectContact: true
      };
      
    case "compliance":
      return {
        message: knowledge.compliance,
        suggestions: [
          "Tell me about audit trails",
          "How does Vault handle document locking?",
          "Is Vault HIPAA compliant?"
        ]
      };
      
    case "comparison":
      return {
        message: knowledge.veevaComparison,
        suggestions: [
          "What about compared to SharePoint?",
          "Show me the feature comparison",
          "Tell me about Vault pricing vs. Veeva"
        ]
      };
      
    case "ai_features":
      return {
        message: knowledge.aiTagging,
        suggestions: [
          "How accurate is the AI tagging?",
          "Can we customize the AI rules?",
          "Tell me about AI document summarization"
        ]
      };
      
    case "ind_preparation":
      return {
        message: knowledge.indPreparation,
        suggestions: [
          "How does this compare to traditional systems?",
          "Can Vault help with FDA responses?",
          "Tell me about the IND submission dashboard"
        ]
      };
      
    case "cmc":
      return {
        message: knowledge.cmcUseCase,
        suggestions: [
          "How does Vault handle batch records?",
          "Tell me about stability data management",
          "Can Vault map to Module 3 sections?"
        ]
      };
      
    case "audit_trail":
      return {
        message: knowledge.auditTrail,
        suggestions: [
          "Can we export audit logs?",
          "How long are audit logs retained?",
          "Tell me about anomaly detection"
        ]
      };
      
    case "smart_foldering":
      return {
        message: knowledge.smartFoldering,
        suggestions: [
          "Can we create custom folder structures?",
          "How does Vault handle nested folders?",
          "Can we move documents between folders?"
        ]
      };
      
    case "general":
    default:
      return {
        message: knowledge.overview,
        suggestions: getSuggestions(conversationMemory.get(sessionId) || [])
      };
  }
}

// Generate session ID for new conversations
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Main API endpoint
router.post('/', async (req, res) => {
  try {
    const { message, sessionId: existingSessionId } = req.body;
    const sessionId = existingSessionId || generateSessionId();
    
    // Initialize or retrieve conversation history
    if (!conversationMemory.has(sessionId)) {
      conversationMemory.set(sessionId, []);
    }
    
    const conversationHistory = conversationMemory.get(sessionId);
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Process message intent
    const intent = identifyIntent(message);
    const response = formatResponse(intent, sessionId);
    
    // Add assistant response to history
    conversationHistory.push({ role: 'assistant', content: response.message });
    
    // Trim history if it gets too long (keep last 10 messages)
    if (conversationHistory.length > 10) {
      conversationMemory.set(sessionId, conversationHistory.slice(-10));
    }
    
    // If OpenAI is available, use it for more dynamic responses
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await callOpenAI(conversationHistory, intent, sessionId);
        if (openaiResponse) {
          response.message = openaiResponse.message;
          // Keep the generated suggestions from formatResponse function
        }
      } catch (err) {
        console.log('OpenAI fallback error:', err.message);
        // Continue with rule-based response if OpenAI fails
      }
    }
    
    // Return response with session ID for client to maintain state
    res.json({
      message: response.message,
      suggestions: response.suggestions || [],
      sessionId,
      collectContact: response.collectContact || false,
    });
    
  } catch (error) {
    console.error('Vault Assistant Error:', error);
    res.status(500).json({
      message: 'I apologize, but I encountered an issue processing your request. How else can I help you with TrialSage Vault™?',
      suggestions: conversationFlows.initial,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced response with OpenAI (used if API key is available)
async function callOpenAI(conversationHistory, intent, sessionId) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  try {
    // Prepare system instructions based on intent
    let systemInstruction = "You are Vault™ Assistant, the AI concierge for TrialSage Vault™, an intelligent clinical document management platform. You provide helpful, accurate information about Vault's features. Keep responses professional, concise (max 3 paragraphs), and focused on biotech/pharmaceutical regulatory document management. Always maintain a friendly, knowledgeable tone as a clinical technology expert.";
    
    // Add intent-specific guidance
    if (intent === 'compliance') {
      systemInstruction += " Focus on regulatory compliance features including 21 CFR Part 11, audit trails, HIPAA, and secure document handling.";
    } else if (intent === 'comparison') {
      systemInstruction += " Highlight Vault's advantages over competitors like Veeva Vault, emphasizing AI capabilities, biotech-specific features, and more affordable pricing.";
    } else if (intent === 'ai_features') {
      systemInstruction += " Emphasize the AI document tagging, summarization, and organization capabilities powered by GPT-4 Turbo.";
    }
    
    // Format messages for OpenAI
    const messages = [
      { role: 'system', content: systemInstruction },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Add relevant knowledge from vaultKnowledge
    let knowledgeContext = "Here is key information about TrialSage Vault™:\n\n";
    knowledgeContext += Object.values(vaultKnowledge).join("\n\n");
    
    messages.push({
      role: 'system',
      content: knowledgeContext
    });
    
    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      message: response.data.choices[0].message.content
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null;
  }
}

// Endpoint to handle demo requests
router.post('/request-demo', (req, res) => {
  try {
    const { email, name, company, sessionId } = req.body;
    
    // In a real implementation, this would store the lead in a CRM or database
    console.log('Demo request received:', { email, name, company, sessionId });
    
    // Return confirmation
    res.json({
      message: `Thank you for your interest in TrialSage Vault™! We've received your demo request and a member of our team will contact you at ${email} within 1 business day to schedule a personalized demonstration.`,
      success: true
    });
    
  } catch (error) {
    console.error('Demo request error:', error);
    res.status(500).json({
      message: 'There was an issue processing your demo request. Please try again or contact us directly at sales@trialsage.com.',
      success: false
    });
  }
});

module.exports = router;