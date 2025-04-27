import React, { createContext, useState } from 'react';

export interface PortalCtx { 
  orgId?: string; 
  programId?: string; 
  studyId?: string; 
  set: (p: Partial<PortalCtx>) => void; 
}

export const PortalContext = createContext<PortalCtx>({ set: () => {} });

export const PortalProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, setState] = useState<PortalCtx>({});
  
  return (
    <PortalContext.Provider 
      value={{
        ...state,
        set: (p) => setState(s => ({...s, ...p}))
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};