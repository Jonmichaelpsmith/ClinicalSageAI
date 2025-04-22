import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useRoute } from 'wouter';

// Create context
const LumenAssistantContext = createContext(null);

// AI assistant command patterns
const COMMAND_PATTERNS = {
  NAVIGATE: /^(go to|open|navigate to|show|take me to)\s+(.+)$/i,
  SEARCH: /^(search|find|lookup|query)\s+(.+)$/i,
  CREATE: /^(create|make|generate|start( a| new)?)\s+(new\s+)?(.+)$/i,
  HELP: /^(help|help with|help me with|how to)\s+(.+)$/i,
  SHOW_DOCUMENTS: /^(show|list|display)(\s+my)?\s+(documents|files|reports)(\s+in\s+(.+))?$/i,
  SHOW_OVERDUE: /^(show|list|display)(\s+my)?\s+(overdue|late|pending)(\s+(.+))?$/i,
  EXPLAIN: /^(explain|tell me about|what is|what are|describe)\s+(.+)$/i
};

// Knowledge base for common regulatory terms
const REGULATORY_KNOWLEDGE = {
  // Core regulatory terms
  'ind': 'An Investigational New Drug (IND) application is a request for FDA authorization to administer an investigational drug to humans. The IND includes information on: animal pharmacology and toxicology studies, manufacturing information, clinical protocols, data from prior human research, and information about the investigator.',
  'nda': 'A New Drug Application (NDA) is the formal final step taken by a drug sponsor to ask the FDA to consider approving a new drug for marketing in the United States. An NDA includes all animal and human data and analyses of the data, as well as information about how the drug behaves in the body and how it is manufactured.',
  'csr': 'A Clinical Study Report (CSR) is a scientific document addressing the efficacy and safety of a medicinal product, which is submitted to health authorities such as the FDA. The ICH E3 guideline provides a recommended structure for CSRs.',
  'protocol': 'A clinical trial protocol is a document that describes the objectives, design, methodology, statistical considerations, and organization of a clinical trial. It ensures the safety of trial subjects and integrity of the data collected.',
  'capa': 'Corrective And Preventive Action (CAPA) is a concept within good manufacturing practice (GMP) and refers to the systematic investigation of the root causes of identified problems or identified risks in an attempt to prevent their recurrence (corrective action) or prevent occurrence (preventive action).',
  'ich': 'The International Council for Harmonisation of Technical Requirements for Pharmaceuticals for Human Use (ICH) develops guidelines to ensure that safe, effective, and high quality medicines are developed and registered in the most efficient and cost-effective manner.',
  'gxp': 'GxP is a collection of quality guidelines and regulations (where "G" stands for "Good" and "P" for "Practice") used in various industries, particularly in pharmaceutical and medical device industries. Examples include GMP (Good Manufacturing Practice), GCP (Good Clinical Practice), GLP (Good Laboratory Practice), etc.',
  '21 cfr part 11': '21 CFR Part 11 is the part of Title 21 of the Code of Federal Regulations that establishes the FDA regulations on electronic records and electronic signatures. It defines the criteria under which electronic records and electronic signatures are considered trustworthy, reliable, and equivalent to paper records.',
  'fda': 'The Food and Drug Administration (FDA) is a federal agency of the United States Department of Health and Human Services responsible for protecting and promoting public health through the control and supervision of food safety, tobacco products, dietary supplements, prescription and over-the-counter pharmaceutical drugs, vaccines, biopharmaceuticals, etc.',
  'ema': 'The European Medicines Agency (EMA) is an agency of the European Union responsible for the evaluation and supervision of medicinal products. It works to protect and promote human and animal health by evaluating and monitoring medicines within the European Union and the European Economic Area.',
  'pmda': 'The Pharmaceuticals and Medical Devices Agency (PMDA) is the Japanese regulatory agency responsible for ensuring the safety, efficacy, and quality of pharmaceuticals and medical devices. It conducts scientific reviews of marketing authorization applications of pharmaceuticals and medical devices, and monitors their post-marketing safety.',
  'sdtm': 'The Study Data Tabulation Model (SDTM) is a standard for organizing and formatting data to streamline processes in regulatory submissions. SDTM provides a standard for organizing and formatting data to streamline processes in collection, management, analysis and reporting.',
  'adam': 'Analysis Data Model (ADaM) is a CDISC standard for analysis datasets used to generate statistical outputs for clinical trial submissions. ADaM datasets are derived from SDTM datasets and are optimized for statistical analysis.',
  'ctd': 'The Common Technical Document (CTD) is a format used for regulatory submissions to the FDA, EMA, and other regulatory agencies. The CTD is organized into five modules: 1) Administrative and prescribing information, 2) Summaries, 3) Quality, 4) Nonclinical study reports, and 5) Clinical study reports.',
  
  // Comprehensive CMC Knowledge Base
  'cmc': 'Chemistry, Manufacturing, and Controls (CMC) refers to the information in a regulatory submission that provides comprehensive details about a drug\'s components, manufacturing processes, and the controls used throughout development and manufacturing to ensure product quality. CMC is primarily covered in Module 3 of the CTD and is critical for demonstrating the quality and consistency of a drug product.',
  
  'drug substance': 'The drug substance (also known as the active pharmaceutical ingredient or API) is the active ingredient in a drug product. CMC documentation for the drug substance includes details on its synthesis, characterization, manufacturing process, impurities profile, specifications, stability, and container closure system.',
  
  'drug product': 'The drug product is the finished dosage form containing the drug substance along with excipients. CMC documentation for the drug product includes formulation development, manufacturing process, specifications, stability, and container closure system information.',
  
  'excipient': 'Excipients are inactive ingredients added to drug formulations that serve various purposes such as improving stability, controlling release rate, enhancing bioavailability, and facilitating manufacturing. Common excipients include fillers, binders, disintegrants, lubricants, and preservatives.',
  
  'qa': 'Quality Assurance (QA) is a systematic program of procedures, activities, and oversight that ensures that quality requirements will be fulfilled. It focuses on preventing defects rather than detecting them after they occur.',
  
  'qc': 'Quality Control (QC) is a system of routine technical activities to measure and control the quality of the product as it is being developed and manufactured. QC involves testing and inspection to verify that products meet predetermined specifications.',
  
  'qbd': 'Quality by Design (QbD) is a systematic approach to pharmaceutical development that begins with predefined objectives and emphasizes product and process understanding and process control, based on sound science and quality risk management. QbD principles are outlined in ICH Q8, Q9, and Q10.',
  
  'specifications': 'Specifications in CMC are the quality standards (tests, analytical procedures, and acceptance criteria) proposed and justified by the manufacturer for determining compliance of a drug substance or drug product with established specifications for identity, strength, quality, and purity.',
  
  'stability': 'Stability studies evaluate how the quality of a drug substance or drug product varies with time under the influence of environmental factors such as temperature, humidity, and light. They establish a retest period for the drug substance or a shelf life for the drug product and recommend storage conditions.',
  
  'impurity': 'An impurity in a drug substance or drug product is any component that is not the drug substance or an excipient. Impurities can arise during synthesis, storage, or due to degradation. CMC documentation must identify, qualify, and set acceptance limits for impurities.',
  
  'reference standards': 'Reference standards are highly characterized materials used as a basis for comparison in testing. Primary reference standards are usually obtained from official compendia (e.g., USP, EP), while secondary reference standards (or working standards) are established based on primary reference standards.',
  
  'method validation': 'Method validation is the process of demonstrating that analytical procedures are suitable for their intended use. The ICH Q2(R1) guideline outlines the validation characteristics to be considered: accuracy, precision, specificity, detection limit, quantitation limit, linearity, and range.',
  
  'process validation': 'Process validation is the collection and evaluation of data establishing scientific evidence that a manufacturing process is capable of consistently delivering quality products. It includes process design, process qualification, and continued process verification.',
  
  'container closure': 'The container closure system refers to the sum of packaging components that together contain and protect the drug substance or drug product, including primary packaging components (those in direct contact with the product) and secondary packaging components.',
  
  'ich q8': 'ICH Q8 (Pharmaceutical Development) provides guidance on the contents of CTD Section 3.2.P.2. It introduces the concept of Quality by Design (QbD) and discusses approaches to enhance pharmaceutical development through systematic understanding of formulation and manufacturing process variables.',
  
  'ich q9': 'ICH Q9 (Quality Risk Management) provides principles and tools for quality risk management that can be applied to all aspects of pharmaceutical quality, including development, manufacturing, and distribution.',
  
  'ich q10': 'ICH Q10 (Pharmaceutical Quality System) establishes a model for an effective pharmaceutical quality system that complements ICH Q8 and ICH Q9 and provides the framework for continual improvement throughout the product lifecycle.',
  
  'ich q11': 'ICH Q11 (Development and Manufacture of Drug Substances) provides guidance on the information to include in CTD Sections 3.2.S.2.2 to 3.2.S.2.6, addressing both chemical and biotechnological/biological drug substances.',
  
  'ich q12': 'ICH Q12 (Lifecycle Management) provides a framework to facilitate the management of post-approval chemistry, manufacturing, and controls (CMC) changes in a more predictable and efficient manner across the product lifecycle.',
  
  'batch record': 'A batch record (or batch production record) is documentation that provides a complete history of the manufacturing of a specific batch, including equipment, components, procedures, in-process controls, and environmental conditions.',
  
  'release testing': 'Release testing refers to the battery of tests performed on a drug substance or drug product before it is released for further manufacturing or distribution. These tests verify that the material meets all predetermined specifications.',
  
  'coa': 'A Certificate of Analysis (CoA) is a document issued by Quality Assurance that confirms a regulated product meets its product specification. It contains the actual results of testing performed as part of quality control.',
  
  'dissolution': 'Dissolution testing is a performance test used to assess the rate and extent at which a drug substance is released from a solid dosage form under standardized conditions. It is a critical quality control tool for solid oral dosage forms.',
  
  'bioavailability': 'Bioavailability refers to the rate and extent to which the active ingredient is absorbed from a drug product and becomes available at the site of action. Bioavailability studies are an essential part of the biopharmaceutics information in regulatory submissions.',
  
  'ich m4q': 'ICH M4Q (The CTD-Quality) provides guidance on the organization of information in Module 3 (Quality) of the Common Technical Document for the registration of pharmaceuticals for human use.',
  
  'dmf': 'A Drug Master File (DMF) is a confidential document submitted to regulatory authorities containing detailed information about the manufacturing facilities, processes, or components used in the manufacturing, processing, packaging, and storing of a drug.',
  
  'api': 'Active Pharmaceutical Ingredient (API), also known as the drug substance, is the biologically active component of a drug product that produces the intended effects. CMC documentation extensively covers API synthesis, characterization, manufacturing, and control strategies.',
  
  'starting material': 'A starting material in API synthesis is a raw material, intermediate, or API that is incorporated as a significant structural fragment into the API structure. The designation of starting materials is a critical aspect of defining the regulatory starting point in API synthesis.',
  
  'acceptance criteria': 'Acceptance criteria are the product specifications (numerical limits, ranges, or other criteria) that must be met before a drug substance, drug product, or material at other stages of manufacturing is considered acceptable for its intended use.',
  
  'analytical procedures': 'Analytical procedures (or test methods) are the detailed instructions for conducting tests to determine if drug substances, drug products, or materials at other stages of manufacture conform to established specifications.',
  
  'bcs': 'The Biopharmaceutics Classification System (BCS) is a scientific framework for classifying drug substances based on their aqueous solubility and intestinal permeability. It helps in developing formulation strategies and can be used to justify biowaivers for certain immediate-release solid oral dosage forms.',
  
  'comparability': 'Comparability in CMC refers to the scientific evaluation of the similarity and consistency of a product before and after changes in the manufacturing process, equipment, or site. It is particularly important for biologics and ensures that changes do not adversely impact safety and efficacy.',
  
  'scale-up': 'Scale-up is the process of increasing batch size or throughput to move from laboratory or pilot scale to commercial manufacturing scale. CMC documentation must address how product quality and consistency are maintained during scale-up.',
  
  'tech transfer': 'Technology transfer refers to the process of transferring product and process knowledge between development and manufacturing sites or between different manufacturing sites. It ensures consistent and robust manufacturing of drug substances and drug products.',
  
  'in-process controls': 'In-process controls (IPCs) are checks performed during the manufacturing process to monitor and, if necessary, adjust the process to ensure that the final product meets its specifications. IPCs are a critical part of the control strategy described in CMC documentation.',
  
  'critical quality attributes': 'Critical Quality Attributes (CQAs) are physical, chemical, biological, or microbiological properties or characteristics that should be within an appropriate limit, range, or distribution to ensure the desired product quality. Identifying CQAs is a key aspect of Quality by Design.',
  
  'critical process parameters': 'Critical Process Parameters (CPPs) are process inputs (settings and variables) that have a direct and significant influence on Critical Quality Attributes and therefore should be monitored or controlled to ensure the process produces the desired quality.',
  
  'design space': 'Design space is the multidimensional combination and interaction of input variables and process parameters that have been demonstrated to provide assurance of quality. Working within the design space is not considered a change requiring regulatory approval.',
  
  'control strategy': 'A control strategy is a planned set of controls derived from current product and process understanding that ensures process performance and product quality. Controls can include parameters and attributes related to drug substance and drug product materials and components, facility and equipment, in-process controls, finished product specifications, and associated methods.'
};

