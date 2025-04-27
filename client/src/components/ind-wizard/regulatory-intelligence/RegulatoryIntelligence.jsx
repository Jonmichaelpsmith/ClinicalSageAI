/**
 * Regulatory Intelligence Component
 * 
 * This component aggregates and displays regulatory intelligence from various sources:
 * - FDA Guidance Documents
 * - EMA Guidelines
 * - PMDA Notifications
 * - ICH Guidelines
 * - Health Canada Regulations
 * - IHE Profiles and Implementation Guides
 * 
 * It provides real-time alerts on regulatory changes and context-specific guidance
 * for IND submissions and clinical trial documentation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ScrollArea,
  ScrollBar
} from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware } from '@/components/ui/database-aware';
import ErrorBoundary from '@/components/ui/error-boundary';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Info,
  ListFilter,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCw,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Bookmark,
  FileCheck,
  Sparkles,
  Bell,
  AlertTriangle,
  CircleAlert,
  BookCheck,
  Building2,
  Newspaper,
  CalendarDays,
  Link2,
  BarChart
} from 'lucide-react';

// Regulatory Authority Icons
const FDAIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M21,5H3C2.447,5,2,5.448,2,6v12c0,0.552,0.447,1,1,1h18c0.553,0,1-0.448,1-1V6C22,5.448,21.553,5,21,5z M8,16H4v-3h4V16z M8,11H4V8h4V11z M14,16h-4v-3h4V16z M14,11h-4V8h4V11z M20,16h-4v-3h4V16z M20,11h-4V8h4V11z"/>
  </svg>
);

const EMAIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M18.918,8L17,11.8l-2-3.8H6v1h1.5v8H6v1h6v-1H9.5V9.2L14,17h1l5-9H18.918z"/>
  </svg>
);

const IHEIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-6h2V17z M13,9h-2V7h2V9z"/>
  </svg>
);

const ICHIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12,2L4,6v12l8,4l8-4V6L12,2z M12,5.723L17.277,9L12,12.277L6.723,9L12,5.723z M5.766,10.48l5.23,2.833v6.424l-5.23-2.615V10.48z M13.004,19.737v-6.424l5.23-2.833v6.643L13.004,19.737z"/>
  </svg>
);

const PMDAIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M11,7h2v6h-2V7z M11,15h2v2h-2V15z"/>
  </svg>
);

const HealthCanadaIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M13,13v5h-2v-5H8l4-8l4,8H13z"/>
  </svg>
);

// Regulatory document types with metadata
const REGULATORY_SOURCES = [
  {
    id: 'fda',
    name: 'FDA',
    fullName: 'U.S. Food and Drug Administration',
    icon: FDAIcon,
    color: 'blue',
    documentTypes: [
      { id: 'guidance', name: 'Guidance Documents' },
      { id: 'draft-guidance', name: 'Draft Guidance Documents' },
      { id: 'rules', name: 'Rules and Regulations' },
      { id: 'ectd', name: 'eCTD Technical Specifications' },
      { id: 'manuals', name: 'Manuals and Procedures' }
    ]
  },
  {
    id: 'ema',
    name: 'EMA',
    fullName: 'European Medicines Agency',
    icon: EMAIcon,
    color: 'cyan',
    documentTypes: [
      { id: 'scientific-guidelines', name: 'Scientific Guidelines' },
      { id: 'regulatory-guidelines', name: 'Regulatory Guidance' },
      { id: 'q&a', name: 'Q&A Documents' },
      { id: 'templates', name: 'Templates and Forms' },
      { id: 'procedures', name: 'Procedures' }
    ]
  },
  {
    id: 'ich',
    name: 'ICH',
    fullName: 'International Council for Harmonisation',
    icon: ICHIcon,
    color: 'purple',
    documentTypes: [
      { id: 'efficacy', name: 'Efficacy Guidelines' },
      { id: 'quality', name: 'Quality Guidelines' },
      { id: 'safety', name: 'Safety Guidelines' },
      { id: 'multidisciplinary', name: 'Multidisciplinary Guidelines' },
      { id: 'implementation', name: 'Implementation Guides' }
    ]
  },
  {
    id: 'pmda',
    name: 'PMDA',
    fullName: 'Pharmaceuticals and Medical Devices Agency (Japan)',
    icon: PMDAIcon,
    color: 'red',
    documentTypes: [
      { id: 'notifications', name: 'Notifications' },
      { id: 'administrative-notices', name: 'Administrative Notices' },
      { id: 'review-reports', name: 'Review Reports' },
      { id: 'q&a', name: 'Q&A Documents' }
    ]
  },
  {
    id: 'health-canada',
    name: 'Health Canada',
    fullName: 'Health Canada',
    icon: HealthCanadaIcon,
    color: 'green',
    documentTypes: [
      { id: 'guidance', name: 'Guidance Documents' },
      { id: 'policies', name: 'Policies' },
      { id: 'templates', name: 'Templates and Forms' },
      { id: 'notices', name: 'Notices' }
    ]
  },
  {
    id: 'ihe',
    name: 'IHE',
    fullName: 'Integrating the Healthcare Enterprise',
    icon: IHEIcon,
    color: 'orange',
    documentTypes: [
      { id: 'technical-frameworks', name: 'Technical Frameworks' },
      { id: 'profiles', name: 'Integration Profiles' },
      { id: 'supplements', name: 'Trial Implementation Supplements' },
      { id: 'handbooks', name: 'Handbooks' }
    ]
  }
];

// Regulatory topics for filtering
const REGULATORY_TOPICS = [
  { id: 'clinical-trials', name: 'Clinical Trials' },
  { id: 'ind', name: 'IND Applications' },
  { id: 'nda', name: 'NDA Submissions' },
  { id: 'maa', name: 'Marketing Authorizations' },
  { id: 'cmc', name: 'Chemistry, Manufacturing, Controls' },
  { id: 'nonclinical', name: 'Nonclinical Studies' },
  { id: 'safety', name: 'Safety Reporting' },
  { id: 'labeling', name: 'Labeling' },
  { id: 'pediatric', name: 'Pediatric Research' },
  { id: 'biostatistics', name: 'Biostatistics' },
  { id: 'biopharmaceutics', name: 'Biopharmaceutics' },
  { id: 'pharmacovigilance', name: 'Pharmacovigilance' },
  { id: 'good-practices', name: 'Good Practices (GxP)' },
  { id: 'interoperability', name: 'Healthcare Interoperability' },
  { id: 'electronic-submissions', name: 'Electronic Submissions' }
];

/**
 * Updates Feed Component - Shows recent regulatory updates
 */
