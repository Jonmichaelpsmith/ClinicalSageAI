import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, BookOpen, ExternalLink, FileText, Check, PlusCircle } from 'lucide-react';
import templates from '@/services/templates/ctdTemplates.json';

// This would be a real service in production
const guidanceService = {
  fetchGuidance: async (sectionId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return { 
      note: getGuidanceNoteForSection(sectionId),
      details: getGuidanceDetailsForSection(sectionId)
    };
  }
};

function getGuidanceNoteForSection(id) {
  // First check if we have template guidance
  if (templates[id] && templates[id].guidanceText) {
    return templates[id].guidanceText;
  }
  
  // If not, use the static notes
  const notes = {
    '2.1': 'This section should follow CTD format and include a comprehensive Table of Contents for Module 2.',
    '2.2': 'Introduction should provide a concise overview of the pharmaceutical class, mode of action, and proposed clinical use.',
    '2.3': 'Quality Overall Summary should follow ICH M4Q guidelines with appropriate cross-references.',
    '2.4': 'Nonclinical Overview should interpret findings against product safety per ICH M4S.',
    '2.5': 'Clinical Overview should provide critical analysis per ICH M4E guidelines.',
    '2.6': 'Nonclinical Written and Tabulated Summaries must follow regional requirements.',
    '2.7': 'This section should follow ICH E3 guidelines. Use Ctrl+Enter or Cmd+Enter to generate section content with AI assistance.',
    '2.8': 'Be sure all referenced studies from Module 5 are properly summarized with study synopses.',
  };
  return notes[id] || 'Follow eCTD guidelines for this section and include proper cross-references to supporting documentation.';
}

export default function GuidancePanel({ sectionId }) {
  const [expanded, setExpanded] = useState(true);
  const [guidanceNote, setGuidanceNote] = useState('');
  
  useEffect(() => {
    guidanceService.fetchGuidance(sectionId)
      .then(data => setGuidanceNote(data.note));
  }, [sectionId]);

  // For detailed guidance content
  const getGuidanceDetailsForSection = (id) => {
    // First check if we have template data that we can use for guidance
    if (templates[id]) {
      const template = templates[id];
      
      // Create a template-specific guidance item
      const templateGuidance = {
        title: `${template.title} Template Guidance`,
        source: 'TrialSage™ Templates',
        link: 'javascript:void(0)',  // No external link for template guidance
        key_points: [
          template.description,
          // Add field-specific guidance points
          ...(template.fields || []).map(field => `Include information about ${field.label.toLowerCase()}`)
        ]
      };
      
      // Add template guidance to the list of guidance items
      const standardGuidance = getStandardGuidance(id);
      return [templateGuidance, ...standardGuidance];
    }
    
    // If no template, return standard guidance
    return getStandardGuidance(id);
  };
  
  // Standard guidance items from regulatory sources
  const getStandardGuidance = (id) => {
    const guidanceMap = {
      '2.5': [
        {
          title: 'ICH M4E Clinical Overview',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/M4E_R2_Guideline.pdf',
          key_points: [
            'Provide a critical analysis of all available clinical data',
            'Include benefit-risk assessment',
            'Reference other sections without duplicating information'
          ]
        },
        {
          title: 'FDA Guidance on Clinical Overview',
          source: 'FDA',
          link: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
          key_points: [
            'Discuss clinical context for evaluation',
            'Address any study design issues',
            'Explain any deviations from clinical protocols'
          ]
        }
      ],
      '2.7': [
        {
          title: 'ICH E3 Structure and Content of Clinical Study Reports',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/E3_Guideline.pdf',
          key_points: [
            'Organize data by study type and indication',
            'Present summary tables of all relevant efficacy data',
            'Include detailed summaries of safety information'
          ]
        },
        {
          title: 'FDA Guidance on Clinical Summaries',
          source: 'FDA',
          link: 'https://www.fda.gov/media/103618/download',
          key_points: [
            'Focus on key efficacy findings and safety issues',
            'Address scientific questions likely to be raised by regulators',
            'Cross-reference without duplicating information in Module 5'
          ]
        },
        {
          title: 'EMA Clinical Summary Guidance',
          source: 'European Medicines Agency',
          link: 'https://www.ema.europa.eu/en/documents/scientific-guideline/ich-m-4-e-r-2-common-technical-document-registration-pharmaceuticals-human-use-efficacy-step-5_en.pdf',
          key_points: [
            'Ensure consistency with Summary of Product Characteristics',
            'Highlight region-specific requirements',
            'Include detailed analysis of benefit-risk balance'
          ]
        }
      ],
      '2.2': [
        {
          title: 'ICH M4E Introduction Guidance',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/M4E_R2_Guideline.pdf',
          key_points: [
            'Provide a concise overview of the product',
            'Include the pharmaceutical class',
            'Describe proposed clinical indication'
          ]
        }
      ],
      '2.1': [
        {
          title: 'ICH M4 Common Technical Document',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/M4_R4_Guideline.pdf',
          key_points: [
            'Include all Module 2 sections in TOC',
            'Follow the proper section numbering convention',
            'Use consistent document formatting'
          ]
        }
      ]
    };
    
    return guidanceMap[id] || [
      {
        title: 'General eCTD Guidance',
        source: 'ICH Guidelines',
        link: 'https://database.ich.org/sites/default/files/M4_R4_Guideline.pdf',
        key_points: [
          'Follow eCTD structure and formatting requirements',
          'Ensure document granularity meets regional expectations',
          'Cross-reference without duplicating information'
        ]
      }
    ];
  };
  
  const guidance = getGuidanceDetailsForSection(sectionId);
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <div 
        className="flex items-center justify-between bg-blue-50 p-3 border-b cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Regulatory Guidance</h3>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-blue-600 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="h-[220px] p-0">
            <div className="p-3 space-y-4">
              {guidance.map((item, index) => (
                <div key={index} className="bg-white rounded-md border border-gray-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800">{item.title}</h4>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>{item.source}</span>
                      </div>
                    </div>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs flex items-center hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>View</span>
                    </a>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700">Key Points:</div>
                    <ul className="mt-1 space-y-1">
                      {item.key_points.map((point, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start">
                          <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center py-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs text-blue-600 flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>Load More Guidelines</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}