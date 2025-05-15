import React from 'react';
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import EquivalenceBuilderPanel from '@/components/cer/EquivalenceBuilderPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import ReportGenerator from '@/components/510k/ReportGenerator';

/**
 * The FDA510kTabContent component serves as the container for all 510(k) submission 
 * related functionality, organizing it into appropriate tabs and views.
 */
function FDA510kTabContent({
  deviceProfile,
  activeTab,
  onTabChange,
  onComplianceChange,
  onComplianceStatusChange,
  isComplianceRunning,
  setIsComplianceRunning,
  compliance,
  sections
}) {
  // Function to handle tab change
  const handleTabChange = (tab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h2 className="text-lg font-medium text-blue-800">510(k) Submission Builder</h2>
        <p className="text-sm text-blue-600">Use the navigation tabs above to create your 510(k) submission</p>
      </div>
      
      {activeTab === 'predicates' && (
        <div className="space-y-4">
          <PredicateFinderPanel 
            deviceProfile={deviceProfile}
            setDeviceProfile={(newProfile) => {
              // Pass the updated device profile back to parent if needed
            }}
            documentId={deviceProfile?.id}
          />
        </div>
      )}
      
      {activeTab === 'equivalence' && (
        <div className="space-y-4">
          <EquivalenceBuilderPanel 
            deviceProfile={deviceProfile}
            setDeviceProfile={(newProfile) => {
              // Pass the updated device profile back to parent if needed
            }}
            documentId={deviceProfile?.id}
          />
        </div>
      )}
      
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <ComplianceScorePanel 
            deviceProfile={deviceProfile}
            setDeviceProfile={(newProfile) => {
              // Pass the updated device profile back to parent if needed
            }}
            documentId={deviceProfile?.id}
            compliance={compliance}
            setCompliance={onComplianceChange}
            isLoading={isComplianceRunning}
            setIsLoading={setIsComplianceRunning}
          />
        </div>
      )}
      
      {activeTab === 'submission' && (
        <div className="space-y-4">
          <ReportGenerator
            deviceProfile={deviceProfile}
            documentId={deviceProfile?.id}
            exportTimestamp={new Date().toISOString()}
            draftStatus={compliance?.status || 'draft'}
            setDraftStatus={onComplianceStatusChange}
            sections={sections}
          />
        </div>
      )}
    </div>
  );
}

export default FDA510kTabContent;