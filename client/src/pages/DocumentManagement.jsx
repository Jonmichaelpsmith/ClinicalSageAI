import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "wouter";
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { 
  Database, FileText, Lock, FileCheck, 
  BookOpen, Layers, Lightbulb, Search,
  FileSearch, Filter, Bot, Folder, Download,
  Upload, Plus, RefreshCw, FileUp, CheckCircle,
  AlertCircle, ArrowLeft, ArrowRight, Home,
  ChevronDown, ExternalLink, Monitor, LayoutGrid
} from 'lucide-react';
import { useDocuShare } from '../contexts/DocuShareContext';
import DocuShareIntegration from '@/components/document-management/DocuShareIntegration';
import FolderTreeView from '@/components/document-management/FolderTreeView';
import DocumentViewer from '@/components/document-management/DocumentViewer';
import SemanticSearchBar from '@/components/search/SemanticSearchBar';
import SemanticSearchResults from '@/components/search/SemanticSearchResults';
import { semanticSearch } from '@/services/SemanticSearchService';
import { LumenAssistantButton } from '@/components/assistant';
import { useToast } from '@/hooks/use-toast';

// Navigation modules for "Go To" menu
const NAVIGATION_MODULES = [
  { id: 'client-portal', name: 'Client Portal', path: '/portal/client', icon: LayoutGrid },
  { id: 'ind-wizard', name: 'IND Wizard', path: '/ind-wizard', icon: Database },
  { id: 'csr-module', name: 'CSR Management', path: '/enterprise-csr-intelligence', icon: FileText },
  { id: 'cer-generator', name: 'CER Generator', path: '/cer-generator', icon: FileCheck },
  { id: 'regulatory', name: 'Regulatory Module', path: '/regulatory-module', icon: Layers },
  { id: 'analytics', name: 'Analytics Dashboard', path: '/analytics', icon: Lightbulb },
  { id: 'document-vault', name: 'Enterprise Document Vault', path: '/enterprise-document-vault', icon: Lock }
];

