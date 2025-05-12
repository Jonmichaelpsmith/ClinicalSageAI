/**
 * Enhanced Literature Discovery Component
 * 
 * This component combines the literature search, citation management, and
 * summary generation features into a unified interface for 510(k) documents.
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  BookMarked,
  ArrowUpDown,
  History,
  BookOpen
} from "lucide-react";

import EnhancedLiteratureSearch from './EnhancedLiteratureSearch';
import CitationManager from './CitationManager';
import LiteratureSummaryGenerator from './LiteratureSummaryGenerator';

const EnhancedLiteratureDiscovery = ({ documentId, documentType = '510k', activeTab = 'search' }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showSummaryGenerator, setShowSummaryGenerator] = useState(false);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  
  const { toast } = useToast();
  
  // Handler for citation successful event
  const handleCiteSuccess = (citation) => {
    toast({
      title: "Citation added",
      description: "The citation has been added to your document",
      variant: "default"
    });
    // Optionally refresh citations or provide feedback
  };
  
  // Handler for summarize action
  const handleSummarize = (entries) => {
    setSelectedEntries(entries);
    setShowSummaryGenerator(true);
  };
  
  // Handler for returning from summary generator to search
  const handleBackToSearch = () => {
    setShowSummaryGenerator(false);
  };
  
  return (
    <div className="enhanced-literature-discovery">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Enhanced Literature Discovery</CardTitle>
          <CardDescription>
            Search, cite, and summarize literature from multiple sources for your 510(k) submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!documentId ? (
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
              <p className="text-yellow-800">
                <strong>No document selected.</strong> Please select a document to enable literature discovery and citation features.
              </p>
            </div>
          ) : null}
          
          {showSummaryGenerator ? (
            <LiteratureSummaryGenerator 
              entries={selectedEntries}
              onBackToSearch={handleBackToSearch}
              documentId={documentId}
              documentType={documentType}
            />
          ) : (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="mb-4 grid grid-cols-2">
                <TabsTrigger value="search" className="flex items-center">
                  <Search className="mr-2 h-4 w-4" /> Literature Search
                </TabsTrigger>
                <TabsTrigger value="citations" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" /> Citations Manager
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search">
                <EnhancedLiteratureSearch 
                  documentId={documentId}
                  documentType={documentType}
                  onCiteSuccess={handleCiteSuccess}
                  onSummarize={handleSummarize}
                  multiSelectMode={true}
                />
              </TabsContent>
              
              <TabsContent value="citations">
                <CitationManager 
                  documentId={documentId}
                  documentType={documentType}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {!showSummaryGenerator && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Summaries Panel */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Recent Summaries</CardTitle>
                <Button variant="ghost" size="sm">
                  <History className="mr-2 h-4 w-4" /> View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSummaries ? (
                <div className="flex justify-center items-center py-6">
                  <p className="text-gray-500">Loading recent summaries...</p>
                </div>
              ) : recentSummaries.length > 0 ? (
                <div className="space-y-3">
                  {recentSummaries.map(summary => (
                    <div 
                      key={summary.id}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline">
                          {summary.summary_type === 'standard' && 'Standard Summary'}
                          {summary.summary_type === 'detailed' && 'Detailed Analysis'}
                          {summary.summary_type === 'critical' && 'Critical Review'}
                          {summary.summary_type === 'comparison' && 'Comparative Assessment'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(summary.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {summary.title || `Summary of ${summary.literature_count} sources`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {summary.summary.substring(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BookMarked className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 mb-1">No summaries generated yet</p>
                  <p className="text-xs text-gray-400">
                    Select multiple literature entries and click "Summarize" to generate your first summary
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Tips Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Literature Discovery Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-full mr-3 mt-1">
                    <Search className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Enhanced Search Capabilities</h4>
                    <p className="text-sm text-gray-500">
                      Use semantic search to find relevant literature based on the meaning of your query, not just keywords.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-50 p-2 rounded-full mr-3 mt-1">
                    <BookMarked className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">AI-Powered Summaries</h4>
                    <p className="text-sm text-gray-500">
                      Generate comprehensive summaries from multiple literature sources to save time and ensure thoroughness.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-50 p-2 rounded-full mr-3 mt-1">
                    <FileText className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Citation Management</h4>
                    <p className="text-sm text-gray-500">
                      Track and organize all literature citations across your 510(k) document for easy reference.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-50 p-2 rounded-full mr-3 mt-1">
                    <ArrowUpDown className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Multiple Sources</h4>
                    <p className="text-sm text-gray-500">
                      Access literature from PubMed, FDA, ClinicalTrials.gov, and your own imported documents.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedLiteratureDiscovery;