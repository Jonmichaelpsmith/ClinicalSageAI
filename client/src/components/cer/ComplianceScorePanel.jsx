import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, BadgeInfo, FileText, X, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Compliance Score Panel Component
 * 
 * Analyzes the current CER content and provides compliance scoring against
 * major regulatory frameworks including EU MDR, ISO 14155, and FDA guidelines.
 * Identifies gaps and provides recommendations for improving compliance.
 */
const ComplianceScorePanel = ({ sections = [] }) => {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch compliance scores whenever sections change
  useEffect(() => {
    const fetchScores = async () => {
      if (!sections.length) {
        setScores(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/cer/compliance-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze compliance');
        }

        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Compliance score error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [sections]);

  // Calculate combined average score
  const calculateAverageScore = () => {
    if (!scores) return 0;
    const { euMdr, iso14155, fda } = scores.frameworks;
    return Math.round((euMdr.score + iso14155.score + fda.score) / 3);
  };

  // Get color class based on score
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  // Get progress color class based on score
  const getProgressColorClass = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold mb-4">Analyzing Regulatory Compliance...</h2>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start">
          <AlertTriangle className="text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error Analyzing Compliance</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-1">Please try again or contact support if this problem persists.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!scores || !sections.length) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start">
          <BadgeInfo className="text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">No Content to Analyze</h3>
            <p className="text-blue-700">Add sections to your Clinical Evaluation Report to receive compliance scoring.</p>
            <p className="text-sm text-blue-600 mt-1">Compliance scoring will automatically analyze your report against EU MDR, ISO 14155, and FDA guidelines.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render compliance score results
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold mb-2 flex items-center">
        <Shield className="mr-2" />
        Regulatory Compliance Analysis
      </h2>
      
      {/* Overall Score */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">Overall Compliance</h3>
          <div className={`text-3xl font-bold ${getScoreColorClass(calculateAverageScore())}`}>
            {calculateAverageScore()}%
          </div>
        </div>
        <Progress value={calculateAverageScore()} className="h-2 mt-1" />
        <p className="text-sm text-gray-600 mt-2">
          Combined score across EU MDR, ISO 14155, and FDA guidelines
        </p>
      </div>

      {/* Framework Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EU MDR Score */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">EU MDR 2017/745</h3>
            <div className={`text-2xl font-bold ${getScoreColorClass(scores.frameworks.euMdr.score)}`}>
              {scores.frameworks.euMdr.score}%
            </div>
          </div>
          <Progress 
            value={scores.frameworks.euMdr.score} 
            className={`h-2 mt-1 ${getProgressColorClass(scores.frameworks.euMdr.score)}`} 
          />
        </div>

        {/* ISO 14155 Score */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">ISO 14155</h3>
            <div className={`text-2xl font-bold ${getScoreColorClass(scores.frameworks.iso14155.score)}`}>
              {scores.frameworks.iso14155.score}%
            </div>
          </div>
          <Progress 
            value={scores.frameworks.iso14155.score} 
            className={`h-2 mt-1 ${getProgressColorClass(scores.frameworks.iso14155.score)}`} 
          />
        </div>

        {/* FDA Score */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">FDA Requirements</h3>
            <div className={`text-2xl font-bold ${getScoreColorClass(scores.frameworks.fda.score)}`}>
              {scores.frameworks.fda.score}%
            </div>
          </div>
          <Progress 
            value={scores.frameworks.fda.score} 
            className={`h-2 mt-1 ${getProgressColorClass(scores.frameworks.fda.score)}`} 
          />
        </div>
      </div>

      {/* Section Analysis */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">Section-by-Section Analysis</h3>
        <div className="space-y-3">
          {scores.sectionScores.map((section, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              >
                <div className="flex items-center">
                  <FileText className="mr-2 text-gray-500" size={18} />
                  <span className="font-medium">{section.title}</span>
                </div>
                <div className="flex items-center">
                  <div className={`font-semibold ${getScoreColorClass(section.score)}`}>
                    {section.score}%
                  </div>
                  <div className="ml-3">
                    {expandedSection === index ? (
                      <X size={16} className="text-gray-500" />
                    ) : (
                      <div>
                        {section.score >= 80 ? (
                          <CheckCircle size={18} className="text-green-500" />
                        ) : (
                          <AlertTriangle size={18} className="text-amber-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedSection === index && (
                <div className="p-3 border-t bg-white">
                  <h4 className="font-medium mb-2">Gap Analysis</h4>
                  <ul className="space-y-2">
                    {section.findings.map((finding, i) => (
                      <li key={i} className="flex items-start">
                        {finding.type === 'issue' ? (
                          <AlertTriangle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm">{finding.message}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {section.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-1">Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        {section.recommendations.map((rec, i) => (
                          <li key={i} className="text-blue-700">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white border rounded-lg p-4 shadow-sm mt-4">
        <h3 className="font-semibold mb-3">Key Findings</h3>
        <ul className="space-y-2">
          {scores.keyFindings.map((finding, index) => (
            <li key={index} className="flex items-start">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {finding.severity === 'high' ? (
                      <AlertTriangle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : finding.severity === 'medium' ? (
                      <AlertTriangle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <BadgeInfo size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{finding.severity === 'high' ? 'Critical Issue' : finding.severity === 'medium' ? 'Moderate Issue' : 'Suggestion'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>{finding.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ComplianceScorePanel;