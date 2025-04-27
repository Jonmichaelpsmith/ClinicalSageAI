import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Database, FileText, FlaskConical, BarChartBig, ShieldCheck, BookText } from 'lucide-react';
import { useModuleIntegration } from './integration/ModuleIntegrationLayer';
import TrialVaultModule from './trial-vault/TrialVaultModule';

const UnifiedPlatform = () => {
  const { addAuditEntry } = useModuleIntegration();
  const [_, navigate] = useLocation();
  
  // Auto-select the Vault module when component loads
  useEffect(() => {
    handleModuleClick('vault');
    navigate('/vault');
  }, []);

  const handleModuleClick = (moduleName) => {
    addAuditEntry('module_selected', { module: moduleName });
  };

  // Direct access to Vault module, skipping the module selection UI
  return (
    <div className="flex flex-col">
      <TrialVaultModule />
    </div>
  );
};

export default UnifiedPlatform;