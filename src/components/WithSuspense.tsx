import React, { Suspense } from 'react';

const WithSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default WithSuspense; 