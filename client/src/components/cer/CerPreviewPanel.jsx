import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function CerPreviewPanel({ title, sections = [], faers = [], comparators = [], complianceData }) {
  // Helper function to find compliance score for a section
  const getSectionComplianceStatus = (sectionTitle) => {
    if (!complianceData || !complianceData.sectionScores) return null;
    
    const sectionData = complianceData.sectionScores.find(
      section => section.title.toLowerCase() === sectionTitle.toLowerCase()
    );
    
    if (!sectionData) return null;
    
    return {
      score: sectionData.averageScore,
      status: sectionData.averageScore >= 0.8 ? 'compliant' : 
              sectionData.averageScore >= 0.6 ? 'needs-improvement' : 'non-compliant',
      suggestions: Object.values(sectionData.standards || {}).flatMap(s => s.suggestions || []).filter(Boolean),
      feedback: Object.values(sectionData.standards || {}).map(s => s.feedback).filter(Boolean).join(' ')
    };
  };
  
  // Get badge color based on compliance status
  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-50 text-green-700 border-green-200';
      case 'needs-improvement': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'non-compliant': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  // Get icon based on compliance status
  const getComplianceIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title || 'Clinical Evaluation Report'}</h1>

      {sections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Drafted Sections</h2>
          {sections.map((s, i) => {
            const complianceStatus = getSectionComplianceStatus(s.section);
            const hasComplianceData = complianceStatus !== null;
            
            return (
              <div 
                key={i} 
                className={`mb-4 border p-4 bg-white rounded shadow ${hasComplianceData ? `border-l-4 ${complianceStatus.status === 'compliant' ? 'border-l-green-500' : complianceStatus.status === 'needs-improvement' ? 'border-l-yellow-500' : 'border-l-red-500'}` : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{s.section}</h3>
                  {hasComplianceData && (
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs border ${getComplianceColor(complianceStatus.status)}`}>
                      {getComplianceIcon(complianceStatus.status)}
                      <span>{Math.round(complianceStatus.score * 100)}% Compliant</span>
                    </div>
                  )}
                </div>
                
                {hasComplianceData && complianceStatus.status !== 'compliant' && (
                  <div className={`mb-3 text-sm p-2 rounded ${complianceStatus.status === 'needs-improvement' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <p className="font-medium mb-1">{complianceStatus.status === 'needs-improvement' ? 'Improvement Suggestions:' : 'Compliance Issues:'}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {complianceStatus.suggestions.length > 0 ? (
                        complianceStatus.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))
                      ) : (
                        <li>{complianceStatus.feedback || 'Review section for regulatory compliance'}</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm text-gray-800">{s.content}</div>
              </div>
            );
          })}
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
