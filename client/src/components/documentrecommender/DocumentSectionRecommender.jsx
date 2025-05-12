import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, CheckCircle2, AlertTriangle, ArrowRight, FileText, ListChecks, Sparkles, FileSearch } from 'lucide-react';
import DocumentSectionRecommenderService from '../../services/DocumentSectionRecommenderService';
import { useTenant } from '@/contexts/TenantContext';
import { isFeatureEnabled } from '../../flags/featureFlags';
import SectionPriorityList from './SectionPriorityList';
import ContentSuggestionPanel from './ContentSuggestionPanel';
import DocumentGapAnalysis from './DocumentGapAnalysis';

/**
 * Intelligent Document Section Recommender Component
 * 
 * This component provides AI-driven recommendations for document sections,
 * content suggestions, and gap analysis for regulatory documents.
 */
const DocumentSectionRecommender = ({ 
  deviceProfile, 
  documentType = '510k', 
  currentContent = {}, 
  onSectionSelect 
}) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [priorityOrder, setPriorityOrder] = useState([]);
  const [insightSummary, setInsightSummary] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [contentSuggestions, setContentSuggestions] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  const { currentOrganization } = useTenant();
  const isEnabled = isFeatureEnabled('documentRecommender', currentOrganization?.id);

  // Load initial recommendations when device profile changes
  useEffect(() => {
    if (!deviceProfile || !isEnabled) return;
    
    loadRecommendations();
  }, [deviceProfile, documentType]);

  // Fetch recommendations from API
  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DocumentSectionRecommenderService.getSectionRecommendations(
        deviceProfile,
        documentType,
        currentOrganization?.id
      );
      
      if (response.success) {
        setRecommendations(response.recommendations);
        setPriorityOrder(response.priorityOrder);
        setInsightSummary(response.insightSummary);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Document recommender error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load content suggestions for a selected section
  const loadContentSuggestions = async (sectionKey) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DocumentSectionRecommenderService.getSectionContentSuggestions(
        deviceProfile,
        documentType,
        sectionKey,
        currentOrganization?.id
      );
      
      if (response.success) {
        setContentSuggestions(response.suggestions);
        setSelectedSection(sectionKey);
        setActiveTab('contentSuggestions');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load content suggestions. Please try again.');
      console.error('Content suggestion error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load gap analysis
  const loadGapAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DocumentSectionRecommenderService.getDocumentGapAnalysis(
        deviceProfile,
        documentType,
        currentContent,
        currentOrganization?.id
      );
      
      if (response.success) {
        setGapAnalysis(response);
        setActiveTab('gapAnalysis');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to perform gap analysis. Please try again.');
      console.error('Gap analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle section selection
  const handleSectionSelect = (sectionKey) => {
    if (onSectionSelect) {
      onSectionSelect(sectionKey);
    }
    loadContentSuggestions(sectionKey);
  };

  if (!isEnabled) {
    return (
      <Card className="w-full h-full shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            Intelligent Document Section Recommender
          </CardTitle>
          <CardDescription>
            This feature is not enabled for your organization.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          Intelligent Document Section Recommender
          {loading && <span className="ml-2 text-sm font-normal text-muted-foreground">Loading...</span>}
        </CardTitle>
        <CardDescription>
          AI-driven recommendations for document sections, content, and regulatory gaps
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="recommendations" className="flex items-center">
              <ListChecks className="mr-2 h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="contentSuggestions" className="flex items-center" disabled={!selectedSection}>
              <FileText className="mr-2 h-4 w-4" />
              Content Suggestions
            </TabsTrigger>
            <TabsTrigger value="gapAnalysis" className="flex items-center">
              <FileSearch className="mr-2 h-4 w-4" />
              Gap Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="pt-2">
            {insightSummary && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm">{insightSummary}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Recommended Section Priority
              </h4>
              <SectionPriorityList 
                sections={priorityOrder} 
                recommendations={recommendations}
                onSectionSelect={handleSectionSelect}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="contentSuggestions" className="pt-2">
            {selectedSection ? (
              <ContentSuggestionPanel 
                suggestions={contentSuggestions}
                sectionKey={selectedSection}
                onBack={() => setActiveTab('recommendations')}
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p>Select a section from recommendations to see content suggestions</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('recommendations')}
                >
                  Go to Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gapAnalysis" className="pt-2">
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="mb-4"
                onClick={loadGapAnalysis}
                disabled={loading}
              >
                <FileSearch className="mr-2 h-4 w-4" />
                Run Gap Analysis
              </Button>
              
              {gapAnalysis ? (
                <DocumentGapAnalysis 
                  analysis={gapAnalysis}
                  onSectionSelect={handleSectionSelect}
                />
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Click the button above to run a gap analysis on your document</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentSectionRecommender;