/**
 * Application Provider Component
 * 
 * This component wraps the entire application to provide context
 * required by all components.
 */

import React from 'react';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';

const AppProvider = ({ children }) => {
  return (
    <ModuleIntegrationProvider>
      {children}
    </ModuleIntegrationProvider>
  );
};

export default AppProvider;