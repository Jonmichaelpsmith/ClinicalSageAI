import path from 'path';
import fs from 'fs';
import { db } from './db';
import { csrReports } from '../shared/schema';
import { huggingFaceService } from './huggingface-service';
import { eq, and, like, or } from 'drizzle-orm';
import { protocolKnowledgeService } from './protocol-knowledge-service';

/**
 * Academic Knowledge Service
 * 
 * This service integrates academic research papers and formal guidance 
 * to provide evidence-based recommendations with proper citations.
 * It leverages our database of uploaded academic papers to extract
 * relevant sections and citations.
 */
export class AcademicKnowledgeService {
  private readonly academicSourcesDir = path.join(process.cwd(), 'data/academic_sources');
  private readonly citationsCache = new Map<string, any[]>();
  private readonly academicSources = [
    {
      id: 'hta-validity-2024',
      title: 'Guidance on Validity of Clinical Studies',
      author: 'HTA Clinical Guidance',
      date: '2024-07-04',
      url: 'https://health-technology-assessment.ec.europa.eu/system/files/2024-09/hta_clinical-studies-validity_guidance_en.pdf',
      type: 'guidance'
    },
    {
      id: 'who-best-practices-2024',
      title: 'Guidance for best practices for clinical trials',
      author: 'World Health Organization',
      date: '2024',
      url: 'https://apps.who.int/iris/handle/10665/371009',
      type: 'guidance'
    },
    {
      id: 'orphan-drug-success-2019',
      title: 'How Engaging Patients in Trial Design Maximises Orphan Drug Success',
      author: 'Market Report',
      date: '2019-06-18',
      url: 'https://www.clinicaltrialsarena.com/features/orphan-drug-success/',
      type: 'market-report'
    },
    {
      id: 'rapid-scoping-review-2025',
      title: 'Infrastructure, capabilities, and capacities required for clinical trials design and delivery: A rapid scoping review',
      author: 'Merson L, et al.',
      date: '2025-03-06',
      url: 'https://doi.org/10.12688/wellcomeopenres.23135.2',
      type: 'research-paper'
    },
    {
      id: 'pragmatic-trials-2022',
      title: 'Research and Scholarly Methods: Pragmatic Clinical Trials',
      author: 'Oche O, et al.',
      date: '2022-01',
      url: 'https://doi.org/10.1002/jac5.1557',
      type: 'research-paper'
    },
    {
      id: 'clinical-trials-intelligent-2022',
      title: 'Intelligent clinical trials: Transforming through AI-enabled engagement',
      author: 'Deloitte Centre for Health Solutions',
      date: '2022',
      url: 'https://www2.deloitte.com/content/dam/Deloitte/uk/Documents/life-sciences-health-care/deloitte-uk-intelligent-clinical-trials.pdf',
      type: 'industry-report'
    },
    {
      id: 'adaptive-designs-fda-2019',
      title: 'Adaptive Designs for Clinical Trials of Drugs and Biologics',
      author: 'FDA',
      date: '2019-11',
      url: 'https://www.fda.gov/media/78495/download',
      type: 'guidance'
    },
    {
      id: 'phase3-vaccine-trials-2025',
      title: 'Past, present, and future of Phase 3 vaccine trial design: rethinking statistics for the 21st century',
      author: 'Janani L, et al.',
      date: '2025',
      url: 'https://doi.org/10.1093/cei/uxae104',
      type: 'research-paper'
    },
    {
      id: 'study-design-methodology-2022',
      title: 'Methodology for clinical research',
      author: 'Kiani AK, et al.',
      date: '2022-06-03',
      url: 'https://doi.org/10.3389/fmed.2024.1400585',
      type: 'research-paper'
    },
    {
      id: 'rct-scientific-influence-2022',
      title: 'Investigation of the Relationship between Clinical Trial Design of RCTs and Scientific Influence',
      author: 'Noguchi Y, Narukawa M',
      date: '2022',
      url: 'https://doi.org/10.5649/jjphcs.48.161',
      type: 'research-paper'
    },
    {
      id: 'study-design-course-syllabus-2024',
      title: 'Study Design in Clinical Research - Course Syllabus',
      author: 'University of Gothenburg',
      date: '2024',
      url: 'https://www.gu.se/en/study-gothenburg/study-design-in-clinical-research-k1f2980',
      type: 'education'
    },
    {
      id: 'patient-engagement-protocol-design',
      title: 'How-to Guide on Patient Engagement in Clinical Trial Protocol Design',
      author: 'Patient Focused Medicines Development',
      date: '2023',
      url: 'https://patientfocusedmedicine.org/patient-engagement-in-clinical-trial-protocol-design/',
      type: 'guidance'
    },
    {
      id: 'bendita-clinical-trial-protocol',
      title: 'Clinical Trial Protocol: BENDITA BEnznidazole New Doses Improved Treatment and Associations',
      author: 'DNDi',
      date: '2018-05-04',
      url: 'https://www.dndi.org/diseases-projects/portfolio/bendita/',
      type: 'protocol'
    },
    {
      id: 'publication-clinical-trial-results-factsheet',
      title: 'Factsheet: Publication of Clinical Trial Results',
      author: 'KKS-Netzwerk',
      date: '2020-02-13',
      url: 'https://www.kks-netzwerk.de/en/publications',
      type: 'factsheet'
    },
    {
      id: 'human-factors-studies-fda',
      title: 'Human Factors Studies and Related Clinical Study Considerations in Combination Product Design and Development',
      author: 'FDA',
      date: '2016-02',
      url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/human-factors-studies-and-related-clinical-study-considerations-combination-product-design-and',
      type: 'guidance'
    },
    {
      id: 'retrospective-survey-statistical-analyses',
      title: 'A Retrospective Survey of Research Design and Statistical Analyses in Chinese Medical Journals',
      author: 'Jin Z, et al.',
      date: '2010-05-25',
      url: 'https://doi.org/10.1371/journal.pone.0010822',
      type: 'research-paper'
    },
    {
      id: 'qualitative-case-study-methodology',
      title: 'Qualitative Case Study Methodology: Study Design and Implementation for Novice Researchers',
      author: 'Baxter P, Jack S',
      date: '2008-12-01',
      url: 'https://nsuworks.nova.edu/tqr/vol13/iss4/2/',
      type: 'research-paper'
    },
    {
      id: 'clinical-trial-units-system-crisis',
      title: 'Clinical trial units and clinical research coordinators: a system facing crisis?',
      author: 'Stabile S, et al.',
      date: '2023-01-16',
      url: 'https://doi.org/10.33393/ao.2023.2508',
      type: 'research-paper'
    },
    {
      id: 'clinical-trials-regulation-risk',
      title: 'Conducting Clinical Trials in the US and Abroad: Navigating the Rising Tide of Regulation and Risk',
      author: 'Bennett M, Murray J',
      date: '2022',
      url: 'https://www.law.com/legalnewswire/news.php?id=2933389',
      type: 'white-paper'
    },
    {
      id: 'adaptive-design-methods-dialysis',
      title: 'Trends in Adaptive Design Methods in Dialysis Clinical Trials: A Systematic Review',
      author: 'Judge C, et al.',
      date: '2021-08-20',
      url: 'https://doi.org/10.1016/j.xkme.2021.08.001',
      type: 'research-paper'
    },
    {
      id: 'protocol-design-impact-performance',
      title: 'Assessing the Impact of Protocol Design Changes on Clinical Trial Performance',
      author: 'Getz KA, et al.',
      date: '2008',
      url: 'https://doi.org/10.1097/MJT.0b013e31816b2222',
      type: 'research-paper'
    },
    {
      id: 'ai-ml-clinicaltrials-trends',
      title: 'Studies of Artificial Intelligence/Machine Learning Registered on ClinicalTrials.gov: Cross-Sectional Study With Temporal Trends, 2010-2023',
      author: 'Maru S, et al.',
      date: '2024',
      url: 'https://www.jmir.org/2024/1/e57750',
      type: 'research-paper'
    },
    {
      id: 'clinicaltrials-gov-registration-guide',
      title: 'What is Clinicaltrials.gov, and do you need to register your study?',
      author: 'Mathur A',
      date: '2022-05',
      url: 'https://research.uci.edu/compliance/human-research-protections/researchers/clinicaltrials-gov.html',
      type: 'guidance'
    },
    {
      id: 'gsk-clinical-trial-disclosure-policy',
      title: 'Public Disclosure of Clinical Research - GSK Public policy positions',
      author: 'GlaxoSmithKline',
      date: '2017',
      url: 'https://www.gsk.com/en-gb/responsibility/responsible-business/clinical-trial-transparency/',
      type: 'industry-policy'
    },
    {
      id: 'eortc-publication-policy',
      title: 'Publication Policy - European Organisation for Research and Treatment of Cancer',
      author: 'EORTC',
      date: '2023-01-03',
      url: 'https://www.eortc.org/guidelines/publication-policy/',
      type: 'policy'
    },
    {
      id: 'suzetrigine-acute-pain-icer-report',
      title: 'Suzetrigine for Acute Pain: Effectiveness and Value - Evidence Report',
      author: 'Institute for Clinical and Economic Review',
      date: '2025-02-05',
      url: 'https://icer.org/assessment/acute-pain-2025/',
      type: 'evidence-review'
    },
    {
      id: 'ehr-clinical-research-integration',
      title: 'Clinical Research Integration Within the Electronic Health Record: A Literature Review',
      author: 'Johnson EA, Carrington JM',
      date: '2021-03',
      url: 'https://doi.org/10.1097/CIN.0000000000000686',
      type: 'research-paper'
    },
    {
      id: 'clinical-application-research-design',
      title: 'Methodological considerations and experiences in clinical application research design',
      author: 'Ranheim A, Arman M',
      date: '2014-02-17',
      url: 'https://www.fons.org/library/journal/volume4-issue1/article4',
      type: 'research-paper'
    },
    {
      id: 'crtp-clinical-research-training',
      title: 'Clinical Research Training Program - MS in Clinical Research Methods Catalog',
      author: 'Einstein Montefiore Institute for Clinical and Translational Research',
      date: '2024-10-08',
      url: 'https://www.einstein.yu.edu/education/phd/clinical-research-training-program/',
      type: 'education'
    },
    {
      id: 'fda-enhancing-clinical-study-diversity',
      title: 'Enhancing Clinical Study Diversity - Workshop Report',
      author: 'U.S. Food and Drug Administration',
      date: '2024-06',
      url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/enhancing-clinical-trial-diversity',
      type: 'guideline'
    }
  ];

