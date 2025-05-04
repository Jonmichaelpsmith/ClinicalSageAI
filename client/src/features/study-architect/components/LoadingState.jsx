import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading Study Architect components...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingState;