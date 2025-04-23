/**
 * IndWizardLayout Component
 * 
 * Main layout for the IND Wizard 3.3 - Predictive Insights Edition
 * With multilingual support, ROI savings tracking, confidence intervals
 * and predictive analytics with sparklines and Monte Carlo waterfall charts
 */

import { useState, useEffect } from "react";
import WizardHeader from "../wizard/WizardHeader.jsx";
import StepNav from "../wizard/StepNav.jsx";
import StepContent from "../wizard/StepContent.jsx";
import DocDrawer from "../wizard/DocDrawer.jsx";
import KpiRibbon from "../wizard/KpiRibbon.jsx";
import LanguageToggle from "../wizard/LanguageToggle.jsx";
import { AnimatePresence } from "framer-motion";

// Import i18n initialization
import "../i18n/i18n.js";
import { useTranslation } from "../utils/i18n-stub.js";

export default function IndWizardLayout() {
  const { i18n, t } = useTranslation();
  const [step, setStep] = useState(0);
  const [kpi, setKpi] = useState({ 
    ready: 0, 
    errors: 0, 
    docs: 0,
    savings: 0,
    trend: {
      ready: 0,
      errors: 0,
      docs: 0,
      savings: 0
    },
    spark: {
      ready: [],
      errors: [],
      docs: [],
      savings: []
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [predictiveData, setPredictiveData] = useState({
    loading: true,
    completion: null,
    confidence: null,
    estimatedDate: null
  });
  
  useEffect(() => {
    // Fetch KPI data with trend information and sparklines
    fetch("/api/ind/kpi")
      .then(r => r.json())
      .then(setKpi)
      .catch(err => {
        console.error("Error fetching KPI data:", err);
        // Error will be handled by the API endpoint fallback
      });
      
    // Fetch predictive data for current step
    if (step > 0) {
      setPredictiveData(prev => ({ ...prev, loading: true }));
      fetch(`/api/ind/predict?step=${step}`)
        .then(r => r.json())
        .then(data => {
          setPredictiveData({
            loading: false,
            completion: data.completion || 65,
            confidence: data.confidence || 90,
            estimatedDate: data.estimatedDate || new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
          });
        })
        .catch(err => {
          console.error("Error fetching predictive data:", err);
          setPredictiveData({
            loading: false,
            completion: 65,
            confidence: 90,
            estimatedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
          });
        });
    }
  }, [step]);
  
  // Handle language change
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    
    // Update document title based on language
    document.title = t('wizardHeader.title');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-regulatory-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <LanguageToggle onLanguageChange={changeLanguage} />
      <WizardHeader kpi={kpi} />
      
      <div className="flex flex-1 overflow-hidden">
        <StepNav 
          step={step} 
          onSelect={setStep} 
          predictiveData={!predictiveData.loading ? predictiveData : null}
        />
        <div className="flex-1 relative p-6 overflow-y-auto">
          <StepContent 
            step={step} 
            onOpenDrawer={() => setDrawer(true)} 
            predictiveData={!predictiveData.loading ? predictiveData : null}
          />
        </div>
        <AnimatePresence>
          {drawer && <DocDrawer onClose={() => setDrawer(false)} />}
        </AnimatePresence>
      </div>
      
      <KpiRibbon kpi={kpi} />
    </div>
  );
}