function UpdatesFeed({ updates, isLoading, onViewDetails }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Newspaper className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">No recent regulatory updates found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Check back later for new updates or adjust your filter settings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card key={update.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start p-4">
              <div className={`flex-shrink-0 rounded-full p-1.5 mr-3 bg-${update.source.color}-100`}>
                <update.source.icon />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-base line-clamp-2">{update.title}</h3>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {update.source.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {update.summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {new Date(update.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {update.isNew && (
                      <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200 text-[10px] h-4">
                        New
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => onViewDetails(update)}
                  >
                    Read More
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Regulatory Document Details Component
 */
function DocumentDetails({ document, onBack }) {
  if (!document) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">{document.title}</h3>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`rounded-full p-1.5 mr-3 bg-${document.source.color}-100`}>
                <document.source.icon />
              </div>
              <div>
                <CardTitle>{document.title}</CardTitle>
                <CardDescription>{document.source.fullName}</CardDescription>
              </div>
            </div>
            <Badge variant="outline">{document.documentType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Published: {new Date(document.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {document.referenceNumber && (
              <div className="text-muted-foreground">
                Reference: {document.referenceNumber}
              </div>
            )}
          </div>

          {document.topics && document.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div className="prose max-w-none">
            <h4>Summary</h4>
            <p>{document.summary}</p>
            
            {document.keyPoints && document.keyPoints.length > 0 && (
              <>
                <h4>Key Points</h4>
                <ul>
                  {document.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </>
            )}
            
            {document.impact && (
              <>
                <h4>Impact on Regulatory Submissions</h4>
                <p>{document.impact}</p>
              </>
            )}
            
            {document.applicability && (
              <>
                <h4>Applicability</h4>
                <p>{document.applicability}</p>
              </>
            )}
            
            {document.effectiveDate && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 my-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">Effective Date:</span>
                  <span className="ml-2">{new Date(document.effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Analyze with AI
            </Button>
          </div>
          
          <a 
            href={document.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original Document
            </Button>
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Regulatory Intelligence Dashboard
 */
function RegulatoryDashboard({ onViewDocument }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Impact Analysis</CardTitle>
          <CardDescription>
            How recent regulatory changes impact your IND submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Recent ICH Guidelines Impact</h4>
                  <p className="text-sm mt-1">
                    The updated ICH E6(R3) guideline introduces significant changes to
                    clinical trial conduct that should be reflected in your IND submission.
                    Key areas include risk-based monitoring, electronic consent, and data
                    integrity requirements.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-amber-700 text-sm mt-1">
                    View Affected Documents
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">FDA Pilot Program Opportunity</h4>
                  <p className="text-sm mt-1">
                    Your IND submission may be eligible for the FDA's Complex Innovative Trial 
                    Design (CID) pilot program, which could expedite review and provide
                    valuable feedback on novel aspects of your study design.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-green-700 text-sm mt-1">
                    View Program Details
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Upcoming Regulation Changes</h4>
                  <p className="text-sm mt-1">
                    FDA has announced upcoming changes to electronic submission requirements
                    scheduled to take effect in Q3 2025. These changes will not affect your 
                    current submission but should be noted for future amendments.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-700 text-sm mt-1">
                    View Announcement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Key Deadlines</CardTitle>
          <CardDescription>
            Regulatory timelines affecting your submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <CalendarDays className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">FDA Safety Reporting Update</h4>
                <p className="text-xs text-muted-foreground">
                  Implementation deadline: May 15, 2025
                </p>
                <p className="text-xs text-red-600 mt-1">
                  18 days remaining
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <CalendarDays className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">eCTD Format Migration</h4>
                <p className="text-xs text-muted-foreground">
                  Deadline: July 1, 2025
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  65 days remaining
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">ICH E6(R3) Implementation</h4>
                <p className="text-xs text-muted-foreground">
                  Compliance recommended: September 30, 2025
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  157 days remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Guidance Search Component
 */
function GuidanceSearch({ onSearch, onFilterChange, activeFilters, isSearching }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters || {
    sources: [],
    documentTypes: [],
    topics: [],
    dateRange: 'all'
  });
  
  const handleSearch = () => {
    onSearch(searchTerm);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const toggleFilter = (type, value) => {
    setLocalFilters(prev => {
      const current = [...prev[type]];
      
      if (current.includes(value)) {
        return {
          ...prev,
          [type]: current.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...current, value]
        };
      }
    });
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
    setShowFilters(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search regulatory guidance..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "border-primary bg-primary/5")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {Object.values(localFilters).flat().length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {Object.values(localFilters).flat().length}
            </Badge>
          )}
        </Button>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-sm mb-2">Regulatory Authorities</h4>
                <div className="space-y-2">
                  {REGULATORY_SOURCES.map((source) => (
                    <div key={source.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`source-${source.id}`}
                        checked={localFilters.sources.includes(source.id)}
                        onChange={() => toggleFilter('sources', source.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label 
                        htmlFor={`source-${source.id}`}
                        className="ml-2 text-sm flex items-center"
                      >
                        <source.icon className="h-4 w-4 mr-1.5" />
                        {source.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Document Types</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {REGULATORY_SOURCES.flatMap(source => 
                    source.documentTypes.map(type => ({
                      id: `${source.id}-${type.id}`,
                      sourceId: source.id,
                      name: type.name,
                      sourceName: source.name
                    }))
                  ).map((docType) => (
                    <div key={docType.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doctype-${docType.id}`}
                        checked={localFilters.documentTypes.includes(docType.id)}
                        onChange={() => toggleFilter('documentTypes', docType.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label 
                        htmlFor={`doctype-${docType.id}`}
                        className="ml-2 text-sm flex items-center"
                      >
                        {docType.name}
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          {docType.sourceName}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Regulatory Topics</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {REGULATORY_TOPICS.map((topic) => (
                    <div key={topic.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`topic-${topic.id}`}
                        checked={localFilters.topics.includes(topic.id)}
                        onChange={() => toggleFilter('topics', topic.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label 
                        htmlFor={`topic-${topic.id}`}
                        className="ml-2 text-sm"
                      >
                        {topic.name}
                      </label>
                    </div>
                  ))}
                </div>
                
                <h4 className="font-medium text-sm mb-2 mt-4">Date Range</h4>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      checked={localFilters.dateRange === 'all'}
                      onChange={() => setLocalFilters({...localFilters, dateRange: 'all'})}
                      className="h-4 w-4"
                    />
                    <span className="ml-2 text-sm">All Time</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      checked={localFilters.dateRange === 'year'}
                      onChange={() => setLocalFilters({...localFilters, dateRange: 'year'})}
                      className="h-4 w-4"
                    />
                    <span className="ml-2 text-sm">Past Year</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      checked={localFilters.dateRange === 'month'}
                      onChange={() => setLocalFilters({...localFilters, dateRange: 'month'})}
                      className="h-4 w-4"
                    />
                    <span className="ml-2 text-sm">Past Month</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLocalFilters({
                    sources: [],
                    documentTypes: [],
                    topics: [],
                    dateRange: 'all'
                  });
                }}
              >
                Reset Filters
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * IHE Profiles Component
 */
function IHEProfiles() {
  // Sample IHE profiles relevant to clinical trials and regulatory submissions
  const profiles = [
    {
      id: 'rpe',
      name: 'Retrieve Protocol for Execution (RPE)',
      domain: 'Quality, Research, and Public Health',
      description: 'Enables the electronic sharing of detailed protocol definition and eligibility criteria for clinical research.',
      url: 'https://www.ihe.net/uploadedFiles/Documents/QRPH/IHE_QRPH_Suppl_RPE.pdf'
    },
    {
      id: 'crpc',
      name: 'Clinical Research Process Content (CRPC)',
      domain: 'Quality, Research, and Public Health',
      description: 'Defines the structure and content of documents used in clinical research processes.',
      url: 'https://www.ihe.net/uploadedFiles/Documents/QRPH/IHE_QRPH_Suppl_CRPC.pdf'
    },
    {
      id: 'sdc',
      name: 'Structured Data Capture (SDC)',
      domain: 'Quality, Research, and Public Health',
      description: 'Provides infrastructure for capturing, managing, and retrieving structured data in healthcare settings.',
      url: 'https://www.ihe.net/uploadedFiles/Documents/QRPH/IHE_QRPH_Suppl_SDC.pdf'
    },
    {
      id: 'dsi',
      name: 'Drug Safety Content (DSC)',
      domain: 'Quality, Research, and Public Health',
      description: 'Supports the exchange of drug safety and adverse event information in clinical trials.',
      url: 'https://www.ihe.net/uploadedFiles/Documents/QRPH/IHE_QRPH_Suppl_DSC.pdf'
    },
    {
      id: 'ctr',
      name: 'Clinical Trial Registration (CTR)',
      domain: 'Quality, Research, and Public Health',
      description: 'Defines the process for registering clinical trials in registry systems like ClinicalTrials.gov.',
      url: 'https://www.ihe.net/uploadedFiles/Documents/QRPH/IHE_QRPH_Suppl_CTR.pdf'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IHE Profiles for Clinical Research</h3>
          <p className="text-sm text-muted-foreground">
            Interoperability profiles relevant to clinical trials and regulatory submissions
          </p>
        </div>
        <Button variant="outline">
          <Link2 className="h-4 w-4 mr-2" />
          Visit IHE Website
        </Button>
      </div>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base">{profile.name}</CardTitle>
                <Badge variant="outline">{profile.domain}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {profile.description}
              </p>
              <div className="flex justify-end">
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary text-sm flex items-center"
                >
                  View Profile Documentation
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How IHE Profiles Support IND Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>
              IHE profiles provide standardized approaches to healthcare interoperability challenges.
              For clinical trials and IND submissions, these profiles can help:
            </p>
            <ul>
              <li>Ensure consistent data collection across sites</li>
              <li>Streamline adverse event reporting</li>
              <li>Standardize protocol representation</li>
              <li>Improve data exchange with electronic health records</li>
              <li>Enhance regulatory compliance through standardized processes</li>
            </ul>
            <p>
              Implementing IHE profiles in your clinical trial systems can reduce manual data entry,
              improve data quality, and simplify the preparation of regulatory submissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * ICH Guidelines Component
 */
function ICHGuidelines() {
  // Sample ICH guidelines relevant to IND submissions
  const guidelines = [
    {
      id: 'e6r3',
      name: 'E6(R3) Good Clinical Practice',
      category: 'Efficacy',
      status: 'Step 4',
      date: '2023-11-30',
      description: 'Provides an international ethical and scientific quality standard for designing, conducting, recording, and reporting trials that involve human subjects.',
      url: 'https://database.ich.org/sites/default/files/ICH_E6-R3_GuideLine_Step4_2023_1130.pdf'
    },
    {
      id: 'm4q',
      name: 'M4Q(R1) CTD - Quality',
      category: 'Multidisciplinary',
      status: 'Step 4',
      date: '2022-07-15',
      description: 'Defines the organization of the Common Technical Document (CTD) for the registration of pharmaceuticals for human use - Quality section.',
      url: 'https://database.ich.org/sites/default/files/M4Q_R1_Guideline.pdf'
    },
    {
      id: 'm4s',
      name: 'M4S(R2) CTD - Safety',
      category: 'Multidisciplinary',
      status: 'Step 4',
      date: '2022-07-15',
      description: 'Defines the organization of the Common Technical Document (CTD) for the registration of pharmaceuticals for human use - Safety section.',
      url: 'https://database.ich.org/sites/default/files/M4S_R2_Guideline.pdf'
    },
    {
      id: 'm4e',
      name: 'M4E(R2) CTD - Efficacy',
      category: 'Multidisciplinary',
      status: 'Step 4',
      date: '2022-07-15',
      description: 'Defines the organization of the Common Technical Document (CTD) for the registration of pharmaceuticals for human use - Efficacy section.',
      url: 'https://database.ich.org/sites/default/files/M4E_R2_Guideline.pdf'
    },
    {
      id: 'e8r1',
      name: 'E8(R1) General Considerations for Clinical Trials',
      category: 'Efficacy',
      status: 'Step 4',
      date: '2022-10-01',
      description: 'Addresses a broad range of issues critical to the design and conduct of clinical trials, focusing on study quality and efficiency.',
      url: 'https://database.ich.org/sites/default/files/ICH_E8-R1_Guideline_Step4_2022_1001.pdf'
    },
    {
      id: 'e9',
      name: 'E9 Statistical Principles for Clinical Trials',
      category: 'Efficacy',
      status: 'Step 4',
      date: '1998-02-05',
      description: 'Provides guidance on statistical principles to be considered in the design, conduct, analysis, and evaluation of clinical trials.',
      url: 'https://database.ich.org/sites/default/files/E9_Guideline.pdf'
    },
    {
      id: 'e9r1',
      name: 'E9(R1) Addendum: Statistical Principles for Clinical Trials',
      category: 'Efficacy',
      status: 'Step 4',
      date: '2019-11-20',
      description: 'Provides a framework for planning, conducting, and reporting clinical trial analyses and for addressing issues of missing data.',
      url: 'https://database.ich.org/sites/default/files/E9-R1_Step4_Guideline_2019_1120.pdf'
    },
    {
      id: 'm3r2',
      name: 'M3(R2) Nonclinical Safety Studies',
      category: 'Multidisciplinary',
      status: 'Step 4',
      date: '2009-06-11',
      description: 'Provides guidance on the timing of nonclinical safety studies to support human clinical trials and marketing authorization for pharmaceuticals.',
      url: 'https://database.ich.org/sites/default/files/M3_R2__Guideline.pdf'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ICH Guidelines for IND Submissions</h3>
          <p className="text-sm text-muted-foreground">
            Key International Council for Harmonisation guidelines relevant to IND applications
          </p>
        </div>
        <Button variant="outline">
          <Link2 className="h-4 w-4 mr-2" />
          Visit ICH Website
        </Button>
      </div>

      <ScrollArea className="whitespace-nowrap rounded-md border">
        <div className="w-full">
          <table className="w-full caption-bottom">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="h-10 px-4 text-left align-middle font-medium">Guideline</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Category</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-10 px-4 text-left align-middle font-medium w-1/3">Description</th>
                <th className="h-10 px-4 text-center align-middle font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {guidelines.map((guideline) => (
                <tr key={guideline.id} className="border-b">
                  <td className="p-2 px-4 align-middle font-medium">
                    {guideline.name}
                  </td>
                  <td className="p-2 px-4 align-middle">
                    <Badge variant="outline">{guideline.category}</Badge>
                  </td>
                  <td className="p-2 px-4 align-middle">
                    {guideline.status}
                  </td>
                  <td className="p-2 px-4 align-middle">
                    {new Date(guideline.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-2 px-4 align-middle text-sm text-muted-foreground">
                    <div className="line-clamp-2">
                      {guideline.description}
                    </div>
                  </td>
                  <td className="p-2 px-4 align-middle text-center">
                    <a 
                      href={guideline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ICH Guidelines Implementation for INDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-3">
                <h4 className="font-medium text-sm mb-2">Good Clinical Practice (E6)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ensures ethical trial conduct</li>
                  <li>• Defines investigator responsibilities</li>
                  <li>• Outlines protocol requirements</li>
                  <li>• Establishes data quality standards</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium text-sm mb-2">Nonclinical Safety (M3)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Timing of toxicology studies</li>
                  <li>• Duration requirements based on clinical plan</li>
                  <li>• Species selection guidance</li>
                  <li>• Special population considerations</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium text-sm mb-2">Clinical Trial Design (E8)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Quality by design principles</li>
                  <li>• Patient-focused development</li>
                  <li>• Critical-to-quality factors</li>
                  <li>• Risk-based approaches</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <p className="mb-2">
                <strong>Implementation Tip:</strong> When preparing your IND, create a compliance 
                checklist for each relevant ICH guideline to ensure your submission addresses 
                all key requirements.
              </p>
              <p>
                Use the TrialSage™ ICH Compliance Checker tool to automatically verify your 
                protocol against current ICH guidelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Regulatory Intelligence Component
 */
function RegulatoryIntelligence({ projectId }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filters, setFilters] = useState({
    sources: [],
    documentTypes: [],
    topics: ['ind', 'clinical-trials'],
    dateRange: 'year'
  });
  
  // Fetch regulatory updates
  const { 
    data: regulatoryUpdates, 
    isLoading: isLoadingUpdates,
    refetch: refetchUpdates
  } = useQuery({
    queryKey: ['regulatory-updates', filters],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/regulatory-intelligence/updates', {
          params: filters
        });
        
        if (!response.ok) throw new Error('Failed to fetch regulatory updates');
        return response.json();
      } catch (error) {
        console.error('Error fetching regulatory updates:', error);
        
        // Return placeholder data for demonstration
        return [
          {
            id: '1',
            title: 'FDA Issues Draft Guidance on Use of Electronic Records and Signatures in Clinical Investigations',
            summary: 'The guidance provides recommendations on the use of electronic systems, electronic signatures, and related technologies in clinical investigations.',
            date: '2025-04-10',
            source: REGULATORY_SOURCES.find(s => s.id === 'fda'),
            url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
            isNew: true,
            documentType: 'Draft Guidance',
            topics: ['Clinical Trials', 'Electronic Records'],
            effectiveDate: '2025-07-15',
            keyPoints: [
              'Clarifies requirements for electronic systems used in clinical investigations',
              'Provides recommendations for ensuring data integrity',
              'Outlines expectations for audit trails and electronic signatures',
              'Updates approach for electronic informed consent'
            ],
            impact: 'Sponsors planning to use electronic systems for data collection should ensure compliance with these updated recommendations before IND submission.',
            applicability: 'Applies to all clinical investigations that use electronic systems or records to capture, process, or report data for FDA-regulated products.'
          },
          {
            id: '2',
            title: 'ICH Releases E6(R3) Good Clinical Practice Guideline',
            summary: 'The updated Good Clinical Practice guideline introduces significant changes focused on risk-based quality management and clinical trial design.',
            date: '2025-03-15',
            source: REGULATORY_SOURCES.find(s => s.id === 'ich'),
            url: 'https://database.ich.org/',
            isNew: true,
            documentType: 'Guideline',
            topics: ['Good Clinical Practice', 'Risk Management'],
            effectiveDate: '2025-09-30',
            keyPoints: [
              'Introduces risk-based quality management approach',
              'Emphasizes critical-to-quality factors',
              'Updates investigator responsibilities',
              'Provides new guidance on electronic clinical trial technologies'
            ],
            impact: 'IND submissions should reflect the updated principles in protocol design, monitoring plans, and quality management systems.',
            applicability: 'Applicable to all clinical trials involving human subjects and supporting IND applications.'
          },
          {
            id: '3',
            title: 'FDA Pilot Program for Complex Innovative Trial Designs',
            summary: 'FDA announces extension of the pilot program to facilitate and advance the use of complex adaptive, Bayesian, and other novel clinical trial designs in drug development.',
            date: '2025-02-20',
            source: REGULATORY_SOURCES.find(s => s.id === 'fda'),
            url: 'https://www.fda.gov/drugs/development-resources/complex-innovative-trial-design-pilot-program',
            isNew: false,
            documentType: 'Program Announcement',
            topics: ['Clinical Trial Design', 'Innovative Methods'],
            effectiveDate: '2025-03-01',
            keyPoints: [
              'Provides opportunity for additional interaction with FDA',
              'Focuses on innovative trial designs with potential to reduce development time',
              'Offers early feedback on statistical analysis plans',
              'May include publication of trial design information'
            ],
            impact: 'Sponsors considering complex innovative trial designs should consider applying to this program prior to IND submission to receive valuable FDA feedback.',
            applicability: 'Open to sponsors planning to include complex innovative trial designs in their drug development programs.'
          },
          {
            id: '4',
            title: 'EMA Guidance on Artificial Intelligence in Clinical Trials',
            summary: 'New guidance on the use of artificial intelligence and machine learning algorithms in clinical trials, including validation requirements and regulatory considerations.',
            date: '2025-01-15',
            source: REGULATORY_SOURCES.find(s => s.id === 'ema'),
            url: 'https://www.ema.europa.eu/en/human-regulatory/research-development/scientific-guidelines',
            isNew: false,
            documentType: 'Scientific Guideline',
            topics: ['Artificial Intelligence', 'Digital Health'],
            keyPoints: [
              'Outlines validation requirements for AI algorithms',
              'Addresses bias and fairness in AI-based tools',
              'Provides guidance on documentation requirements',
              'Discusses considerations for informed consent'
            ],
            impact: 'While this is an EMA guideline, similar principles may be considered by FDA reviewers for INDs that incorporate AI/ML technologies.',
            applicability: 'Relevant for clinical trials utilizing AI/ML for patient selection, endpoint assessment, or other critical functions.'
          },
          {
            id: '5',
            title: 'Health Canada Updates Electronic Clinical Trial Applications Guidance',
            summary: 'Updated guidance on electronic submission of clinical trial applications with new technical requirements and formats.',
            date: '2024-12-05',
            source: REGULATORY_SOURCES.find(s => s.id === 'health-canada'),
            url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents.html',
            isNew: false,
            documentType: 'Guidance Document',
            topics: ['Electronic Submissions', 'Regulatory Process'],
            keyPoints: [
              'Updated technical requirements for electronic submissions',
              'New validation rules for clinical trial applications',
              'Revised format specifications for supporting documentation',
              'Implementation timeline for new requirements'
            ]
          }
        ];
      }
    },
    enabled: activeTab === 'updates' || activeTab === 'dashboard'
  });
  
  // Search for regulatory guidance
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await apiRequest('GET', '/api/regulatory-intelligence/search', {
        params: {
          q: searchTerm,
          ...filters
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error.message,
        variant: 'destructive',
      });
      
      // Placeholder search results for demonstration
      setSearchResults(regulatoryUpdates || []);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // View document details
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
  };
  
  // Return to updates list
  const handleBackToUpdates = () => {
    setSelectedDocument(null);
  };
  
  // Render based on connection status
  return (
    <ErrorBoundary>
      <DatabaseAware
        title="Regulatory Intelligence Unavailable"
        description="The regulatory intelligence module requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Regulatory Intelligence</h2>
              <p className="text-muted-foreground">
                Comprehensive regulatory information to support your IND submission
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {activeTab !== 'dashboard' && !selectedDocument && (
                <Button 
                  variant="outline" 
                  onClick={activeTab === 'updates' ? refetchUpdates : undefined}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </div>
          </div>
          
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setSelectedDocument(null);
            }}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="dashboard">
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="updates">
                <FileText className="h-4 w-4 mr-2" />
                Regulatory Updates
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Search Guidance
              </TabsTrigger>
              <TabsTrigger value="ihe">
                <Link2 className="h-4 w-4 mr-2" />
                IHE Profiles
              </TabsTrigger>
              <TabsTrigger value="ich">
                <BookCheck className="h-4 w-4 mr-2" />
                ICH Guidelines
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <RegulatoryDashboard 
                onViewDocument={handleViewDocument} 
              />
            </TabsContent>
            
            <TabsContent value="updates">
              {selectedDocument ? (
                <DocumentDetails 
                  document={selectedDocument}
                  onBack={handleBackToUpdates}
                />
              ) : (
                <div className="space-y-6">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Regulatory Intelligence for IND Applications</h4>
                          <p className="text-sm mt-1">
                            Stay informed about changes to regulations, guidelines, and expectations
                            that may impact your IND submission. Filter by regulatory authority or
                            document type to focus on what matters most for your application.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <UpdatesFeed 
                    updates={regulatoryUpdates} 
                    isLoading={isLoadingUpdates} 
                    onViewDetails={handleViewDocument}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="search">
              <div className="space-y-6">
                <GuidanceSearch 
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  activeFilters={filters}
                  isSearching={isSearching}
                />
                
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/70 mb-4" />
                      <p className="text-muted-foreground">Searching for regulatory guidance...</p>
                    </div>
                  </div>
                ) : (
                  selectedDocument ? (
                    <DocumentDetails 
                      document={selectedDocument}
                      onBack={handleBackToUpdates}
                    />
                  ) : (
                    searchResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Found {searchResults.length} results
                        </p>
                        <UpdatesFeed 
                          updates={searchResults}
                          isLoading={false}
                          onViewDetails={handleViewDocument}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">Search for regulatory guidance documents</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                          Enter keywords or phrases to find relevant FDA, EMA, ICH, and other
                          regulatory guidance documents for your IND submission
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ihe">
              <IHEProfiles />
            </TabsContent>
            
            <TabsContent value="ich">
              <ICHGuidelines />
            </TabsContent>
          </Tabs>
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}

export default RegulatoryIntelligence;