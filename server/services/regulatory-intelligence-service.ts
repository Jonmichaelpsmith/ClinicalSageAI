import { huggingFaceService, HFModel } from '../huggingface-service';
import { academicKnowledgeService } from './academic-knowledge-service';
import fs from 'fs';
import path from 'path';

interface RegulatoryRequirement {
  agency: string;
  guideline: string;
  requirement: string;
  applicable_phases: string[];
  compliance_level: 'mandatory' | 'recommended' | 'optional';
  document_reference: string;
  last_updated: string;
}

interface RegulatoryGuidance {
  title: string;
  agency: string;
  year: number;
  url?: string;
  summary: string;
  relevance_score: number;
  tags: string[];
}

interface RegulatorySummary {
  therapeutic_area: string;
  phase: string;
  key_requirements: RegulatoryRequirement[];
  relevant_guidance: RegulatoryGuidance[];
  special_considerations: string[];
}

/**
 * Service for providing FDA and global regulatory intelligence
 */
export class RegulatoryIntelligenceService {
  private guidanceDocuments: Map<string, RegulatoryGuidance> = new Map();
  private regulatoryRequirements: RegulatoryRequirement[] = [];
  private initialized: boolean = false;
  private regulatoryDataDir: string;
  
  constructor() {
    // Define the directory where regulatory data is stored
    this.regulatoryDataDir = path.join(process.cwd(), 'regulatory_data');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.regulatoryDataDir)) {
      fs.mkdirSync(this.regulatoryDataDir, { recursive: true });
    }
  }
  
  /**
   * Initialize the regulatory intelligence service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      console.log('Initializing regulatory intelligence service...');
      
      // Initialize academic knowledge service (if not already)
      await academicKnowledgeService.initialize();
      
      // Load pre-defined regulatory requirements
      await this.loadRegulatoryRequirements();
      
      // Load guidance documents
      await this.loadGuidanceDocuments();
      
      this.initialized = true;
      console.log(`Regulatory intelligence service initialized with ${this.regulatoryRequirements.length} requirements and ${this.guidanceDocuments.size} guidance documents`);
      return true;
    } catch (error) {
      console.error('Error initializing regulatory intelligence service:', error);
      return false;
    }
  }
  
  /**
   * Load regulatory requirements data
   */
  private async loadRegulatoryRequirements(): Promise<void> {
    try {
      // Define base FDA requirements
      const baseRequirements: RegulatoryRequirement[] = [
        {
          agency: 'FDA',
          guideline: 'ICH E6(R2) GCP',
          requirement: 'Informed Consent Documentation',
          applicable_phases: ['1', '2', '3', '4'],
          compliance_level: 'mandatory',
          document_reference: 'Section 4.8',
          last_updated: '2016-11-09'
        },
        {
          agency: 'FDA',
          guideline: 'ICH E6(R2) GCP',
          requirement: 'Adverse Event Reporting',
          applicable_phases: ['1', '2', '3', '4'],
          compliance_level: 'mandatory',
          document_reference: 'Section 4.11',
          last_updated: '2016-11-09'
        },
        {
          agency: 'FDA',
          guideline: '21 CFR Part 312',
          requirement: 'IND Submission',
          applicable_phases: ['1', '2', '3'],
          compliance_level: 'mandatory',
          document_reference: 'Subpart B',
          last_updated: '2021-04-01'
        },
        {
          agency: 'FDA',
          guideline: 'ICH E8(R1)',
          requirement: 'Quality by Design in Clinical Research',
          applicable_phases: ['1', '2', '3', '4'],
          compliance_level: 'recommended',
          document_reference: 'Section 3',
          last_updated: '2022-01-15'
        },
        {
          agency: 'FDA',
          guideline: 'ICH E9',
          requirement: 'Statistical Principles for Clinical Trials',
          applicable_phases: ['2', '3'],
          compliance_level: 'recommended',
          document_reference: 'Full Document',
          last_updated: '1998-02-05'
        },
        {
          agency: 'FDA',
          guideline: 'Guidance for Industry: Adaptive Designs for Clinical Trials of Drugs and Biologics',
          requirement: 'Adaptive Trial Design Considerations',
          applicable_phases: ['2', '3'],
          compliance_level: 'recommended',
          document_reference: 'Full Document',
          last_updated: '2019-11-01'
        },
        {
          agency: 'FDA',
          guideline: 'ICH E2A',
          requirement: 'Clinical Safety Data Management',
          applicable_phases: ['1', '2', '3', '4'],
          compliance_level: 'mandatory',
          document_reference: 'Full Document',
          last_updated: '1994-03-01'
        },
        {
          agency: 'FDA',
          guideline: 'Guidance for Industry: Patient-Reported Outcome Measures',
          requirement: 'Patient-Reported Outcome Validation',
          applicable_phases: ['2', '3'],
          compliance_level: 'recommended',
          document_reference: 'Full Document',
          last_updated: '2009-12-01'
        },
        {
          agency: 'FDA',
          guideline: '21 CFR Part 50',
          requirement: 'Protection of Human Subjects',
          applicable_phases: ['1', '2', '3', '4'],
          compliance_level: 'mandatory',
          document_reference: 'Full Document',
          last_updated: '2019-10-01'
        },
        {
          agency: 'FDA',
          guideline: 'ICH E3',
          requirement: 'Structure and Content of Clinical Study Reports',
          applicable_phases: ['1', '2', '3'],
          compliance_level: 'mandatory',
          document_reference: 'Full Document',
          last_updated: '1995-11-30'
        },
        {
          agency: 'FDA',
          guideline: 'FDAMA 115',
          requirement: 'Demographic Subgroup Reporting',
          applicable_phases: ['2', '3'],
          compliance_level: 'mandatory',
          document_reference: 'Section 115',
          last_updated: '2014-08-01'
        },
        {
          agency: 'EMA',
          guideline: 'Guideline on strategies to identify and mitigate risks for first-in-human clinical trials',
          requirement: 'First-in-Human Risk Mitigation',
          applicable_phases: ['1'],
          compliance_level: 'mandatory',
          document_reference: 'EMEA/CHMP/SWP/28367/07 Rev. 1',
          last_updated: '2017-07-20'
        }
      ];
      
      // Check if we have persisted requirements data file
      const requirementsFile = path.join(this.regulatoryDataDir, 'requirements.json');
      if (fs.existsSync(requirementsFile)) {
        try {
          const data = fs.readFileSync(requirementsFile, 'utf8');
          const savedRequirements = JSON.parse(data) as RegulatoryRequirement[];
          this.regulatoryRequirements = savedRequirements;
          console.log(`Loaded ${this.regulatoryRequirements.length} regulatory requirements from disk`);
        } catch (fileError) {
          console.error('Error loading regulatory requirements from file:', fileError);
          this.regulatoryRequirements = baseRequirements;
        }
      } else {
        // Use base requirements and save to disk
        this.regulatoryRequirements = baseRequirements;
        this.saveRegulatoryRequirements();
        console.log('Created initial regulatory requirements data');
      }
    } catch (error) {
      console.error('Error in loadRegulatoryRequirements:', error);
      throw error;
    }
  }
  
  /**
   * Save regulatory requirements to disk
   */
  private saveRegulatoryRequirements(): void {
    try {
      const requirementsFile = path.join(this.regulatoryDataDir, 'requirements.json');
      fs.writeFileSync(requirementsFile, JSON.stringify(this.regulatoryRequirements, null, 2));
    } catch (error) {
      console.error('Error saving regulatory requirements:', error);
    }
  }
  
  /**
   * Load guidance documents
   */
  private async loadGuidanceDocuments(): Promise<void> {
    try {
      // Define base guidance documents
      const baseGuidance: RegulatoryGuidance[] = [
        {
          title: 'E6(R2) Good Clinical Practice',
          agency: 'ICH/FDA',
          year: 2016,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e6r2-good-clinical-practice-integrated-addendum-ich-e6r1',
          summary: 'Integrated addendum to ICH E6(R1) providing standards for the conduct of clinical trials.',
          relevance_score: 1.0,
          tags: ['GCP', 'clinical practice', 'trial conduct']
        },
        {
          title: 'Adaptive Designs for Clinical Trials of Drugs and Biologics',
          agency: 'FDA',
          year: 2019,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/adaptive-designs-clinical-trials-drugs-and-biologics-guidance-industry',
          summary: 'Guidance on the use of adaptive designs for clinical trials to provide flexibility while maintaining trial integrity.',
          relevance_score: 0.9,
          tags: ['adaptive design', 'trial design', 'statistical methodology']
        },
        {
          title: 'E9 Statistical Principles for Clinical Trials',
          agency: 'ICH/FDA',
          year: 1998,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e9-statistical-principles-clinical-trials',
          summary: 'Guidance on statistical principles to be considered in the design, conduct, analysis, and evaluation of clinical trials.',
          relevance_score: 0.95,
          tags: ['statistics', 'trial design', 'methodology']
        },
        {
          title: 'Patient-Reported Outcome Measures: Use in Medical Product Development to Support Labeling Claims',
          agency: 'FDA',
          year: 2009,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/patient-reported-outcome-measures-use-medical-product-development-support-labeling-claims',
          summary: 'Guidance on the use of patient-reported outcome (PRO) instruments in medical product development.',
          relevance_score: 0.85,
          tags: ['PRO', 'endpoints', 'labeling']
        },
        {
          title: 'Considerations for the Development of Rare Disease Drugs',
          agency: 'FDA',
          year: 2019,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/rare-diseases-common-issues-drug-development-guidance-industry',
          summary: 'Guidance on drug development for rare diseases addressing unique challenges in trial design and evidence generation.',
          relevance_score: 0.8,
          tags: ['rare disease', 'orphan drugs', 'small populations']
        },
        {
          title: 'E11 Clinical Investigation of Medicinal Products in the Pediatric Population',
          agency: 'ICH/FDA',
          year: 2018,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e11r1-addendum-clinical-investigation-medicinal-products-pediatric-population',
          summary: 'Guidance on the investigation of medicinal products in pediatric populations.',
          relevance_score: 0.75,
          tags: ['pediatric', 'children', 'special population']
        },
        {
          title: 'E7 Studies in Support of Special Populations: Geriatrics',
          agency: 'ICH/FDA',
          year: 1994,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e7-studies-support-special-populations-geriatrics',
          summary: 'Guidance on the inclusion of geriatric patients in clinical trials.',
          relevance_score: 0.75,
          tags: ['geriatric', 'elderly', 'special population']
        },
        {
          title: 'Multiple Endpoints in Clinical Trials',
          agency: 'FDA',
          year: 2017,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/multiple-endpoints-clinical-trials-guidance-industry',
          summary: 'Guidance on handling multiple endpoints in clinical trials, including approaches to multiplicity.',
          relevance_score: 0.9,
          tags: ['endpoints', 'multiplicity', 'statistical methodology']
        },
        {
          title: 'Enrichment Strategies for Clinical Trials',
          agency: 'FDA',
          year: 2019,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/enrichment-strategies-clinical-trials-support-approval-human-drugs-and-biological-products',
          summary: 'Guidance on enrichment strategies to increase the efficiency of clinical trials.',
          relevance_score: 0.85,
          tags: ['enrichment', 'patient selection', 'trial efficiency']
        },
        {
          title: 'Master Protocols: Efficient Clinical Trial Design Strategies',
          agency: 'FDA',
          year: 2022,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/master-protocols-efficient-clinical-trial-design-strategies-expedite-development-drugs-and-biologics',
          summary: 'Guidance on the use of master protocols to evaluate multiple drugs or multiple indications efficiently.',
          relevance_score: 0.9,
          tags: ['master protocols', 'platform trials', 'umbrella trials', 'basket trials']
        }
      ];
      
      // Check if we have persisted guidance data file
      const guidanceFile = path.join(this.regulatoryDataDir, 'guidance.json');
      if (fs.existsSync(guidanceFile)) {
        try {
          const data = fs.readFileSync(guidanceFile, 'utf8');
          const savedGuidance = JSON.parse(data) as RegulatoryGuidance[];
          
          // Convert array to Map for faster lookups
          this.guidanceDocuments.clear();
          for (const doc of savedGuidance) {
            this.guidanceDocuments.set(doc.title, doc);
          }
          
          console.log(`Loaded ${this.guidanceDocuments.size} guidance documents from disk`);
        } catch (fileError) {
          console.error('Error loading guidance documents from file:', fileError);
          // Initialize with base guidance
          this.guidanceDocuments.clear();
          for (const doc of baseGuidance) {
            this.guidanceDocuments.set(doc.title, doc);
          }
        }
      } else {
        // Use base guidance and save to disk
        this.guidanceDocuments.clear();
        for (const doc of baseGuidance) {
          this.guidanceDocuments.set(doc.title, doc);
        }
        
        this.saveGuidanceDocuments();
        console.log('Created initial guidance documents data');
      }
    } catch (error) {
      console.error('Error in loadGuidanceDocuments:', error);
      throw error;
    }
  }
  
  /**
   * Save guidance documents to disk
   */
  private saveGuidanceDocuments(): void {
    try {
      const guidanceFile = path.join(this.regulatoryDataDir, 'guidance.json');
      const documents = Array.from(this.guidanceDocuments.values());
      fs.writeFileSync(guidanceFile, JSON.stringify(documents, null, 2));
    } catch (error) {
      console.error('Error saving guidance documents:', error);
    }
  }
  
  /**
   * Get regulatory requirements for a specific phase and therapeutic area
   */
  async getRequirements(phase: string, therapeuticArea?: string): Promise<RegulatoryRequirement[]> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Filter requirements by phase
    let requirements = this.regulatoryRequirements.filter(req => 
      req.applicable_phases.includes(phase) || req.applicable_phases.includes('all')
    );
    
    // Further filter by therapeutic area if provided
    if (therapeuticArea) {
      // This would need a more sophisticated mapping of therapeutic areas to requirements
      // For now, just return the phase-specific requirements
    }
    
    return requirements;
  }
  
  /**
   * Get relevant guidance documents for a specific phase and therapeutic area
   */
  async getGuidanceDocuments(phase: string, therapeuticArea?: string): Promise<RegulatoryGuidance[]> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Convert Map to array
    const allDocuments = Array.from(this.guidanceDocuments.values());
    
    // Filter by relevance to phase and therapeutic area
    // This would need a more sophisticated mapping in a real implementation
    // For now, return all documents sorted by relevance score
    return allDocuments.sort((a, b) => b.relevance_score - a.relevance_score);
  }
  
  /**
   * Get a comprehensive regulatory summary for a trial
   */
  async getRegulatoryIntelligence(phase: string, therapeuticArea?: string): Promise<RegulatorySummary> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Get requirements and guidance
    const requirements = await this.getRequirements(phase, therapeuticArea);
    const guidance = await this.getGuidanceDocuments(phase, therapeuticArea);
    
    // Generate special considerations using HuggingFace
    let specialConsiderations: string[] = [];
    
    try {
      const prompt = `
You are a regulatory expert at the FDA. Based on your knowledge of clinical trial regulations, provide 5 specific regulatory considerations for a Phase ${phase} clinical trial${therapeuticArea ? ` in ${therapeuticArea}` : ''}.

These should be focused on recent regulatory developments, common pitfalls, and areas of special regulatory scrutiny.

Format your response as a numbered list of 5 brief but specific considerations.
`;

      const response = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        800,
        0.3
      );
      
      // Parse the numbered list
      specialConsiderations = response
        .split(/\n\d+\.|\n-/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } catch (error) {
      console.error('Error generating special considerations:', error);
      specialConsiderations = [
        "Ensure complete adverse event reporting with appropriate causality assessment",
        "Verify that protocol amendments receive proper IRB/EC review and approval",
        "Maintain rigorous documentation of informed consent processes",
        "Implement robust data integrity and source data verification procedures",
        "Establish clear stopping rules and safety monitoring processes"
      ];
    }
    
    // Return comprehensive summary
    return {
      therapeutic_area: therapeuticArea || 'General',
      phase,
      key_requirements: requirements.slice(0, 8), // Limit to most important
      relevant_guidance: guidance.slice(0, 5),    // Top 5 most relevant
      special_considerations: specialConsiderations
    };
  }
  
  /**
   * Get FDA and global regulatory analysis for a specific protocol
   */
  async analyzeProtocolRegulatory(protocolText: string, phase: string, indication?: string): Promise<string> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Get regulatory intelligence relevant to this protocol
    const regulatoryContext = await this.getRegulatoryIntelligence(phase, indication);
    
    // Create context for AI analysis
    let regulatoryPrompt = `
You are a regulatory affairs expert specializing in clinical trials. Analyze the following protocol excerpt for regulatory compliance:

PROTOCOL EXCERPT:
${protocolText.substring(0, 3000)}...

RELEVANT FDA AND ICH REQUIREMENTS:
${regulatoryContext.key_requirements.map(req => 
  `- ${req.guideline}: ${req.requirement} (${req.compliance_level})`
).join('\n')}

APPLICABLE GUIDANCE:
${regulatoryContext.relevant_guidance.map(guide => 
  `- ${guide.title} (${guide.agency}, ${guide.year})`
).join('\n')}

SPECIAL CONSIDERATIONS:
${regulatoryContext.special_considerations.join('\n')}

Please provide a comprehensive regulatory analysis of this protocol addressing:
1. Compliance status with key FDA/ICH requirements
2. Potential regulatory gaps or concerns
3. Recommendations for addressing identified issues
4. Required regulatory submissions and timelines

Format your response as a structured professional regulatory assessment report.
`;

    // Get AI-generated analysis
    try {
      const response = await huggingFaceService.queryHuggingFace(
        regulatoryPrompt,
        HFModel.MISTRAL_LATEST,
        1500,
        0.3
      );
      
      return response;
    } catch (error) {
      console.error('Error generating regulatory analysis:', error);
      return 'Unable to generate regulatory analysis at this time. Please try again later.';
    }
  }
  
  /**
   * Get stats about the regulatory intelligence service
   */
  getStats() {
    return {
      initialized: this.initialized,
      requirements_count: this.regulatoryRequirements.length,
      guidance_count: this.guidanceDocuments.size,
      agencies: [...new Set(this.regulatoryRequirements.map(req => req.agency))]
    };
  }
}

// Export a singleton instance for convenience
export const regulatoryIntelligenceService = new RegulatoryIntelligenceService();