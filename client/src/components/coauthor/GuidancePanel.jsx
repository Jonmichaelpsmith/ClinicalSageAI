import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, BookOpen, ExternalLink, FileText, Check, PlusCircle } from 'lucide-react';

export default function GuidancePanel({ sectionId }) {
  const [expanded, setExpanded] = useState(true);

  // Simulate real guidance data based on section
  const getGuidanceForSection = (id) => {
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
      '3.2.P': [
        {
          title: 'ICH M4Q Quality Overall Summary',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/M4Q_R1_Guideline.pdf',
          key_points: [
            'Summarize information on drug substance and drug product',
            'Include critical quality attributes',
            'Describe pharmaceutical development and manufacturing process'
          ]
        }
      ],
      '4.2.1': [
        {
          title: 'ICH M4S Nonclinical Overview and Summaries',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/M4S_R2_Guideline.pdf',
          key_points: [
            'Summarize pharmacology studies and their relation to proposed indication',
            'Describe pharmacokinetic and toxicology findings',
            'Discuss relevance of animal models to humans'
          ]
        }
      ],
      '5.3.5': [
        {
          title: 'FDA Guidance on Clinical Efficacy',
          source: 'FDA',
          link: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
          key_points: [
            'Present data from controlled clinical trials',
            'Discuss strengths and limitations of evidence',
            'Address differences in efficacy across subgroups'
          ]
        },
        {
          title: 'ICH E9 Statistical Principles for Clinical Trials',
          source: 'ICH Guidelines',
          link: 'https://database.ich.org/sites/default/files/E9_Guideline.pdf',
          key_points: [
            'Follow proper statistical methodology',
            'Address multiplicity issues',
            'Describe primary and secondary endpoints with justification'
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
  
  const guidance = getGuidanceForSection(sectionId);
  
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