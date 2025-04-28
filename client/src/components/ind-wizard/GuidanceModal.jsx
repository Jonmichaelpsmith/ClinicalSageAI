// /client/src/components/ind-wizard/GuidanceModal.jsx

import React from "react";
import { 
  AlertCircle, 
  XCircle, 
  CheckCircle, 
  Info, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function GuidanceModal({ recommendations, confidenceScore, onClose, minimized, onToggleMinimize }) {
  // Function to get the appropriate icon for each recommendation type
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 flex-shrink-0" />;
      case 'info':
        return <Info className="h-4 w-4 flex-shrink-0" />;
      default:
        return <Info className="h-4 w-4 flex-shrink-0" />;
    }
  };
  
  // Function to get background color class based on recommendation type
  const getBackgroundClass = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200';
      case 'info':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-blue-100 border-blue-200';
    }
  };
  
  // Function to get progress bar color class based on score
  const getProgressColorClass = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        minimized 
          ? 'fixed bottom-4 right-4 w-60 h-16 shadow-md z-50 border border-gray-200 rounded-md bg-white overflow-hidden'
          : 'fixed right-0 top-20 w-80 shadow-lg border-l-2 border-gray-200 z-50 bg-white h-[calc(100vh-100px)] flex flex-col'
      }`}
    >
      {minimized ? (
        // Minimized view
        <div 
          className="flex items-center justify-between p-4 cursor-pointer w-full h-full"
          onClick={onToggleMinimize}
        >
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="font-medium text-sm">Regulatory AI Advisor</p>
              <p className="text-xs text-gray-600">{confidenceScore}% Complete</p>
            </div>
          </div>
          <ChevronUp className="h-4 w-4 text-gray-500" />
        </div>
      ) : (
        // Expanded view
        <>
          <div className="flex justify-between items-center border-b p-4 bg-gradient-to-r from-purple-100 to-blue-50">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold">Regulatory AI Advisor</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={onToggleMinimize}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Compliance Score:</span>
              <span className="text-sm font-semibold">{confidenceScore}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getProgressColorClass(confidenceScore)}`}
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {confidenceScore < 60 
                ? 'Major issues must be resolved before submission'
                : confidenceScore < 80
                ? 'Address the warnings for a successful submission'
                : 'Your submission is in good shape'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {recommendations && recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li 
                    key={idx} 
                    className={`p-3 rounded border ${getBackgroundClass(rec.type)}`}
                  >
                    <div className="flex items-start">
                      <div className={`mr-2 mt-0.5 text-${rec.type === 'error' ? 'red' : rec.type === 'warning' ? 'yellow' : 'blue'}-600`}>
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div>
                        <p className="text-sm">{rec.message}</p>
                        {rec.link && (
                          <a
                            href={rec.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-xs underline mt-1 inline-flex items-center"
                          >
                            View Regulation
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No regulatory issues detected</p>
                <p className="text-xs mt-1">Continue completing the form for more feedback</p>
              </div>
            )}
          </div>
          
          <div className="border-t p-3 text-xs text-center text-gray-500 bg-gray-50">
            Powered by TrialSage™ AI Regulatory Engine
          </div>
        </>
      )}
    </div>
  );
}