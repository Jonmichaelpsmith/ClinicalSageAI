import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ExternalLink, Check } from 'lucide-react';

export default function GuidancePanel({ sectionId }) {
  // This would typically come from a regulator service API
  const guidancePoints = [
    {
      id: 'ich-e3',
      title: 'ICH E3 Guideline',
      description: 'Include a summary of all controlled clinical studies in this section. Organize by disease or indication.',
      link: 'https://database.ich.org/sites/default/files/E3_Guideline.pdf'
    },
    {
      id: 'fda-2023',
      title: 'FDA Guidance (2023)',
      description: 'Provide a brief overview of the clinical development program, followed by a detailed analysis of pivotal studies.',
      link: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents'
    },
    {
      id: 'eu-mdr',
      title: 'EU MDR 2017/745',
      description: 'For medical devices, include an evaluation of clinical data related to the device and its intended purpose.',
      link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745'
    },
    {
      id: 'best-practice',
      title: 'Industry Best Practice',
      description: 'Present data in both text and tabular format. Use figures for complex trends or relationships.',
      link: '#'
    }
  ];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
          Regulatory Guidance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {guidancePoints.map(point => (
            <div key={point.id} className="p-3 border rounded-md bg-amber-50/50">
              <h4 className="text-sm font-medium flex items-center">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                {point.title}
              </h4>
              <p className="text-xs text-gray-700 mt-1 mb-2">
                {point.description}
              </p>
              {point.link !== '#' && (
                <a 
                  href={point.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center w-fit"
                >
                  Reference document <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}