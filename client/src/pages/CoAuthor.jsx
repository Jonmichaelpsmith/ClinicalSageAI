import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Clock,
  LucideUsers as Users,
  History,
  CheckCircle2,
  GitCompare,
  Download,
  Loader2,
  Clipboard,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';

export default function CoAuthor() {
  // Document editor state
  const [documentText, setDocumentText] = useState(`# 2.5 Clinical Overview

## 2.5.1 Product Development Rationale

Drug X was developed to address the significant unmet medical need in patients with Condition Y, which affects approximately 2 million people in the United States. Current treatments are limited by suboptimal efficacy and significant safety concerns, particularly hepatotoxicity and cardiovascular effects.

The novel mechanism of action of Drug X, which selectively inhibits Enzyme Z, provides a targeted approach to disease modification while potentially avoiding the safety issues associated with existing therapies.

## 2.5.2 Overview of Biopharmaceutics

Drug X is formulated as an immediate-release tablet containing 50 mg of active ingredient. The compound demonstrates pH-dependent solubility, with higher solubility in acidic conditions. Bioavailability is approximately 65% under fasted conditions. Food effects are minimal, with a slight increase in AUC (approximately 15%) when administered with a high-fat meal.

## 2.5.5 Overview of Safety

The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).

Serious adverse events occurred in 2.3% of Drug X-treated subjects compared to 2.1% in the placebo group. No drug-related deaths were reported. Laboratory abnormalities were infrequent, with transient elevations in liver enzymes (ALT/AST >3x ULN) observed in 1.2% of subjects, all resolving without intervention.

Vital sign changes were minimal, with a mean increase in systolic blood pressure of 2 mmHg compared to baseline.

`);
  const [currentSection, setCurrentSection] = useState('2.5.5');
  const [documentVersion, setDocumentVersion] = useState('v1.0');
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Add state for tree view
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  
  // Add states for document sections
  const [expandedSections, setExpandedSections] = useState({
    'module-1': false,
    'module-2': true,
    'module-3': false,
    'module-4': false,
    'module-5': false,
    'm2-2': false,
    'm2-3': false,
    'm2-4': false,
    'm2-5': true,
    'm2-6': false,
    'm2-7': false,
    'm2-5-1': true,
    'm2-5-2': true,
    'm2-5-3': false,
    'm2-5-4': false,
    'm2-5-5': true,
    'm2-5-6': false,
  });
  
  // Team collaboration state
  const [teamCollabOpen, setTeamCollabOpen] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  // AI Assistant state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantMode, setAiAssistantMode] = useState('suggestions'); // 'suggestions', 'compliance', 'formatting'
  const [aiUserQuery, setAiUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  const { toast } = useToast();
  
  const [validationResults] = useState({
    completeness: 78,
    consistency: 92,
    references: 65,
    regulatory: 87,
    issues: [
      {
        id: 1,
        severity: 'critical',
        section: '2.5.4',
        description: 'Missing source citations for efficacy claims',
        suggestion: 'Add references to support the primary endpoint efficacy claims'
      },
      {
        id: 2,
        severity: 'major',
        section: '2.5.6',
        description: 'Incomplete benefit-risk assessment',
        suggestion: 'Expand the benefit-risk section to include analysis of secondary endpoints'
      },
      {
        id: 3,
        severity: 'minor',
        section: '2.5.2',
        description: 'Inconsistent product name usage',
        suggestion: 'Standardize product name as "Drug X" throughout the document'
      },
      {
        id: 4,
        severity: 'info',
        section: '2.5.1',
        description: 'FDA guidance updated since last edit',
        suggestion: 'Review latest FDA guidance on clinical overview format'
      }
    ]
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeTrackChanges: false,
    includeCoverPage: true,
    includeTableOfContents: true,
    includeAppendices: true
  });
  
  // Document versions history
  const [versions] = useState([
    {
      id: 1,
      version: 'v1.0',
      date: 'May 8, 2025',
      author: 'John Doe',
      changeDescription: 'Initial draft',
      wordCount: 1543,
      status: 'Current',
      commitHash: '8a72b34c5910',
    },
    {
      id: 2,
      version: 'v0.9',
      date: 'May 6, 2025',
      author: 'John Doe',
      changeDescription: 'Pre-final review with edits from regulatory team',
      wordCount: 1498,
      commitHash: '6f45a1d2c387',
      status: 'Previous'
    },
    {
      id: 3,
      version: 'v0.8',
      date: 'May 3, 2025',
      author: 'Jane Smith',
      changeDescription: 'Incorporated safety data updates',
      wordCount: 1423,
      commitHash: '4d3c2b1a9876',
      status: 'Previous'
    }
  ]);

  // Mock documents data
  const [documents] = useState([
    { 
      id: 1, 
      title: 'Module 2.5 Clinical Overview', 
      module: 'Module 2',
      lastEdited: '2 hours ago',
      editedBy: 'John Doe',
      status: 'In Progress',
      version: 'v4.0',
      reviewers: ['Emily Chen', 'David Kim']
    },
    { 
      id: 2, 
      title: 'CMC Section 3.2.P', 
      module: 'Module 3',
      lastEdited: '1 day ago',
      editedBy: 'Mark Wilson',
      status: 'Draft',
      version: 'v1.4',
      reviewers: []
    },
    { 
      id: 3, 
      title: 'Clinical Overview', 
      module: 'Module 2',
      lastEdited: '3 days ago',
      editedBy: 'Jane Smith',
      status: 'Final',
      version: 'v3.0',
      reviewers: ['Robert Johnson', 'Emily Chen', 'David Kim']
    },
    { 
      id: 4, 
      title: 'Module 1.2 Application Form', 
      module: 'Module 1',
      lastEdited: '5 days ago',
      editedBy: 'Sarah Williams',
      status: 'In Review',
      version: 'v2.1',
      reviewers: ['John Doe', 'Mark Wilson']
    },
    { 
      id: 5, 
      title: 'Module 5.3.5 Integrated Summary of Efficacy', 
      module: 'Module 5',
      lastEdited: '1 week ago',
      editedBy: 'Emily Chen',
      status: 'Final',
      version: 'v2.0',
      reviewers: ['Jane Smith', 'Robert Johnson']
    }
  ]);
  
  // Mock templates data
  const [templates] = useState([
    {
      id: 1,
      name: 'Clinical Overview Template - ICH Compliant',
      category: 'Module 2.5',
      lastUpdated: '2 days ago',
      regions: [
        { id: 1, region: 'FDA' },
        { id: 2, region: 'EMA' },
        { id: 3, region: 'PMDA' }
      ]
    },
    {
      id: 2,
      name: 'Quality Overall Summary Template',
      category: 'Module 2.3',
      lastUpdated: '1 week ago',
      regions: [
        { id: 1, region: 'FDA' },
        { id: 2, region: 'EMA' }
      ]
    },
    {
      id: 3,
      name: 'Nonclinical Overview Template',
      category: 'Module 2.4',
      lastUpdated: '2 weeks ago',
      regions: [
        { id: 1, region: 'FDA' },
        { id: 2, region: 'EMA' },
        { id: 3, region: 'PMDA' },
        { id: 4, region: 'Health Canada' }
      ]
    }
  ]);
  
  // AI handler functions
  const handleAiQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!aiUserQuery.trim()) return;
    
    setAiIsLoading(true);
    setAiError(null);
    
    try {
      // Call AI service based on mode
      let responseText = '';
      
      // In a real implementation, these would be API calls
      if (aiAssistantMode === 'compliance') {
        // Simulate compliance check response
        responseText = `## Compliance Analysis for Section ${currentSection}

Based on ICH and FDA guidelines, I've identified the following compliance issues:

1. **Missing Information**: The adverse event frequencies should include confidence intervals when presenting the 12% headache incidence.

2. **Inconsistent Terminology**: The document uses both "Drug X" and "the compound" - regulatory standards require consistent terminology.

3. **Incomplete Safety Data**: Section should include discussion of special populations (elderly, pediatric, renal impairment) as required by ICH M4E guidance.

### Recommended Actions:
- Add confidence intervals for the primary adverse event frequencies
- Standardize terminology throughout the document
- Add subsections addressing special populations with available data or justify their absence`;
      } 
      else if (aiAssistantMode === 'formatting') {
        // Simulate formatting analysis response
        responseText = `## Formatting Analysis

The current section has several formatting inconsistencies:

1. **Headers**: Inconsistent capitalization in headers ("Overview of Safety" vs other headers using sentence case)

2. **Numbers**: Numbers under 10 should be spelled out according to scientific writing conventions

3. **Units**: Add space between number and unit (e.g., "2mmHg" should be "2 mmHg")

4. **Tables**: The safety data would be more readable in a structured table format

### Suggested Format:
\`\`\`
## 2.5.5 Overview of Safety

The safety profile of Drug X was assessed in six randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects; 95% CI: 10.2-13.8%).

Table 2.5.5-1: Common Adverse Events (≥5% incidence)
| Adverse Event | Drug X (N=830) | Placebo (N=415) |
|---------------|---------------|----------------|
| Headache      | 12.0%         | 11.5%          |
| Nausea        | 8.2%          | 6.5%           |
| Dizziness     | 6.5%          | 4.2%           |
\`\`\``;
      }
      else {
        // Default suggestions mode
        responseText = `## Content Suggestions for Section ${currentSection}

I recommend enhancing this section with the following content:

1. **Add demographic context**: "The safety population included diverse demographics: 58% female, age range 18-75 years (mean 42.3±14.2), and 23% with moderate renal impairment."

2. **Include comparator data**: "Compared to active control (Standard Therapy Y), Drug X showed a similar overall adverse event profile, but with significantly lower rates of hepatic enzyme elevations (1.2% vs 4.5%, p<0.001)."

3. **Add discontinuation rates**: "Treatment discontinuation due to adverse events occurred in 3.2% of Drug X subjects vs 5.1% in the placebo group."

4. **Expand laboratory findings**: "No clinically significant changes in hematology, chemistry, or urinalysis parameters were observed beyond the transient liver enzyme elevations noted above."

Would you like me to generate a complete revised version of this section incorporating these suggestions?`;
      }
      
      // Set the response with a slight delay to simulate API call
      setTimeout(() => {
        setAiResponse(responseText);
        setAiIsLoading(false);
      }, 2000);
      
      // Clear the input
      setAiUserQuery('');
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiError('Failed to get AI response. Please try again.');
      setAiIsLoading(false);
    }
  };
  
  const handleAcceptSuggestion = (suggestion) => {
    // For this demo, we'll just append the suggestion to the document text
    setDocumentText(prevText => {
      // Find the section header
      const sectionHeaderRegex = new RegExp(`## ${suggestion.section}[\\s\\S]*?(?=##|$)`);
      const match = prevText.match(sectionHeaderRegex);
      
      if (match) {
        // Insert suggestion at the end of the matched section
        const sectionStart = match.index;
        const sectionEnd = sectionStart + match[0].length;
        
        return prevText.substring(0, sectionEnd) + 
               '\n\n' + suggestion.text + 
               prevText.substring(sectionEnd);
      }
      
      // If section not found, just append at the end
      return prevText + '\n\n' + suggestion.text;
    });
    
    // Show success toast
    toast({
      title: "Suggestion Applied",
      description: `Added suggestion to section ${suggestion.section}`,
    });
  };
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleDocumentLock = () => {
    if (documentLocked) {
      setDocumentLocked(false);
      setLockedBy(null);
      toast({
        title: "Document Unlocked",
        description: "The document is now available for editing by other users.",
      });
    } else {
      setDocumentLocked(true);
      setLockedBy("Your Name"); // In a real app, this would be the current user
      toast({
        title: "Document Locked",
        description: "You now have exclusive editing rights to this document.",
      });
    }
  };
  
  const handleExport = () => {
    // Simulate export processing
    toast({
      title: "Exporting Document",
      description: `Preparing ${exportFormat.toUpperCase()} export with selected options...`,
    });
    
    // Close the dialog
    setShowExportDialog(false);
    
    // Simulate completion after a delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Document has been exported as ${exportFormat.toUpperCase()}.`,
        variant: "success",
      });
    }, 2000);
  };
  
  // Handle section navigation
  const handleSectionClick = (sectionId) => {
    setCurrentSection(sectionId);
    // In a real application, this would scroll to the section or load it
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Document Tree Sidebar */}
      {isTreeOpen && (
        <div className="w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Document Structure</h2>
            <div className="mt-4">
              <ul className="space-y-1">
                <li>
                  <div 
                    className="flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer text-sm"
                    onClick={() => toggleSection('module-1')}
                  >
                    {expandedSections['module-1'] ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span>Module 1: Administrative</span>
                  </div>
                  {expandedSections['module-1'] && (
                    <ul className="pl-6 space-y-1 mt-1">
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">1.1 Forms and Letters</li>
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">1.2 Application</li>
                    </ul>
                  )}
                </li>
                
                <li>
                  <div 
                    className={`flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer text-sm ${expandedSections['module-2'] ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleSection('module-2')}
                  >
                    {expandedSections['module-2'] ? <ChevronDown className="h-4 w-4 mr-1 text-blue-600" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span className={expandedSections['module-2'] ? 'font-medium text-blue-700' : ''}>Module 2: CTD Summaries</span>
                  </div>
                  
                  {expandedSections['module-2'] && (
                    <ul className="pl-6 space-y-1 mt-1">
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">
                        <div 
                          className="flex items-center"
                          onClick={() => toggleSection('m2-2')}
                        >
                          {expandedSections['m2-2'] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span>2.2 Introduction</span>
                        </div>
                      </li>
                      
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">
                        <div 
                          className="flex items-center"
                          onClick={() => toggleSection('m2-3')}
                        >
                          {expandedSections['m2-3'] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span>2.3 Quality Summary</span>
                        </div>
                      </li>
                      
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">
                        <div 
                          className="flex items-center"
                          onClick={() => toggleSection('m2-4')}
                        >
                          {expandedSections['m2-4'] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span>2.4 Nonclinical Overview</span>
                        </div>
                      </li>
                      
                      <li>
                        <div 
                          className={`flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer ${expandedSections['m2-5'] ? 'bg-blue-100' : ''}`}
                          onClick={() => toggleSection('m2-5')}
                        >
                          {expandedSections['m2-5'] ? <ChevronDown className="h-3 w-3 mr-1 text-blue-600" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span className={expandedSections['m2-5'] ? 'font-medium text-blue-700' : ''}>2.5 Clinical Overview</span>
                        </div>
                        
                        {expandedSections['m2-5'] && (
                          <ul className="pl-4 space-y-1 mt-1 border-l-2 border-blue-200">
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.1' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.1')}
                            >
                              2.5.1 Product Rationale
                            </li>
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.2' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.2')}
                            >
                              2.5.2 Biopharmaceutics
                            </li>
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.3' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.3')}
                            >
                              2.5.3 Clinical Pharmacology
                            </li>
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.4' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.4')}
                            >
                              2.5.4 Efficacy
                            </li>
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.5' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.5')}
                            >
                              <div className="flex justify-between items-center">
                                <span>2.5.5 Safety</span>
                                <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800 text-xs">Editing</Badge>
                              </div>
                            </li>
                            <li 
                              className={`text-sm py-1 px-2 rounded hover:bg-blue-50 cursor-pointer ${currentSection === '2.5.6' ? 'bg-blue-100 text-blue-700' : ''}`}
                              onClick={() => handleSectionClick('2.5.6')}
                            >
                              2.5.6 Benefits and Risks
                            </li>
                          </ul>
                        )}
                      </li>
                      
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">
                        <div 
                          className="flex items-center"
                          onClick={() => toggleSection('m2-6')}
                        >
                          {expandedSections['m2-6'] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span>2.6 Nonclinical Summary</span>
                        </div>
                      </li>
                      
                      <li className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer">
                        <div 
                          className="flex items-center"
                          onClick={() => toggleSection('m2-7')}
                        >
                          {expandedSections['m2-7'] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                          <span>2.7 Clinical Summary</span>
                        </div>
                      </li>
                    </ul>
                  )}
                </li>
                
                <li>
                  <div 
                    className="flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer text-sm"
                    onClick={() => toggleSection('module-3')}
                  >
                    {expandedSections['module-3'] ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span>Module 3: Quality</span>
                  </div>
                </li>
                
                <li>
                  <div 
                    className="flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer text-sm"
                    onClick={() => toggleSection('module-4')}
                  >
                    {expandedSections['module-4'] ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span>Module 4: Nonclinical</span>
                  </div>
                </li>
                
                <li>
                  <div 
                    className="flex items-center py-1 px-2 rounded hover:bg-gray-200 cursor-pointer text-sm"
                    onClick={() => toggleSection('module-5')}
                  >
                    {expandedSections['module-5'] ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    <span>Module 5: Clinical</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Document Templates</h3>
              <ul className="space-y-1">
                {templates.slice(0, 3).map(template => (
                  <li key={template.id} className="text-xs p-2 rounded border border-gray-200 hover:bg-gray-100">
                    <div className="font-medium">{template.name}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">{template.category}</span>
                      <div className="flex space-x-1">
                        {template.regions.slice(0, 2).map(r => (
                          <Badge key={r.id} variant="outline" className="text-[10px] h-4 bg-gray-50">
                            {r.region}
                          </Badge>
                        ))}
                        {template.regions.length > 2 && (
                          <Badge variant="outline" className="text-[10px] h-4 bg-gray-50">
                            +{template.regions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsTreeOpen(!isTreeOpen)}
              className="mr-2"
            >
              {isTreeOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 transform rotate-180" />}
              <span className="ml-1">{isTreeOpen ? "Hide Tree" : "Show Tree"}</span>
            </Button>
            
            <h1 className="text-lg font-semibold text-gray-800 ml-2">
              Section {currentSection}: {
                currentSection === '2.5.1' ? 'Product Development Rationale' :
                currentSection === '2.5.2' ? 'Overview of Biopharmaceutics' :
                currentSection === '2.5.3' ? 'Clinical Pharmacology' :
                currentSection === '2.5.4' ? 'Efficacy' :
                currentSection === '2.5.5' ? 'Overview of Safety' :
                currentSection === '2.5.6' ? 'Benefits and Risks' : ''
              }
            </h1>
            
            <div className="ml-4 flex items-center">
              <Badge className="bg-blue-100 text-blue-800 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Last edited 35 minutes ago
              </Badge>
              <Badge className="ml-2 bg-green-100 text-green-800">Version {documentVersion}</Badge>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button
              variant={documentLocked ? "outline" : "ghost"}
              size="sm"
              onClick={handleDocumentLock}
              className={`mr-2 ${documentLocked ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}`}
            >
              {documentLocked ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>Locked for Editing</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  <span>Lock for Editing</span>
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValidationDialog(true)}
              className="mr-2"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Validate</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="mr-2"
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Export</span>
            </Button>
            
            <Button
              variant={aiAssistantOpen ? "default" : "ghost"}
              size="sm"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className={aiAssistantOpen ? "bg-blue-600" : ""}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              <span>AI Assistant</span>
            </Button>
          </div>
        </div>
        
        {/* Main Document + AI Assistant */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Editor */}
          <div className={`flex-1 overflow-auto p-6 bg-gray-50 ${aiAssistantOpen ? 'border-r border-gray-200' : ''}`}>
            <div className="mx-auto max-w-4xl bg-white shadow-sm rounded-lg p-8 min-h-full mb-6">
              <Textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="border-0 shadow-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 h-[calc(100vh-250px)]"
                placeholder="Start typing here..."
              />
            </div>
          </div>
          
          {/* AI Assistant Panel */}
          {aiAssistantOpen && (
            <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-white overflow-auto flex flex-col">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                  AI Document Assistant
                </h2>
                
                <Tabs defaultValue="suggestions" className="w-full" onValueChange={setAiAssistantMode} value={aiAssistantMode}>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="formatting">Formatting</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <form onSubmit={handleAiQuerySubmit} className="mt-2">
                  <div className="flex">
                    <Input
                      placeholder={
                        aiAssistantMode === 'compliance' ? "Ask about regulatory compliance..." :
                        aiAssistantMode === 'formatting' ? "Ask about document formatting..." :
                        "Ask for content suggestions..."
                      }
                      value={aiUserQuery}
                      onChange={(e) => setAiUserQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="ml-2" disabled={aiIsLoading}>
                      {aiIsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {aiIsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">Analyzing document content...</p>
                    </div>
                  </div>
                ) : aiError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                    <h3 className="font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Error
                    </h3>
                    <p className="mt-1 text-sm">{aiError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-red-700 bg-white"
                      onClick={() => setAiError(null)}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : aiResponse ? (
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-100"
                      dangerouslySetInnerHTML={{ 
                        __html: aiResponse
                          .replace(/##\s+(.+)/g, '<h2 class="text-lg font-semibold text-blue-800 mt-2 mb-1">$1</h2>')
                          .replace(/###\s+(.+)/g, '<h3 class="text-md font-semibold text-blue-700 mt-2 mb-1">$1</h3>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n\n/g, '<br /><br />')
                          .replace(/\n([0-9]+\.\s)/g, '<br />$1')
                          .replace(/\n(- )/g, '<br />$1')
                          .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-2 rounded"><code>$1</code></pre>')
                          .replace(/\|.*\|/g, match => `<div class="overflow-x-auto">${match}</div>`)
                          .replace(/\|\s+(.*?)\s+\|/g, match => match.replace(/\s+\|\s+/g, '</td><td class="px-2 py-1 border border-gray-300">').replace(/^\|\s+/, '<td class="px-2 py-1 border border-gray-300">').replace(/\s+\|$/, '</td>'))
                          .replace(/<div class="overflow-x-auto">\|(.*)\|<\/div>/g, '<div class="overflow-x-auto"><table class="w-full border-collapse"><tr>$1</tr></table></div>')
                          .replace(/<\/tr><tr>/g, '</tr><tr>')
                          .replace(/<\/td><td class="px-2 py-1 border border-gray-300">-{3,}<\/td>/g, '</th><th class="px-2 py-1 border border-gray-300 bg-gray-100">-</th>')
                          .replace(/<tr>(.*?)<\/tr>/, match => match.replace(/<td/g, '<th').replace(/<\/td>/g, '</th>'))
                      }}
                    />
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-700 border-blue-200"
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          toast({
                            title: "Copied to Clipboard",
                            description: "AI response has been copied to clipboard.",
                          });
                        }}
                      >
                        <Clipboard className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          // Logic to apply suggestions would go here
                          // For demo, we'll just show a toast
                          toast({
                            title: "Applied to Document",
                            description: "AI suggestions were applied to the document.",
                          });
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                      <h3 className="font-medium flex items-center text-yellow-800">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Content Issues Detected
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {validationResults.issues.map(issue => (
                          <li key={issue.id} className="flex items-start">
                            <div className={`rounded-full h-2 w-2 mt-1.5 mr-2 flex-shrink-0 ${
                              issue.severity === 'critical' ? 'bg-red-500' :
                              issue.severity === 'major' ? 'bg-orange-500' :
                              issue.severity === 'minor' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div>
                              <p className="text-gray-800">{issue.description}</p>
                              <div className="flex mt-1">
                                <Badge variant="outline" className="text-xs mr-1">Section {issue.section}</Badge>
                                <Badge variant="outline" className={`text-xs ${
                                  issue.severity === 'critical' ? 'bg-red-50 text-red-700' :
                                  issue.severity === 'major' ? 'bg-orange-50 text-orange-700' :
                                  issue.severity === 'minor' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>{issue.severity}</Badge>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                      <h3 className="font-medium flex items-center text-blue-800">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Content Enhancement Suggestions
                      </h3>
                      <p className="text-blue-700 text-xs mt-1">
                        Ask the AI to help enhance your document's content, compliance, and formatting.
                      </p>
                      <div className="mt-2 space-y-2">
                        <Button size="sm" variant="outline" className="w-full justify-start text-blue-700 border-blue-200 bg-white" onClick={() => setAiUserQuery("Improve the safety section with more statistical details")}>
                          <Sparkles className="h-3 w-3 mr-2" />
                          Improve safety section with statistics
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start text-blue-700 border-blue-200 bg-white" onClick={() => setAiUserQuery("Check if this section complies with ICH M4E guidelines")}>
                          <BookOpen className="h-3 w-3 mr-2" />
                          Check ICH M4E compliance
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start text-blue-700 border-blue-200 bg-white" onClick={() => setAiUserQuery("Format safety data as a clear, structured table")}>
                          <ClipboardCheck className="h-3 w-3 mr-2" />
                          Convert to structured table format
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Export Document Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
            <DialogDescription>
              Choose export format and options for your document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="exportFormat" className="text-right text-sm">
                Format
              </label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger id="exportFormat" className="col-span-3">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML (eCTD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Export Options</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeComments"
                  checked={exportOptions.includeComments}
                  onChange={(e) => setExportOptions({...exportOptions, includeComments: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeComments" className="text-sm">Include comments</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeTrackChanges"
                  checked={exportOptions.includeTrackChanges}
                  onChange={(e) => setExportOptions({...exportOptions, includeTrackChanges: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeTrackChanges" className="text-sm">Include track changes</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeCoverPage"
                  checked={exportOptions.includeCoverPage}
                  onChange={(e) => setExportOptions({...exportOptions, includeCoverPage: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeCoverPage" className="text-sm">Include cover page</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeTableOfContents"
                  checked={exportOptions.includeTableOfContents}
                  onChange={(e) => setExportOptions({...exportOptions, includeTableOfContents: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeTableOfContents" className="text-sm">Include table of contents</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAppendices"
                  checked={exportOptions.includeAppendices}
                  onChange={(e) => setExportOptions({...exportOptions, includeAppendices: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeAppendices" className="text-sm">Include appendices</label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Validation Results</DialogTitle>
            <DialogDescription>
              AI-powered validation results for your eCTD document based on regulatory standards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Completeness</label>
                <div className="flex items-center">
                  <Progress value={validationResults.completeness} className="h-2 flex-1" />
                  <span className="ml-2 text-sm font-medium">{validationResults.completeness}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Consistency</label>
                <div className="flex items-center">
                  <Progress value={validationResults.consistency} className="h-2 flex-1" />
                  <span className="ml-2 text-sm font-medium">{validationResults.consistency}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">References</label>
                <div className="flex items-center">
                  <Progress value={validationResults.references} className="h-2 flex-1" />
                  <span className="ml-2 text-sm font-medium">{validationResults.references}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Regulatory Compliance</label>
                <div className="flex items-center">
                  <Progress value={validationResults.regulatory} className="h-2 flex-1" />
                  <span className="ml-2 text-sm font-medium">{validationResults.regulatory}%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">Validation Issues</h4>
              <div className="max-h-72 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestion</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validationResults.issues.map((issue) => (
                      <tr key={issue.id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className={
                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                            issue.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                          {issue.section}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-800">
                          {issue.description}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {issue.suggestion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-800">
                Overall compliance: 80%
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export Report
              </Button>
            </div>
            <div>
              <Button variant="outline" className="mr-2" onClick={() => setShowValidationDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowValidationDialog(false);
                
                // In a real app, this would fix issues automatically
                setTimeout(() => {
                  toast({
                    title: "Auto-fix Applied",
                    description: "Fixed 2 minor issues automatically. Major issues require manual review.",
                  });
                }, 500);
              }}>
                Fix Issues
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Team Collaboration Dialog */}
      <Dialog open={teamCollabOpen} onOpenChange={setTeamCollabOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team Collaboration</DialogTitle>
            <DialogDescription>
              Manage document sharing, comments, and collaboration settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Current Collaborators</h4>
              <div className="max-h-48 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800 mr-2">YN</div>
                          <span>You (John Doe)</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-blue-100 text-blue-800">Owner</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        Now
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800 mr-2">JS</div>
                          <span>Jane Smith</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-purple-100 text-purple-800">Reviewer</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-yellow-100 text-yellow-800">Comments Only</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        42 minutes ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-800 mr-2">RJ</div>
                          <span>Robert Johnson</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-green-100 text-green-800">Editor</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        <Badge className="bg-blue-100 text-blue-800">Edit Access</Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        2 hours ago
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-3 mt-2">
              <h4 className="text-sm font-medium">Document Version History</h4>
              <div className="max-h-48 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.map((version) => (
                      <tr key={version.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                          <div className="flex items-center">
                            <Badge className={version.status === 'Current' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                              {version.version}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                          {version.date}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                          {version.author}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
                          {version.changeDescription}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <GitCompare className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 ml-1">
                            <History className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-3 mt-2">
              <h4 className="text-sm font-medium">Add Collaborator</h4>
              <div className="flex">
                <Input placeholder="Enter email address" className="flex-1" />
                <Select defaultValue="editor">
                  <SelectTrigger className="w-36 ml-2">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="ml-2">
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div>
              <Button variant="outline" size="sm" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Manage Team
              </Button>
            </div>
            <div>
              <Button variant="outline" className="mr-2" onClick={() => setTeamCollabOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setTeamCollabOpen(false);
                toast({
                  title: "Collaboration Settings Saved",
                  description: "Your changes to team collaboration settings have been saved.",
                });
              }}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}