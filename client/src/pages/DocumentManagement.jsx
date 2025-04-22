import React from 'react';
import { Link } from "wouter";
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { 
  Database, FileText, Lock, FileCheck, 
  BookOpen, Layers, Lightbulb
} from 'lucide-react';
import DocuShareIntegration from '@/components/document-management/DocuShareIntegration';

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
              <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Enterprise Document Vault Available</h2>
                <p className="text-sm text-gray-700">
                  Experience our enhanced DocuShare Enterprise solution with comprehensive case studies for Life Sciences
                </p>
              </div>
            </div>
            <Link href="/enterprise-document-vault">
              <Button>
                Enterprise Showcase →
              </Button>
            </Link>
          </div>
        </div>
        
        {/* DocuShare Module Integration Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex items-center">
              <Database size={18} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">CSR Repository</h3>
            </div>
            <div className="p-3">
              <DocuShareIntegration 
                moduleName="csr"
                moduleLabel="CSR Documents"
                compact={true}
                hidePreview={true}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-3 flex items-center">
              <FileCheck size={18} className="text-rose-600 mr-2" />
              <h3 className="text-lg font-semibold">IND Documents</h3>
            </div>
            <div className="p-3">
              <DocuShareIntegration 
                moduleName="ind"
                moduleLabel="IND Documents"
                compact={true}
                hidePreview={true}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 flex items-center">
              <Layers size={18} className="text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold">Regulatory Filings</h3>
            </div>
            <div className="p-3">
              <DocuShareIntegration 
                moduleName="regulatory"
                moduleLabel="Regulatory Documents"
                compact={true}
                hidePreview={true}
              />
            </div>
          </div>
        </div>
        
        {/* Enterprise Features */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4 mb-8">
          <div className="flex items-center mb-4">
            <Lock size={18} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Enterprise Features</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 p-2 rounded-md mr-3">
                  <Lock size={16} className="text-blue-600" />
                </div>
                <h4 className="font-medium">21 CFR Part 11 Compliance</h4>
              </div>
              <p className="text-sm text-gray-600">
                Full regulatory compliance with electronic signatures, audit trails, and access controls
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="bg-purple-100 p-2 rounded-md mr-3">
                  <Layers size={16} className="text-purple-600" />
                </div>
                <h4 className="font-medium">Version Control</h4>
              </div>
              <p className="text-sm text-gray-600">
                Comprehensive versioning with document lifecycle management
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 p-2 rounded-md mr-3">
                  <Lightbulb size={16} className="text-green-600" />
                </div>
                <h4 className="font-medium">AI-Powered Insights</h4>
              </div>
              <p className="text-sm text-gray-600">
                Advanced document analysis with regulatory compliance checks
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Document Repository */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-xl font-semibold flex items-center">
              <BookOpen size={20} className="text-blue-600 mr-2" />
              Document Repository
            </h2>
            <p className="text-sm text-gray-600">
              Manage and access your regulatory documents with full 21 CFR Part 11 compliance
            </p>
          </div>
          
          <DocuShareIntegration 
            moduleName="default"
            moduleLabel="Document Repository"
          />
        </div>
      </div>
    </Layout>
  );
}