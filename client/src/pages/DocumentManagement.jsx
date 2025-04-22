import React from 'react';
import { Link } from "wouter";
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import DocuShareVault from '@/components/DocuShareVault';

export default function DocumentManagement() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-gray-600 mt-1">
              Unified document repository with 21 CFR Part 11 compliance
            </p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            21 CFR Part 11 Compliant
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <div>
                <h2 className="text-lg font-semibold">Enterprise Document Vault Available</h2>
                <p className="text-sm text-gray-700">
                  Experience our enhanced DocuShare Enterprise solution with comprehensive case studies for Life Sciences
                </p>
              </div>
            </div>
            <Link href="/enterprise-vault">
              <Button>
                Enterprise Showcase →
              </Button>
            </Link>
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