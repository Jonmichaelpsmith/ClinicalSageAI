import React from 'react';
import { Layout } from '@/components/ui/layout';
import DocuShareVault from '@/components/DocuShareVault';

export default function DocumentManagement() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Document Management</h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            21 CFR Part 11 Compliant
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-xl font-semibold">DocuShare Document Vault</h2>
            <p className="text-sm text-gray-600">
              Manage and access your regulatory documents with full 21 CFR Part 11 compliance
            </p>
          </div>
          
          <DocuShareVault />
        </div>
      </div>
    </Layout>
  );
}