import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, XCircle, ChevronDown, ChevronUp, FileText, Download, ExternalLink } from 'lucide-react';

const FDAComplianceDocumentation = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: requirements, isLoading } = useQuery({
    queryKey: ['/api/fda-compliance/requirements'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Group requirements by section
  const sections = {
    'Controls for Closed Systems': requirements?.requirements.filter(r => r.code.includes('11.10')),
    'Controls for Open Systems': requirements?.requirements.filter(r => r.code.includes('11.30')),
    'Signature Requirements': requirements?.requirements.filter(r => r.code.includes('11.50') || r.code.includes('11.70')),
    'Electronic Signature Components': requirements?.requirements.filter(r => r.code.includes('11.100') || r.code.includes('11.200') || r.code.includes('11.300'))
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">21 CFR Part 11 Compliance Documentation</h2>
        <p className="text-gray-600 mb-6">
          This documentation outlines how TrialSage™ meets or exceeds the FDA requirements for 21 CFR Part 11 compliance,
          including electronic records and electronic signatures for regulatory submissions.
        </p>

        {/* Documentation Downloads */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Reference Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-4 flex items-start">
              <FileText className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Validation Master Plan</h4>
                <p className="text-sm text-gray-600 mb-2">Overview of the validation approach for TrialSage</p>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center">
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 flex items-start">
              <FileText className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Part 11 Implementation Guide</h4>
                <p className="text-sm text-gray-600 mb-2">Detailed implementation strategy for regulatory compliance</p>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center">
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 flex items-start">
              <FileText className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Blockchain Security Whitepaper</h4>
                <p className="text-sm text-gray-600 mb-2">Enhanced security measures and implementation details</p>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center">
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* External Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-3">FDA Guidance Resources</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <ul className="space-y-2">
              <li className="flex items-center">
                <ExternalLink className="h-4 w-4 text-blue-500 mr-2" />
                <a
                  href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Part 11, Electronic Records; Electronic Signatures — Scope and Application
                </a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="h-4 w-4 text-blue-500 mr-2" />
                <a
                  href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computerized-systems-used-clinical-investigations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Guidance for Industry: Computerized Systems Used in Clinical Investigations
                </a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="h-4 w-4 text-blue-500 mr-2" />
                <a
                  href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/use-electronic-records-and-electronic-signatures-clinical-investigations-under-21-cfr-part-11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Use of Electronic Records and Electronic Signatures in Clinical Investigations
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requirement Sections */}
      {Object.entries(sections).map(([sectionTitle, sectionRequirements]) => (
        <div key={sectionTitle} className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Section Header */}
          <div
            className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => toggleSection(sectionTitle)}
          >
            <h3 className="text-lg font-semibold">{sectionTitle}</h3>
            <div>
              {expandedSection === sectionTitle ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Section Content */}
          {expandedSection === sectionTitle && (
            <div className="p-4">
              <div className="border-t border-gray-200 pt-4">
                {sectionRequirements?.map((requirement) => (
                  <div key={requirement.id} className="mb-6 last:mb-0">
                    <div className="flex items-start mb-2">
                      {requirement.status === 'compliant' ? (
                        <div className="mt-1 mr-3 bg-green-100 p-1 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="mt-1 mr-3 bg-red-100 p-1 rounded-full">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-semibold">{requirement.code}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            requirement.status === 'compliant' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {requirement.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{requirement.description}</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-1">Implementation:</p>
                          <p className="text-gray-600">{requirement.implementationDetails}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FDAComplianceDocumentation;