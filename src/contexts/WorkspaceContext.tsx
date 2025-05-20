import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface WorkspaceContextType {
  hasActiveWorkspace: boolean;
  setHasActiveWorkspace: (value: boolean) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check localStorage for active workspace on initial load
  const [hasActiveWorkspace, setHasActiveWorkspace] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('activeWorkspace');
    return storedValue === 'true';
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('activeWorkspace', hasActiveWorkspace.toString());
  }, [hasActiveWorkspace]);

  const clearWorkspace = () => {
    setHasActiveWorkspace(false);
  };

  return (
    <WorkspaceContext.Provider value={{ hasActiveWorkspace, setHasActiveWorkspace, clearWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}; 