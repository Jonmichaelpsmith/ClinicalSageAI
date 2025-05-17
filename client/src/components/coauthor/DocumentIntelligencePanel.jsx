import React from 'react';
import { Button } from '@/components/ui/button';

export default function DocumentIntelligencePanel({
  onGenerate,
  onAnalyze,
  onImprove,
  sectionContent,
  qualityAnalysis,
  improvements,
  loading,
  sessionInitialized
}) {
  return (
    <div className="space-y-2">
      {!sessionInitialized && (
        <p className="text-sm text-gray-500">Select a document to enable intelligence features.</p>
      )}
      {sessionInitialized && (
        <>
          <div className="flex gap-2">
            <Button size="sm" onClick={onGenerate} disabled={loading}>
              Generate Section Content
            </Button>
            <Button size="sm" variant="outline" onClick={onAnalyze} disabled={loading}>
              Analyze Quality
            </Button>
            <Button size="sm" variant="outline" onClick={onImprove} disabled={loading}>
              Writing Improvements
            </Button>
          </div>
          {sectionContent && (
            <div data-testid="section-content" className="border rounded-md p-2 text-xs">
              {sectionContent}
            </div>
          )}
          {qualityAnalysis && (
            <div data-testid="quality-analysis" className="border rounded-md p-2 text-xs">
              Overall Score: {qualityAnalysis.overallScore}
            </div>
          )}
          {improvements && improvements.length > 0 && (
            <ul data-testid="writing-improvements" className="list-disc pl-4 text-xs">
              {improvements.map((imp, idx) => (
                <li key={idx}>{imp.suggestion || imp}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