export default function DocumentManagement() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showTreeView, setShowTreeView] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [showEnterpriseShowcase, setShowEnterpriseShowcase] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const navMenuRef = useRef(null);
  
  // Close nav menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSearch = async (searchParams) => {
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const results = await semanticSearch(
        searchParams.query, 
        searchParams.filters, 
        searchParams.searchMode
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing semantic search:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    console.log('Selected document:', document);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFileToUpload(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!fileToUpload) return;
    
    try {
      // In production this would call your API
      toast({
        title: "Upload Started",
        description: `Uploading ${fileToUpload.name}...`,
      });
      
      // Simulate upload delay
      setTimeout(() => {
        toast({
          title: "Upload Complete",
          description: `${fileToUpload.name} has been uploaded successfully.`,
          variant: "default",
        });
        setFileToUpload(null);
        setUploadOpen(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteDocument = (document) => {
    if (confirm(`Are you sure you want to delete ${document.displayName}?`)) {
      toast({
        title: "Document Deleted",
        description: `${document.displayName} has been deleted successfully.`,
      });
      setSelectedDocument(null);
    }
  };
  
  // Toggle tree view on smaller screens for responsive design
  const toggleTreeView = () => {
    setShowTreeView(!showTreeView);
  };
  
  // Open a module in a new window (support for multi-monitor)
  const openInNewWindow = (path) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${path}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    setShowNavMenu(false);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/portal/client">
              <Button variant="outline" className="flex items-center gap-2">
                <Home size={16} />
                Home
              </Button>
            </Link>
            
            <div className="relative" ref={navMenuRef}>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowNavMenu(!showNavMenu)}
              >
                <Monitor size={16} />
                Go To
                <ChevronDown size={14} />
              </Button>
              
              {showNavMenu && (
                <div className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1 divide-y divide-gray-100">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500">
                      NAVIGATE TO MODULE
                    </div>
                    {NAVIGATION_MODULES.map(module => (
                      <div key={module.id} className="px-1 py-1">
                        <Link href={module.path}>
                          <a className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-md">
                            <module.icon size={16} className="mr-2 text-orange-600" />
                            {module.name}
                          </a>
                        </Link>
                        <button 
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                          onClick={() => openInNewWindow(module.path)}
                        >
                          <ExternalLink size={14} className="mr-2 text-blue-600" />
                          Open in New Window
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-black">Document Management</h1>
              <p className="text-gray-600 mt-1">
                Microsoft-style folder tree with 21 CFR Part 11 compliance
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="md:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={toggleTreeView}
            >
              {showTreeView ? <ArrowLeft size={16} className="mr-1" /> : <ArrowRight size={16} className="mr-1" />}
              {showTreeView ? "Hide Folders" : "Show Folders"}
            </button>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              21 CFR Part 11 Compliant
            </div>
          </div>
        </div>
        
        {/* Unified Semantic Search */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50 p-4 rounded-lg border border-orange-200 mb-4">
            <div className="flex items-start mb-4">
              <div className="bg-orange-600 p-2 rounded-md mr-3">
                <FileSearch size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black">Unified Document Search</h2>
                <p className="text-sm text-gray-700">
                  Search across all document types, records, and communications using natural language. Our AI-powered semantic search understands context and relationships.
                </p>
              </div>
            </div>
            <SemanticSearchBar 
              onSearch={handleSearch}
              size="lg"
              placeholder="Try 'critical deviations in EU in Q1' or 'safety concerns in Phase II trials'..."
            />
          </div>
          
          {/* Search Results Section */}
          {showSearchResults && searchResults && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
              <div className="border-b border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="text-orange-600 mr-2 h-5 w-5" />
                  <h3 className="font-medium">Search Results</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSearchResults(false)}
                >
                  Close Results
                </Button>
              </div>
              <div className="p-4">
                <SemanticSearchResults
                  results={searchResults}
                  isLoading={isSearching}
                  onSelectDocument={handleSelectDocument}
                />
              </div>
            </div>
          )}
        </div>
        
        {showEnterpriseShowcase && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-orange-600 rounded-md flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black">Enterprise Document Vault Available</h2>
                  <p className="text-sm text-gray-700">
                    Experience our enhanced DocuShare Enterprise solution with comprehensive case studies for Life Sciences
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowEnterpriseShowcase(false)}
                >
                  Dismiss
                </Button>
                <Link href="/enterprise-document-vault">
                  <Button>
                    Enterprise Showcase →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Document Management with Microsoft-style Folder Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
          {/* Folder Tree (Left Panel) */}
          {showTreeView && (
            <div className="lg:col-span-1 h-[calc(100vh-250px)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-black flex items-center">
                  <Folder className="mr-2 text-orange-500" size={20} />
                  Folders
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setUploadOpen(!uploadOpen)}
                    className="p-1.5 rounded hover:bg-orange-100 text-orange-600"
                    title="Upload document"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600"
                    title="Refresh folders"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
              
              {/* File Upload Area */}
              {uploadOpen && (
                <div className="mb-4 p-3 border border-dashed border-orange-300 rounded-lg bg-orange-50">
                  <div className="text-sm font-medium mb-2 text-gray-700">Upload Document</div>
                  <div className="mb-2">
                    <label className="flex items-center justify-center w-full h-20 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
                      <div className="flex flex-col items-center">
                        <FileUp className="w-6 h-6 text-orange-500 mb-1" />
                        <span className="text-sm text-gray-500">
                          {fileToUpload ? fileToUpload.name : "Click to select file"}
                        </span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setFileToUpload(null);
                        setUploadOpen(false);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!fileToUpload}
                      className={`px-3 py-1 text-sm text-white rounded-md ${
                        fileToUpload 
                          ? "bg-orange-600 hover:bg-orange-700" 
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>
              )}
              
              {/* Folder Tree View */}
              <FolderTreeView 
                onSelectDocument={handleSelectDocument}
              />
            </div>
          )}
          
          {/* Document Preview (Right Panel) */}
          <div className={`${showTreeView ? 'lg:col-span-3' : 'lg:col-span-4'} h-[calc(100vh-250px)]`}>
            <DocumentViewer 
              document={selectedDocument}
              onDelete={handleDeleteDocument}
            />
          </div>
        </div>
        
        {/* Additional Context Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
            <Database size={20} className="text-orange-600 mr-2" />
            Related Document Repositories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 flex items-center">
                <Database size={18} className="text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-black">CSR Repository</h3>
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
              <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex items-center">
                <FileCheck size={18} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-black">IND Documents</h3>
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
                <h3 className="text-lg font-semibold text-black">Regulatory Filings</h3>
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
        </div>
      </div>
      
      {/* Floating Lumen Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <LumenAssistantButton 
          variant="primary"
          size="lg"
          tooltip="Ask Lumen about document management"
          contextData={{
            module: "documentManagement",
            activeView: selectedDocument ? "documentView" : "repositoryView"
          }}
        />
      </div>
    </Layout>
  );
}