// Module-specific information
const MODULE_CONTEXTS = {
  'indWizard': {
    title: 'IND Submission Wizard',
    capabilities: [
      'Create and manage IND submissions',
      'Generate Form 1571 and required attachments',
      'Track submission status and communications with FDA',
      'Import and organize preclinical and clinical data'
    ],
    helpTopics: ['protocol design', 'cmc requirements', 'nonclinical data', 'clinical data', 'submission process']
  },
  'csrIntelligence': {
    title: 'CSR Intelligence',
    capabilities: [
      'Analyze patterns in successful CSR submissions',
      'Extract insights from historical CSR data',
      'Generate CSR templates with pre-populated sections',
      'Compare protocol deviations across similar studies'
    ],
    helpTopics: ['ich e3 structure', 'efficacy analysis', 'safety reporting', 'protocol deviations', 'study population']
  },
  'documentManagement': {
    title: 'Document Management',
    capabilities: [
      'Store and organize regulatory documents with version control',
      'Search documents using semantic search and metadata',
      'Track document lifecycles and approval workflows',
      'Ensure 21 CFR Part 11 compliance with audit trails'
    ],
    helpTopics: ['document templates', 'version control', 'approval workflow', 'electronic signatures', 'audit trails']
  },
  'validationHub': {
    title: 'Validation Hub',
    capabilities: [
      'Validate data integrity and completeness',
      'Perform real-time checks against regulatory requirements',
      'Generate validation reports for regulatory submissions',
      'Track and resolve validation issues'
    ],
    helpTopics: ['data validation', 'validation protocols', 'computer system validation', 'data integrity', 'validation documentation']
  }
};

