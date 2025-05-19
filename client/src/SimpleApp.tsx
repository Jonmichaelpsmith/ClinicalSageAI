import { useState, useEffect } from "react";

// Modal cleanup function that removes lingering elements
function cleanupModals(): void {
  // Find and remove any modal backdrop elements
  const modalBackdrops = document.querySelectorAll('.modal-backdrop');
  modalBackdrops.forEach(element => {
    element.remove();
  });

  // Find and remove any orphaned modal elements
  const orphanedModals = document.querySelectorAll('.modal[aria-hidden="true"]');
  orphanedModals.forEach(element => {
    element.remove();
  });

  // Find open modals and close them properly
  const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
  openModals.forEach(element => {
    element.setAttribute('aria-hidden', 'true');
    element.classList.add('hidden');
  });

  // Find and remove floating overlay elements 
  const overlays = document.querySelectorAll('.overlay, .dialog-overlay');
  overlays.forEach(element => {
    element.remove();
  });

  // Clean up body classes that might have been added
  document.body.classList.remove('modal-open', 'overflow-hidden');
  
  // Ensure body scrolling is restored
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Simple tab component
const SimpleTab = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    className={`px-4 py-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-t-lg`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Main application
function SimpleApp() {
  const [activeTab, setActiveTab] = useState("overview");

  // Cleanup modals when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  // Clean up modals when tab changes
  useEffect(() => {
    console.log("Cleaning up modals on tab change to:", activeTab);
    cleanupModals();
  }, [activeTab]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Regulatory Compliance Portal</h1>
      
      <div className="flex space-x-2 mb-4 border-b">
        <SimpleTab 
          label="Overview" 
          isActive={activeTab === "overview"} 
          onClick={() => setActiveTab("overview")} 
        />
        <SimpleTab 
          label="FDA Submissions" 
          isActive={activeTab === "submissions"} 
          onClick={() => setActiveTab("submissions")} 
        />
        <SimpleTab 
          label="Quality Management" 
          isActive={activeTab === "quality"} 
          onClick={() => setActiveTab("quality")} 
        />
        <SimpleTab 
          label="Reports" 
          isActive={activeTab === "reports"} 
          onClick={() => setActiveTab("reports")} 
        />
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Compliance Overview</h2>
            <p>The cleanupModals function removes floating elements when navigating between tabs.</p>
          </div>
        )}
        
        {activeTab === "submissions" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">FDA Submissions</h2>
            <p>All lingering modal elements are cleaned up when switching to this tab.</p>
          </div>
        )}
        
        {activeTab === "quality" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Quality Management</h2>
            <p>The cleanupModals function is called when this tab is activated.</p>
          </div>
        )}
        
        {activeTab === "reports" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Compliance Reports</h2>
            <p>Modal cleanup is performed when navigating to this tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleApp;