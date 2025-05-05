import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CerPreviewPanel({ 
  title, 
  sections = [], 
  faers = [], 
  comparators = [],
  complianceData = null,
  flagThreshold = 70 // Default threshold percentage for flagging sections
}) {
  // Function to find section compliance data if available
  const getSectionCompliance = (sectionTitle) => {
    if (!complianceData || !complianceData.sectionScores) return null;
    
    return complianceData.sectionScores.find(section => 
      section.title.toLowerCase() === sectionTitle.toLowerCase());
  };
  
  // Function to determine border color based on compliance score
  const getBorderColorClass = (score) => {
    if (!score) return '';
    if (score >= 0.8) return 'border-green-300';
    if (score >= 0.6) return 'border-amber-300';
    return 'border-red-300';
  };
  
  // Function to get compliance icon
  const getComplianceIcon = (score) => {
    if (!score) return null;
    
    if (score >= 0.8) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (score >= 0.6) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  // Render function for section item
  const renderSection = (s, i) => {
    const sectionCompliance = getSectionCompliance(s.section);
    const complianceScore = sectionCompliance?.averageScore;
    const scorePercent = complianceScore ? Math.round(complianceScore * 100) : null;
    const isBelowThreshold = scorePercent && scorePercent < flagThreshold;
    const complianceBorder = getBorderColorClass(complianceScore);
    const complianceIcon = getComplianceIcon(complianceScore);
    
    const complianceTips = sectionCompliance ? 
      Object.entries(sectionCompliance.standards || {}).flatMap(([standardName, data]) => 
        data.suggestions || []).filter(Boolean) : [];
    
    return (
      <div key={i} className={`mb-4 border p-4 bg-white rounded shadow ${complianceBorder} ${complianceScore ? 'border-l-4' : ''} ${isBelowThreshold ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between items-start">
          <h3 className={`text-lg font-bold mb-2 ${isBelowThreshold ? 'text-red-600' : ''}`}>
            {s.section} {isBelowThreshold && <span className="inline-block ml-2">⚠️</span>}
          </h3>
          
          {complianceScore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    {complianceIcon}
                    <span className={`text-sm font-medium ${complianceScore >= 0.8 ? 'text-green-600' : complianceScore >= 0.6 ? 'text-amber-600' : 'text-red-600'}`}>
                      {scorePercent}%
                    </span>
                    {isBelowThreshold && <span className="text-xs text-red-600 ml-1">(Below {flagThreshold}%)</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-2">
                  <p className="font-semibold mb-1">Compliance Score</p>
                  {isBelowThreshold && (
                    <p className="text-xs text-red-600 font-semibold mb-1">This section falls below the {flagThreshold}% threshold and requires attention</p>
                  )}
                  {complianceTips.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm font-medium">Suggestions:</p>
                      <ul className="text-xs list-disc list-inside">
                        {complianceTips.slice(0, 3).map((tip, idx) => (
                          <li key={idx} className="mt-1">{tip}</li>
                        ))}
                        {complianceTips.length > 3 && (
                          <li className="text-xs mt-1 text-gray-500">+{complianceTips.length - 3} more suggestions</li>
                        )}
                      </ul>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="whitespace-pre-wrap text-sm text-gray-800">{s.content}</div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title || 'Clinical Evaluation Report'}</h1>

      {sections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Drafted Sections</h2>
          {sections.map(renderSection)}
        </div>
      )}

      {faers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">FAERS Safety Summary</h2>
          <table className="table-auto w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Reaction</th>
                <th className="border px-2 py-1">Outcome</th>
                <th className="border px-2 py-1">Serious</th>
                <th className="border px-2 py-1">Age</th>
                <th className="border px-2 py-1">Sex</th>
                <th className="border px-2 py-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {faers.map((f, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{f.reaction}</td>
                  <td className="border px-2 py-1">{f.outcome}</td>
                  <td className="border px-2 py-1">{f.is_serious ? 'Yes' : 'No'}</td>
                  <td className="border px-2 py-1">{f.age || 'N/A'}</td>
                  <td className="border px-2 py-1">{f.sex === '1' ? 'Male' : f.sex === '2' ? 'Female' : 'Unknown'}</td>
                  <td className="border px-2 py-1">{f.report_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {comparators.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Comparator Risk Scores</h2>
          <ul className="list-disc list-inside">
            {comparators.map((c, i) => (
              <li key={i}>{c.comparator} – Risk Score: {c.riskScore} (Reports: {c.reportCount})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