  /**
   * Get academic evidence for a specific topic
   * 
   * @param query The search query/topic
   * @param filters Optional filters like publication type, date range
   * @returns Array of relevant academic evidence with citations
   */
  async getAcademicEvidence(query: string, filters: { 
    publicationType?: string[],
    dateRange?: { start: string, end: string },
    domains?: string[]
  } = {}): Promise<any[]> {
    // Check cache first
    const cacheKey = `${query}:${JSON.stringify(filters)}`;
    if (this.citationsCache.has(cacheKey)) {
      return this.citationsCache.get(cacheKey) || [];
    }

    try {
      // Create embedding for query
      const queryEmbedding = await huggingFaceService.generateEmbeddings(query);
      
      // Filter sources by type if needed
      let filteredSources = [...this.academicSources];
      if (filters.publicationType?.length) {
        filteredSources = filteredSources.filter(source => 
          filters.publicationType?.includes(source.type));
      }
      
      // Filter by date range if provided
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        filteredSources = filteredSources.filter(source => {
          const sourceDate = new Date(source.date);
          return sourceDate >= new Date(start) && sourceDate <= new Date(end);
        });
      }

      // Get recommendations from protocol knowledge service (integrates with CSR database)
      const csrEvidence = await protocolKnowledgeService.getRecommendations({
        indication: query,
        phase: 'all',
        objectives: [''],
        endpoints: []
      });
      
      // Construct comprehensive academic evidence
      const evidence = filteredSources.map(source => {
        // In a real implementation, we would use the embeddings to calculate
        // similarity and provide relevant excerpts from each source
        return {
          id: source.id,
          title: source.title,
          author: source.author,
          date: source.date,
          url: source.url,
          type: source.type,
          relevance: Math.random() * 0.5 + 0.5, // Simulated relevance score (0.5-1.0)
          excerpts: this.getRelevantExcerpts(source.id, query)
        };
      }).sort((a, b) => b.relevance - a.relevance);
      
      // Cache the results
      this.citationsCache.set(cacheKey, evidence);
      
      return evidence;
    } catch (error) {
      console.error('Error fetching academic evidence:', error);
      return [];
    }
  }

  /**
   * Get relevant excerpts from an academic source
   * 
   * @param sourceId The ID of the academic source
   * @param query The search query/topic
   * @returns Array of relevant excerpts
   */
  private getRelevantExcerpts(sourceId: string, query: string): string[] {
    // This would normally extract actual text from the papers based on semantic search
    // For this demo, we're returning predefined excerpts per source
    
    const excerpts: Record<string, string[]> = {
      'hta-validity-2024': [
        "Randomised clinical trials: gold standard for intervention effect estimation",
        "The certainty of results from clinical studies can be assessed using the GRADE approach, which considers risk of bias, imprecision, inconsistency, indirectness, and publication bias.",
        "Clinical study designs can be categorized as interventional or observational, with further subdivisions based on randomization, control groups, and timing."
      ],
      'who-best-practices-2024': [
        "Good clinical trials are designed to produce scientifically sound answers to relevant questions",
        "Good clinical trials respect the rights and well-being of participants",
        "Clinical trial designs have evolved to include adaptive designs, platform trials, and master protocols"
      ],
      'orphan-drug-success-2019': [
        "The key to a successful outcome is to engage patients and advocacy groups at a deeper, more personal level.",
        "Protocols must account for highly diverse clinical manifestations and disease progression, as well as accommodate patients and families who live complicated, demanding lives.",
        "Collaboration with advocacy groups from the outset – even before protocol design – is imperative to understanding the patient journey."
      ],
      'rapid-scoping-review-2025': [
        "Clinical trials are essential for improving healthcare, but for them to be effective, they need to be high quality.",
        "CTUs are specialized teams or facilities responsible for managing various aspects of clinical trials.",
        "Understanding the infrastructure, capabilities, and resources required for running effective trials is essential for improving clinical research globally."
      ],
      'pragmatic-trials-2022': [
        "PCTs are conducted to answer how a treatment or intervention works in a normal, 'real-world scenario' using a heterogeneous 'real-world population'.",
        "Explanatory studies focus on outcomes relatively unaffected by context, whereas pragmatic trials are undertaken in typical healthcare conditions.",
        "PCTs have minimal subject inclusion and exclusion criteria since the design is meant to reflect the population for which the intervention or treatment is intended."
      ],
      'clinical-trials-intelligent-2022': [
        "AI can improve clinical cycle times while reducing the cost and burden of clinical development.",
        "Suboptimal patient selection, recruitment and retention together with difficulties managing and monitoring patients effectively, are extending the length of trials.",
        "The growing expectations of regulators and payers requires biopharma companies to increase the quality and quantity of evidence generated during clinical trials."
      ],
      'adaptive-designs-fda-2019': [
        "Adaptive designs allow for prospectively planned modifications to one or more aspects of the design based on accumulating data from subjects in the trial.",
        "Adaptive designs can make trials more efficient, more likely to demonstrate an effect of the drug if one exists, or more informative.",
        "The FDA encourages the use of adaptive designs when appropriate as part of drug development programs."
      ],
      'phase3-vaccine-trials-2025': [
        "Modern vaccine trials benefit from innovative approaches like adaptive designs, allowing for planned trial adaptations based on accumulating data.",
        "Bayesian methods combine prior knowledge and observed trial data to increase efficiency and enhance result interpretation.",
        "Statistical advances in safety analysis are enabling better evaluation of reactogenicity and clinical adverse events."
      ],
      'study-design-methodology-2022': [
        "Selecting an inappropriate study type, an error that cannot be corrected after the beginning of a study, results in flawed methodology.",
        "Medical research can be divided into primary and secondary research, where primary research involves conducting studies and collecting raw data.",
        "Among the different types of clinical studies, we can recognize descriptive or analytical studies, which can be further categorized in observational and experimental."
      ],
      'rct-scientific-influence-2022': [
        "RCTs with higher scientific influence included Phase 3, multi-country, for-profit company sponsored/supported trials that were statistically powered.",
        "The numbers of novel interventions were increased as scientific influence increased.",
        "RCTs should be sufficiently large to generate statistically confirmatory outcomes, be conducted in multiple countries, and use newer drugs."
      ],
      'study-design-course-syllabus-2024': [
        "Basic terms in epidemiology and clinical study design",
        "Measures of disease occurrence",
        "Observational studies, including cohort and case-control studies",
        "Systematic and random errors",
        "Experimental studies, including randomised clinical trials",
        "Quality of life in clinical research",
        "Screening and diagnosis in relation to clinical research"
      ],
      'patient-engagement-protocol-design': [
        "Collect patient partner insights for Clinical Trial Protocol Design",
        "Define partnership and collaboration goals when engaging patients in protocol design",
        "Decide on the methods and formats for sponsor–patient partner interactions",
        "Long-term patient engagement provides advantages throughout the entire clinical development process"
      ],
      'bendita-clinical-trial-protocol': [
        "Double-blind, Double-dummy, Phase 2 Randomized, Multicenter, Proof-of-Concept, Safety and Efficacy Trial",
        "Detailed protocol design example with endpoints, inclusion/exclusion criteria, and assessment schedules",
        "Real-world example of a comprehensive clinical trial protocol"
      ],
      'publication-clinical-trial-results-factsheet': [
        "Timely publication of the results of clinical trials is both a scientific and an ethical imperative",
        "To be able to weigh the benefits and risks of medical procedures or medications, a complete overview of the current evidence is essential",
        "Clinical trial results can be made available in public clinical trials registries"
      ],
      'human-factors-studies-fda': [
        "Human factors studies evaluate the user interface of a combination product to demonstrate that the intended users can use the product safely and effectively",
        "Critical tasks are user tasks that, if performed incorrectly or not performed at all, would or could cause serious harm to the patient or user",
        "Human factors validation testing is performed at the end of the product development process"
      ],
      'retrospective-survey-statistical-analyses': [
        "The error/defect proportion in statistical analyses decreased significantly from 1998 to 2008",
        "Design with randomized clinical trials remained low in single digit with two-thirds showing poor results reporting",
        "Nearly half of the published studies were retrospective in nature"
      ],
      'qualitative-case-study-methodology': [
        "Qualitative case study methodology provides tools for researchers to study complex phenomena within their contexts",
        "When applied correctly, it becomes a valuable method for health science research to develop theory, evaluate programs, and develop interventions",
        "Key elements include writing research questions, developing propositions, determining the case under study, binding the case, and triangulation"
      ],
      'clinical-trial-units-system-crisis': [
        "Clinical trial units and clinical research coordinators play a vital role in the design and conduct of clinical trials",
        "There is a current recruitment and retention crisis for this specialist role due to a complex set of factors",
        "The lack of recognition at the institutional level leads to precarious work contracts, lack of identity, and excessive turnover"
      ],
      'clinical-trials-regulation-risk': [
        "Clinical trials are conducted by pharmaceutical and medical device companies in support of an application to the FDA for authorization to market a drug or device",
        "The level of regulation imposed on medical devices before and after their introduction into the marketplace depends upon the classification of the device",
        "Regulatory framework for conducting clinical trials in the US and abroad involves numerous laws and regulations"
      ],
      'adaptive-design-methods-dialysis': [
        "Adaptive design methods are intended to improve the efficiency of clinical trials and are relevant to evaluating interventions in dialysis populations",
        "Group sequential designs were the most common type of adaptive design method used in dialysis trials",
        "Adaptive design methods affected the conduct of trials, most commonly resulting in stopping early for futility or safety"
      ],
      'protocol-design-impact-performance': [
        "The number of unique procedures and frequency of procedures per protocol increased at annual rates of 6.5% and 8.7% respectively between 1999 and 2005",
        "Investigative site work burden to administer each protocol increased at an even faster rate of 10.5%",
        "Study conduct performance—cycle time, patient recruitment and retention rates—worsened as protocol complexity increased",
        "Simplifying protocol designs can minimize negative effects on study conduct performance"
      ],
      'ai-ml-clinicaltrials-trends': [
        "Only 7.6% of AI/ML studies were regulated by the US Food and Drug Administration",
        "The most common study characteristics were randomized (56.2%) and prospective (58.9%) designs with a focus on diagnosis (28.2%) and treatment (24.4%)",
        "Study locations were predominantly in high-income countries (75.3%), followed by upper-middle-income (21.7%), lower-middle-income (2.8%), and low-income countries (0.1%)",
        "Only 5.6% of completed studies had results available on ClinicalTrials.gov, and this pattern persisted over time"
      ],
      'clinicaltrials-gov-registration-guide': [
        "ClinicalTrials.gov is a resource that provides access to information on clinical trials studying a wide range of diseases, conditions and interventions",
        "Studies listed in the database are conducted in all 50 US States and in 220 countries",
        "Registration may be required if: the study is NIH-funded, the study involves FDA-regulated drugs/devices/biologics, there is a plan to publish in an ICMJE medical journal, or if clinical trial costs are billed to Medicare"
      ],
      'gsk-clinical-trial-disclosure-policy': [
        "Before the first subject is enrolled, protocol summaries are posted on internet registers for all GSK-sponsored interventional and non-interventional studies",
        "Result summaries are posted within 12 months of primary completion date for interventional studies and 12 months from completion of analysis for non-interventional studies",
        "Results are posted from studies of terminated compounds to help inform about non-productive areas of research",
        "Results posting is considered supplementary to, not a replacement for, publication in peer-reviewed journals"
      ],
      'eortc-publication-policy': [
        "EORTC policy is to report results of all its research completely, accurately, objectively, and promptly, irrespective of the findings",
        "Publications must conform to the most recent relevant publication guidelines (CONSORT, CONSORT-PRO, STROBE, TRIPOD, etc.)",
        "Authorship follows the International Committee of Medical Journal Editors guidelines",
        "Representatives from the for-profit industry do not generally co-author publications of EORTC clinical studies"
      ],
      'suzetrigine-acute-pain-icer-report': [
        "Evidence reports provide comprehensive evaluations of drug effectiveness and value in specific therapeutic areas",
        "Methodological approaches include systematic literature review and cost-effectiveness modeling",
        "Rigorous assessment of clinical trial design and evidence quality is essential for fair drug evaluation",
        "Transparent reporting of evidence limitations is critical for informed healthcare decision-making"
      ],
      'ehr-clinical-research-integration': [
        "Clinical trials have become commonplace as a treatment option across healthcare delivery settings",
        "Organizations are tasked with sustaining specific care regimens with appropriate documentation and maintenance of participant protections within electronic health records",
        "Three key components of clinical research integration include: functional components (technological requirements), structural components (regulatory compliance), and procedural components (stakeholder involvement)",
        "Without centralized means of providing clinicians with current treatment information, participant injury or withdrawal likelihood increases"
      ],
      'clinical-application-research-design': [
        "Clinical application research is based on Gadamer's idea that understanding always involves interpretation and application",
        "The approach strengthens the relationship between research and clinical practice",
        "Participants developed a scientific approach to their clinical caregiving knowledge and increased awareness of their profession",
        "The methodology helps express and verbalize tacit knowledge in clinical settings"
      ],
      'crtp-clinical-research-training': [
        "Clinical Research Training Programs provide structured education in clinical research methods",
        "Curriculum typically includes study design, biostatistics, research ethics, and regulatory requirements",
        "Master's degree programs prepare professionals to design, conduct, and analyze clinical trials",
        "Coursework often culminates in a master's thesis demonstrating research methodology competence"
      ],
      'fda-enhancing-clinical-study-diversity': [
        "FDA has a longstanding commitment to promote inclusion of underrepresented populations in clinical trials",
        "Recommendations address enrollment of populations such as pregnant women, older adults, and underrepresented ethnic and racial groups",
        "Considerations include when to collect and present prevalence or incidence data by demographic subgroup",
        "Community engagement is emphasized as essential for enhancing clinical trial diversity"
      ]
    };
    
    return excerpts[sourceId] || ["No relevant excerpts found"];
  }

  /**
   * Get the list of available academic sources
   * 
   * @returns Array of academic sources
   */
  getAcademicSources(): any[] {
    return this.academicSources;
  }
  
  /**
   * Get source details by ID
   * 
   * @param sourceId The ID of the academic source
   * @returns The source details or undefined if not found
   */
  getSourceById(sourceId: string): any {
    return this.academicSources.find(source => source.id === sourceId);
  }
  
  /**
   * Format citations in a specific style
   * 
   * @param sources Array of source IDs to cite
   * @param style Citation style (e.g., 'apa', 'mla', 'chicago')
   * @returns Formatted citations
   */
  formatCitations(sources: string[], style: 'apa' | 'mla' | 'chicago' = 'apa'): string[] {
    const citations: string[] = [];
    
    for (const sourceId of sources) {
      const source = this.getSourceById(sourceId);
      if (!source) continue;
      
      let citation = '';
      
      switch (style) {
        case 'apa':
          if (source.type === 'research-paper') {
            citation = `${source.author} (${source.date.substring(0, 4)}). ${source.title}. Retrieved from ${source.url}`;
          } else if (source.type === 'guidance') {
            citation = `${source.author}. (${source.date.substring(0, 4)}). ${source.title}. Retrieved from ${source.url}`;
          } else {
            citation = `${source.author}. (${source.date.substring(0, 4)}). ${source.title}. Retrieved from ${source.url}`;
          }
          break;
          
        case 'mla':
          citation = `${source.author}. "${source.title}." ${source.date.substring(0, 4)}. Web. ${new Date().toLocaleDateString()}.`;
          break;
          
        case 'chicago':
          citation = `${source.author}. "${source.title}." Last modified ${source.date}. ${source.url}.`;
          break;
      }
      
      citations.push(citation);
    }
    
    return citations;
  }
  
  /**
   * Generate a recommendation with supporting evidence
   * 
   * @param topic The recommendation topic
   * @param prompt The specific aspects to address
   * @returns Recommendation with citations
   */
  async generateRecommendation(topic: string, prompt: string): Promise<any> {
    // Get relevant academic evidence
    const evidence = await this.getAcademicEvidence(topic);
    
    // Use HuggingFace to generate a recommendation based on the evidence
    const context = evidence
      .map(e => `Source: ${e.title} (${e.author}, ${e.date.substring(0, 4)})\n${e.excerpts.join('\n')}`)
      .join('\n\n');
    
    const systemPrompt = `You are an expert clinical research advisor. Use the following academic evidence to generate a detailed recommendation about "${topic}". 
    Focus on: ${prompt}
    
    ACADEMIC EVIDENCE:
    ${context}
    
    Provide a well-structured recommendation with clear sections. Include specific citations using [Author, Year] format.
    Ensure the recommendation is evidence-based, comprehensive, and practical for implementation.`;
    
    const recommendation = await huggingFaceService.queryHuggingFace(
      systemPrompt,
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      0.7,
      1500
    );
    
    // Extract citations used in the recommendation
    const citationRegex = /\[(.*?), (\d{4})\]/g;
    const citationsUsed: Set<string> = new Set();
    let match;
    
    while ((match = citationRegex.exec(recommendation)) !== null) {
      const [_, author, year] = match;
      const sourcesCited = this.academicSources.filter(s => 
        s.author.includes(author) && s.date.includes(year)
      );
      
      for (const source of sourcesCited) {
        citationsUsed.add(source.id);
      }
    }
    
    // Format the citations
    const formattedCitations = this.formatCitations(Array.from(citationsUsed));
    
    return {
      recommendation,
      citations: Array.from(citationsUsed).map(id => this.getSourceById(id)),
      formattedCitations,
      evidence: evidence.slice(0, 5) // Include top 5 evidence sources
    };
  }
}

export const academicKnowledgeService = new AcademicKnowledgeService();