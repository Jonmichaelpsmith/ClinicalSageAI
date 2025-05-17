import React from 'react';

// Simple placeholder for SubmissionBuilder module
export default function SubmissionBuilder({ initialModule }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Submission Builder Module</h2>
      <p className="mb-4">This module is being restored. Initial module: {initialModule || 'Not specified'}</p>
      <p>Please check back shortly.</p>
    </div>
  );
}