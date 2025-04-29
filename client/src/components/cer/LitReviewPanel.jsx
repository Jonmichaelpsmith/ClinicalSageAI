import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function LitReviewPanel() {
  const [loading, setLoading] = useState(false);
  
  // Sample data for demonstration
  const papers = [
    {
      id: 1,
      title: 'EU MDR 2017/745 Clinical Evaluation Requirements',
      authors: ['Smith, J.', 'Johnson, M.'],
      year: 2023,
      summary: 'Comprehensive analysis of clinical evaluation requirements under the EU Medical Device Regulation 2017/745, with focus on risk management and post-market surveillance integration.',
      link: '#'
    },
    {
      id: 2,
      title: 'Systematic Literature Reviews for Medical Device Documentation',
      authors: ['Chen, L.', 'Garcia, R.', 'Williams, T.'],
      year: 2022,
      summary: 'Methods for conducting systematic literature reviews that satisfy regulatory requirements for medical device clinical evaluation reports, emphasizing searchability and reproducibility.',
      link: '#'
    },
    {
      id: 3,
      title: 'Risk-Based Approach to Clinical Evaluation Reports',
      authors: ['Patel, K.', 'Østerberg, O.'],
      year: 2024,
      summary: 'Novel risk-based methodology for structuring clinical evaluation reports that aligns with global regulatory expectations while streamlining documentation requirements.',
      link: '#'
    }
  ];

  if (loading) return <Progress className="w-full" />;

  return (
    <div className="space-y-4">
      {papers.map(paper => (
        <Card key={paper.id} className="border">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold">{paper.title}</h4>
            <p className="text-sm italic">{paper.authors.join(', ')} ({paper.year})</p>
            <p className="mt-2 line-clamp-3">{paper.summary}</p>
            <div className="mt-3 flex space-x-2 justify-end">
              <Button size="sm" onClick={() => window.open(paper.link, '_blank')}>Read Source</Button>
              <Button size="sm" variant="outline">Add to Report</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}