/**
 * Application Provider Component
 * 
 * This component wraps the entire application to provide context
 * required by all components.
 */

import React from 'react';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import { TenantProvider } from './contexts/TenantContext';

const AppProvider = ({ children }) => {
  return (
    <TenantProvider>
      <ModuleIntegrationProvider>
        {children}
      </ModuleIntegrationProvider>
    </TenantProvider>
  );
};

export default AppProvider;