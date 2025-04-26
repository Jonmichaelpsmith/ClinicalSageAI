import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, fetchFDAComplianceStatus, runFDAComplianceValidation, generateFDAComplianceReport } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

const FDAComplianceDashboard = () => {
  const { toast } = useToast();
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch FDA compliance status
  const { 
    data: complianceStatus, 
    isLoading: statusLoading, 
    error: statusError 
  } = useQuery({
    queryKey: ['/api/fda-compliance/status'],
    queryFn: fetchFDAComplianceStatus,
    refetchInterval: 1000 * 60 * 15 // Refetch every 15 minutes
  });

  // Mutation for running compliance validation
  const validationMutation = useMutation({
    mutationFn: runFDAComplianceValidation,
    onSuccess: () => {
      toast.success('FDA compliance validation completed successfully', {
        title: 'Validation Complete'
      });
      queryClient.invalidateQueries(['/api/fda-compliance/status']);
    },
    onError: (error) => {
      toast.error(`Failed to run FDA compliance validation: ${error.message}`, {
        title: 'Validation Failed'
      });
    }
  });

  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const report = await generateFDAComplianceReport();
      
      // In a real implementation, this might create a PDF or display a detailed report
      console.log('FDA Compliance Report:', report);
      
      toast.success('FDA compliance report generated successfully', {
        title: 'Report Generated'
      });
      
      // Simulate opening the report
      setTimeout(() => {
        window.open('#/fda-compliance/report', '_blank');
      }, 1000);
    } catch (error) {
      toast.error(`Failed to generate FDA compliance report: ${error.message}`, {
        title: 'Report Generation Failed'
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Handle run validation
  const handleRunValidation = () => {
    validationMutation.mutate();
  };

  // Component for score display
  const ScoreDisplay = ({ score, label, bgClass }) => (
    <div className={`${bgClass} rounded-lg shadow p-4 text-center`}>
      <div className="text-2xl font-bold">{score}%</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );

  if (statusLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">Failed to load FDA compliance status</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">FDA 21 CFR Part 11 Compliance</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRunValidation}
            disabled={validationMutation.isPending}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed"
          >
            {validationMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
            ) : (
              'Run Validation'
            )}
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Overall Compliance Score</h3>
          <div className={`px-3 py-1 rounded text-white ${complianceStatus.score >= 90 ? 'bg-green-500' : 'bg-red-500'}`}>
            {complianceStatus.status}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${
              complianceStatus.score >= 95 ? 'bg-green-500' : 
              complianceStatus.score >= 90 ? 'bg-green-400' : 
              complianceStatus.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${complianceStatus.score}%` }}
          ></div>
        </div>
        
        <div className="text-right text-sm text-gray-600 mt-1">
          Last validated: {new Date(complianceStatus.lastValidated).toLocaleString()}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Component Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreDisplay 
            score={complianceStatus.components.electronicSignatures} 
            label="Electronic Signatures" 
            bgClass="bg-pink-50"
          />
          <ScoreDisplay 
            score={complianceStatus.components.dataIntegrity} 
            label="Data Integrity" 
            bgClass="bg-purple-50"
          />
          <ScoreDisplay 
            score={complianceStatus.components.systemValidation} 
            label="System Validation" 
            bgClass="bg-blue-50"
          />
          <ScoreDisplay 
            score={complianceStatus.components.auditTrails} 
            label="Audit Trails" 
            bgClass="bg-green-50"
          />
          <ScoreDisplay 
            score={complianceStatus.components.accessControls} 
            label="Access Controls" 
            bgClass="bg-yellow-50"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Status Summary</h3>
        <p className="text-gray-700">
          {complianceStatus.score >= 95 
            ? 'Your system exceeds FDA 21 CFR Part 11 compliance requirements with enhanced blockchain-secured audit trails and tamper-evident electronic records.'
            : complianceStatus.score >= 90
            ? 'Your system meets FDA 21 CFR Part 11 compliance requirements but could benefit from minor improvements in certain areas.'
            : 'Your system does not fully meet FDA 21 CFR Part 11 compliance requirements. Please review the recommendations and address the issues.'}
        </p>
        <div className="mt-4 flex justify-end">
          <a href="#/fda-compliance/recommendations" className="text-pink-600 hover:text-pink-800">
            View Detailed Recommendations →
          </a>
        </div>
      </div>
    </div>
  );
};

export default FDAComplianceDashboard;