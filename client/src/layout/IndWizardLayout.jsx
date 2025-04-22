/**
 * IndWizardLayout Component
 * 
 * Main layout for the IND Wizard 2.0 with responsive design and modern UI
 */

import { useState, useEffect } from "react";
import WizardHeader from "../wizard/WizardHeader.jsx";
import StepNav from "../wizard/StepNav.jsx";
import StepContent from "../wizard/StepContent.jsx";
import DocDrawer from "../wizard/DocDrawer.jsx";
import KpiRibbon from "../wizard/KpiRibbon.jsx";

export default function IndWizardLayout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [kpi, setKpi] = useState({ ready: 0, errors: 0, docs: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Listen for changes to color scheme
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  useEffect(() => {
    // Fetch KPI data
    fetch("/api/ind/kpi")
      .then(r => r.json())
      .then(setKpi)
      .catch(err => {
        console.error("Error fetching KPI data:", err);
        // Fallback data for demonstration
        setKpi({ 
          ready: 67, 
          errors: 3, 
          docs: 12
        });
      });
  }, [currentStep]);
  
  const handleStepChange = (stepIndex) => {
    setCurrentStep(stepIndex);
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
      <WizardHeader kpi={kpi} />
      
      <div className="flex flex-1 overflow-hidden">
        <StepNav step={currentStep} onSelect={handleStepChange} />
        
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <button 
              onClick={toggleDrawer}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow hover:shadow-md border border-gray-200 dark:border-gray-700"
              title="Open Document Manager"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow hover:shadow-md border border-gray-200 dark:border-gray-700"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          
          <StepContent step={currentStep} onOpenDrawer={toggleDrawer} />
          
          {drawerOpen && <DocDrawer onClose={toggleDrawer} />}
        </main>
      </div>
      
      <KpiRibbon kpi={kpi} />
    </div>
  );
}