export const LumenAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const conversationContext = useRef({});
  const [location] = useLocation();
  
  const { toast } = useToast();

  // Detect current module based on URL
  useEffect(() => {
    if (location.includes('/ind/')) {
      setCurrentModule('indWizard');
    } else if (location.includes('/csr-intelligence')) {
      setCurrentModule('csrIntelligence');
    } else if (location.includes('/document-management') || location.includes('/enterprise-vault')) {
      setCurrentModule('documentManagement');
    } else if (location.includes('/validation-hub')) {
      setCurrentModule('validationHub');
    } else {
      setCurrentModule(null);
    }
  }, [location]);

  // Send welcome message when the assistant is first opened based on current module
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = { 
        sender: 'assistant', 
        text: currentModule 
          ? `Welcome to the ${MODULE_CONTEXTS[currentModule].title}. I can help you with ${MODULE_CONTEXTS[currentModule].capabilities.slice(0, 2).join(', ')}. How can I assist you today?`
          : "Welcome to TrialSage. I'm Lumen, your Digital Compliance Coach. I can help you navigate regulatory requirements, find information, or use any feature in TrialSage. How can I assist you today?"
      };
      setMessages([welcomeMessage]);
      
      // Set suggestions based on current module
      if (currentModule) {
        setSuggestions([
          `Help me with ${MODULE_CONTEXTS[currentModule].helpTopics[0]}`,
          `What can I do in this module?`,
          `Show me recent documents`
        ]);
      } else {
        setSuggestions([
          'Help me navigate to the IND Wizard',
          'What is 21 CFR Part 11 compliance?',
          'How do I create a new submission?'
        ]);
      }
    }
  }, [isOpen, messages.length, currentModule]);

  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Function to execute commands
  const executeCommand = useCallback((command, args) => {
    let responseText = '';
    let actionTaken = false;
    
    switch(command) {
      case 'NAVIGATE':
        const destination = args.toLowerCase();
        // Map common terms to URLs
        const urlMap = {
          'ind wizard': '/ind/wizard-v2',
          'ind': '/ind/wizard-v2',
          'csr intelligence': '/csr-intelligence',
          'csr': '/csr-intelligence',
          'document management': '/document-management',
          'documents': '/document-management',
          'vault': '/enterprise-vault',
          'enterprise vault': '/enterprise-vault',
          'validation hub': '/validation-hub',
          'validation': '/validation-hub',
          'home': '/',
          'dashboard': '/'
        };
        
        const url = urlMap[destination] || null;
        if (url) {
          // Provide a message first, then navigate
          responseText = `Navigating to ${destination}...`;
          actionTaken = true;
          
          // Use setTimeout to allow the message to appear before navigation
          setTimeout(() => {
            window.location.href = url;
          }, 1000);
        } else {
          responseText = `I'm sorry, I don't know how to navigate to "${args}". Try asking for one of our main modules like "IND Wizard", "CSR Intelligence", or "Document Management".`;
        }
        break;
        
      case 'SEARCH':
        const query = args;
        responseText = `Searching for "${query}" across all documents...`;
        
        // In a real implementation, this would trigger the search functionality
        // For demo purposes, we're just acknowledging the command
        actionTaken = true;
        
        // Update conversation context with search terms
        conversationContext.current.lastSearch = query;
        
        // Simulate search completion with timeout
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              sender: 'assistant', 
              text: `I found 5 documents matching "${query}":
              
1. Protocol Amendment - Phase 2 Study (Updated March 2025)
2. Safety Analysis Plan v2.3 (February 2025)
3. Clinical Study Report for Protocol AB-123 (January 2025)
4. FDA Meeting Minutes - Pre-IND Discussion (December 2024)
5. CMC Documentation - Drug Substance (November 2024)

Would you like me to open any of these documents?` 
            }
          ]);
        }, 2000);
        break;
        
      case 'CREATE':
        const documentType = args;
        const supportedTypes = ['ind submission', 'csr', 'protocol', 'report', 'document'];
        
        // Check if the requested type is supported
        const typeMatch = supportedTypes.find(type => documentType.toLowerCase().includes(type));
        
        if (typeMatch) {
          responseText = `I'll help you create a new ${documentType}. Let me guide you through the process.`;
          actionTaken = true;
          
          // Update context
          conversationContext.current.creatingDocument = documentType;
          
          // In a real implementation, this would launch the creation workflow
          setTimeout(() => {
            if (documentType.toLowerCase().includes('ind')) {
              setMessages(prevMessages => [
                ...prevMessages,
                { 
                  sender: 'assistant', 
                  text: `To start creating your IND submission, I'll need some basic information:

1. What's the name of the investigational product?
2. What's the proposed indication?
3. Is this the initial IND submission or an amendment?

You can also just navigate to the IND Wizard where I can guide you through each step.` 
                }
              ]);
            } else if (documentType.toLowerCase().includes('csr')) {
              setMessages(prevMessages => [
                ...prevMessages,
                { 
                  sender: 'assistant', 
                  text: `To create a new CSR, I'll need information about the clinical study:

1. What's the protocol number?
2. Was the study completed or terminated early?
3. Would you like to use a template based on ICH E3 guidelines?

I recommend using the CSR Intelligence module for this task, as it provides advanced features for CSR creation.` 
                }
              ]);
            }
          }, 2000);
        } else {
          responseText = `I'm sorry, I don't know how to create a "${documentType}". I can help you create an IND submission, CSR, protocol, or other regulatory documents.`;
        }
        break;
        
      case 'EXPLAIN':
        const term = args.toLowerCase();
        
        // Check if the term is in our knowledge base
        if (REGULATORY_KNOWLEDGE[term]) {
          responseText = REGULATORY_KNOWLEDGE[term];
          actionTaken = true;
        } else {
          // Check for partial matches
          const partialMatches = Object.keys(REGULATORY_KNOWLEDGE).filter(key => 
            term.includes(key) || key.includes(term)
          );
          
          if (partialMatches.length > 0) {
            const bestMatch = partialMatches[0]; // Take the first match
            responseText = `I think you're asking about ${bestMatch.toUpperCase()}: ${REGULATORY_KNOWLEDGE[bestMatch]}`;
            actionTaken = true;
          } else {
            responseText = `I don't have specific information about "${args}". Would you like me to help you search for this term in our documentation?`;
          }
        }
        break;
        
      case 'SHOW_DOCUMENTS':
        const location = args || 'all';
        responseText = `Retrieving your ${location === 'all' ? '' : location + ' '}documents...`;
        actionTaken = true;
        
        // Simulate fetching documents
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              sender: 'assistant', 
              text: `Here are your recent documents:
              
1. Protocol v2.5 - Last modified 2 days ago
2. Statistical Analysis Plan - Last modified 1 week ago
3. Investigator's Brochure - Last modified 2 weeks ago
4. Form 1572 Templates - Last modified 3 weeks ago
5. CMC Summary Document - Last modified 1 month ago

Would you like to open any of these documents?` 
            }
          ]);
        }, 2000);
        break;
        
      case 'SHOW_OVERDUE':
        const category = args || 'items';
        responseText = `Checking for overdue ${category}...`;
        actionTaken = true;
        
        // Simulate fetching overdue items
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              sender: 'assistant', 
              text: `I found the following overdue items:
              
1. Safety Report Submission - Due 3 days ago
2. Protocol Amendment Review - Due 1 week ago
3. CMC Documentation Update - Due 2 weeks ago
4. Investigator Response - Due 1 month ago

Would you like me to help you address any of these items?` 
            }
          ]);
        }, 2000);
        break;
        
      default:
        responseText = `I'm not sure how to process that command. Try asking for help or using more specific language.`;
    }
    
    return { responseText, actionTaken };
  }, []);

  // Process message and generate a more sophisticated response
  const processMessage = useCallback((message) => {
    const text = message.toLowerCase();
    let command = null;
    let args = null;
    
    // Check for command patterns
    for (const [cmdName, pattern] of Object.entries(COMMAND_PATTERNS)) {
      const match = text.match(pattern);
      if (match) {
        command = cmdName;
        // Get the argument portion based on the regex group
        args = match[match.length - 1].trim();
        break;
      }
    }
    
    // If a command was detected, execute it
    if (command) {
      return executeCommand(command, args);
    }
    
    // Handle contextual responses if no command was detected
    if (currentModule && Object.keys(MODULE_CONTEXTS).includes(currentModule)) {
      const moduleContext = MODULE_CONTEXTS[currentModule];
      
      // Check if the query relates to the current module
      for (const topic of moduleContext.helpTopics) {
        if (text.includes(topic)) {
          return { 
            responseText: `In the ${moduleContext.title}, ${topic} is a key component. Here's how it works...`, 
            actionTaken: false
          };
        }
      }
      
      // Check if asking about module capabilities
      if (text.includes('what can') || text.includes('capabilities') || text.includes('features')) {
        return { 
          responseText: `The ${moduleContext.title} offers: \n\n${moduleContext.capabilities.map(c => `• ${c}`).join('\n')}`, 
          actionTaken: false 
        };
      }
    }
    
    // Check for knowledge base terms
    for (const [term, definition] of Object.entries(REGULATORY_KNOWLEDGE)) {
      if (text.includes(term)) {
        return { 
          responseText: definition, 
          actionTaken: false 
        };
      }
    }
    
    // Default responses based on message context
    if (text.includes('thank')) {
      return { 
        responseText: "You're welcome! Is there anything else I can help you with?", 
        actionTaken: false 
      };
    }
    
    if (text.includes('hello') || text.includes('hi ')) {
      return { 
        responseText: "Hello! I'm Lumen, your Digital Compliance Coach. How can I assist you with regulatory documentation or compliance today?", 
        actionTaken: false 
      };
    }
    
    // Fallback to generic responses with contextual awareness
    return { 
      responseText: currentModule 
        ? `I understand you're working in the ${MODULE_CONTEXTS[currentModule].title}. Can you be more specific about what you need help with? You can ask about ${MODULE_CONTEXTS[currentModule].helpTopics.slice(0, 3).join(', ')}, or any other aspect of this module.`
        : "I'm here to help with your regulatory and compliance needs. You can ask me about document requirements, submission processes, or specific regulations like 21 CFR Part 11. Try asking something more specific or tell me what task you're trying to accomplish.", 
      actionTaken: false 
    };
  }, [currentModule, executeCommand]);

  // Function to handle sending a message
  const sendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage = { sender: 'user', text: userInput.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and suggestions
    setUserInput('');
    setSuggestions([]);
    
    // Set loading state
    setIsLoading(true);

    try {
      // Process the message
      setTimeout(() => {
        const { responseText, actionTaken } = processMessage(userMessage.text);
        
        // Only add the response if we're not taking an action that will add its own response
        if (!actionTaken) {
          setMessages(prevMessages => [
            ...prevMessages, 
            { sender: 'assistant', text: responseText }
          ]);
        }
        
        // Generate new contextual suggestions
        const newSuggestions = generateSuggestions(userMessage.text);
        setSuggestions(newSuggestions);
        
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [userInput, isLoading, toast, processMessage]);

  // Generate contextual suggestions based on user message and current context
  const generateSuggestions = useCallback((message) => {
    const lowerCaseMessage = message.toLowerCase();
    
    // If in a specific module, offer module-specific suggestions
    if (currentModule) {
      const moduleContext = MODULE_CONTEXTS[currentModule];
      
      // If asking about how to do something
      if (lowerCaseMessage.includes('how to') || lowerCaseMessage.includes('help')) {
        return [
          `Help me with ${moduleContext.helpTopics[0]}`,
          `Help me with ${moduleContext.helpTopics[1]}`,
          `What are best practices for ${moduleContext.helpTopics[2]}?`
        ];
      }
      
      // If asking about a specific topic
      for (const topic of moduleContext.helpTopics) {
        if (lowerCaseMessage.includes(topic)) {
          return [
            `Show me examples of ${topic}`,
            `What are the regulatory requirements for ${topic}?`,
            `How do I improve our ${topic}?`
          ];
        }
      }
      
      // Default module-specific suggestions
      return [
        `What are the key features of ${moduleContext.title}?`,
        `Help me create a new document`,
        `Show me recent activities`
      ];
    }
    
    // Generic suggestions based on message context
    if (lowerCaseMessage.includes('ind') || lowerCaseMessage.includes('submission')) {
      return [
        'Help me navigate to the IND Wizard',
        'What sections are required in an IND?',
        'How do I handle protocol amendments?'
      ];
    }
    
    if (lowerCaseMessage.includes('csr') || lowerCaseMessage.includes('clinical')) {
      return [
        'Take me to the CSR Intelligence module',
        'What is the ICH E3 structure?',
        'How should I report adverse events?'
      ];
    }
    
    if (lowerCaseMessage.includes('document') || lowerCaseMessage.includes('file')) {
      return [
        'Go to Document Management',
        'How do I ensure 21 CFR Part 11 compliance?',
        'Show me my recent documents'
      ];
    }
    
    // Default suggestions
    return [
      'Help me find regulatory guidance',
      'What modules are available in TrialSage?',
      'How do I get started with a new submission?'
    ];
  }, [currentModule]);

  // Function to use a suggestion
  const useSuggestion = useCallback((suggestion) => {
    setUserInput(suggestion);
  }, []);

  const contextValue = {
    isOpen,
    toggleAssistant,
    messages,
    isLoading,
    userInput,
    setUserInput,
    sendMessage,
    isExpanded,
    toggleExpanded,
    currentModule,
    suggestions,
    useSuggestion
  };

  return (
    <LumenAssistantContext.Provider value={contextValue}>
      {children}
    </LumenAssistantContext.Provider>
  );
};

export const useLumenAssistant = () => {
  const context = useContext(LumenAssistantContext);
  if (!context) {
    throw new Error('useLumenAssistant must be used within a LumenAssistantProvider');
  }
  return context;
};