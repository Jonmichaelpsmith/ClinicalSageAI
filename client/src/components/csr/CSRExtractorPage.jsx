import React from 'react';
import CSRIngest from './CSRIngest';
import CSRSearchBar from './CSRSearchBar';
import CSRExtractorDashboard from './CSRExtractorDashboard';

export default function CSRExtractorPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">CSR Library</h1>
      <CSRIngest />
      <CSRSearchBar />
      <CSRExtractorDashboard />
    </div>
  );
}