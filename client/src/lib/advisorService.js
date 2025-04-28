// client/src/lib/advisorService.js
// Client-side service to provide fallback advisor data

/**
 * CTD Structure Checklist - for generating mock responses
 */
const CTDChecklist = {
  "Module 1": [
    "Form FDA 1571",
    "Cover Letter",
    "Table of Contents",
    "US Agent Appointment",
    "Financial Disclosure"
  ],
  "Module 2": [
    "Introduction Summary",
    "Quality Overall Summary",
    "Nonclinical Overview",
    "Clinical Overview",
    "Clinical Summary"
  ],
  "Module 3": [
    "Drug Substance Specs",
    "Drug Product Specs",
    "CMC Stability Data",
    "Analytical Methods",
    "GMP Certificates"
  ],
  "Module 4": [
    "Toxicology Reports",
    "Pharmacology Reports",
    "ADME Studies",
    "Carcinogenicity Studies",
    "Genotoxicity Studies"
  ],
  "Module 5": [
    "Clinical Study Reports (CSR)",
    "Protocol",
    "Investigator Brochure",
    "Case Report Forms",
    "Literature References"
  ]
};

/**
 * Fetch advisor readiness data, with fallback for development
 */
export async function getAdvisorReadiness(playbook = 'Fast IND Playbook') {
  try {
    // Try to fetch from API
    const response = await fetch(`/api/advisor/check-readiness?playbook=${encodeURIComponent(playbook)}`);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    console.error('Failed to load Advisor Readiness.');
    
    // Provide fallback data for development
    console.log('Using fallback data for demonstration');
    return generateFallbackData(playbook);
  } catch (error) {
    console.error('Error fetching advisor readiness:', error);
    return generateFallbackData(playbook);
  }
}

/**
 * Generate development fallback data based on playbook selection
 */
function generateFallbackData(playbook) {
  // Base CTD Checklist
  let checklist = { ...CTDChecklist };

  // Modify Checklist Dynamically Based on Playbook
  if (playbook === 'Fast IND Playbook') {
    // Relax certain sections for faster submission
    checklist["Module 4"] = checklist["Module 4"].filter(section => section.includes('Toxicology') || section.includes('Pharmacology'));
    checklist["Module 3"] = checklist["Module 3"].filter(section => section !== 'GMP Certificates');
  } else if (playbook === 'Full NDA Playbook') {
    // Full checklist — no changes needed
  } else if (playbook === 'EMA IMPD Playbook') {
    // Adjust for EMA focus
    checklist["Module 1"] = checklist["Module 1"].filter(section => section !== 'US Agent Appointment');
    checklist["Module 2"] = checklist["Module 2"].filter(section => section.includes('Intro Summary') || section.includes('Clinical Overview'));
  }

  // For demo, always return data as if metadata file doesn't exist
  const missingSections = Object.values(checklist).flat().slice(0, 8);
  
  // Create different readiness scores and risk levels based on playbook
  let readinessScore = 0;
  let riskLevel = "High";
  let estimatedDelayDays = 90;
  
  if (playbook === 'Fast IND Playbook') {
    readinessScore = 65;
    riskLevel = "Medium";
    estimatedDelayDays = 49;
  } else if (playbook === 'Full NDA Playbook') {
    readinessScore = 35;
    riskLevel = "High";
    estimatedDelayDays = 120;
  } else if (playbook === 'EMA IMPD Playbook') {
    readinessScore = 75;
    riskLevel = "Medium";
    estimatedDelayDays = 30;
  }
  
  const today = new Date();
  const estimatedSubmissionDate = new Date(today.setDate(today.getDate() + estimatedDelayDays)).toISOString().slice(0, 10);
  
  // Filter recommendations to match the selected playbook
  const recommendations = missingSections
    .filter((section, idx) => idx < 5) // Limit to top 5 recommendations
    .map(section => `Upload ${section} immediately.`);

  return {
    success: true,
    playbookUsed: playbook,
    readinessScore,
    missingSections,
    riskLevel,
    estimatedDelayDays,
    estimatedSubmissionDate,
    recommendations
  };
}