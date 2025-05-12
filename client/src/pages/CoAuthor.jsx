/**
 * !!!!! IMPORTANT - OFFICIAL eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This is the ONE AND ONLY official implementation of the eCTD Co-Author Module
 * 
 * Version: 5.2.0 - May 12, 2025
 * Status: STABLE - GOOGLE DOCS INTEGRATION ACTIVE - STRUCTURED CONTENT BLOCKS ENABLED
 * 
 * Features:
 * - Enhanced structured content blocks with ICH-compliant validation rules
 * - CTD structure navigation with section-specific badges
 * - Reusable "content atoms" (tables, narratives, figures) for document templates
 * - Document validation dashboard with regulatory compliance scoring
 * 
 * Any attempt to create duplicate modules or alternate implementations
 * should be prevented. This is the golden source implementation.
 */

import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

// TipTap editor imports 
// (These will be used once packages are installed, include them now for preparation)
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';

// Import Google Docs services
import * as googleDocsService from '../services/googleDocsService';
import * as googleAuthService from '../services/googleAuthService';
import * as copilotService from '../services/copilotService';

// AI services
import * as aiService from '../services/aiService';

// Import the components with lazy loading for better performance
const EnhancedDocumentEditor = lazy(() => import('../components/EnhancedDocumentEditor'));
const Office365WordEmbed = lazy(() => import('../components/Office365WordEmbed'));
const GoogleDocsEmbed = lazy(() => import('../components/GoogleDocsEmbed'));
import { 
  FileText, 
  Edit, 
  Search, 
  LayoutTemplate, 
  FolderOpen, 
  CheckCircle, 
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Table,
  BarChart3,
  Plus,
  Loader2,
  ExternalLink,
  FilePlus2,
  Upload,
  Download,
  History,
  Share2,
  Database,
  BarChart,
  AlertCircle,
  Clock,
  GitMerge,
  GitBranch,
  Minus,
  Info,
  UserCheck,
  RefreshCw,
  Save,
  Lock,
  Users,
  ClipboardCheck,
  FileCheck,
  Link,
  BookOpen,
  ArrowUpRight,
  Filter,
  CheckSquare,
  FileWarning,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Check,
  X,
  Settings,
  ListChecks,
  Bot,
  Clipboard,
  Zap,
  Send
} from 'lucide-react';

// Custom Google icon component
const GoogleIcon = ({ className }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
  >
    <path 
      fill="currentColor" 
      d="M12.545 12.151c0 .269-.025.533-.074.79h-5.34v-1.572h3.054a2.615 2.615 0 0 0-1.131-1.71 3.23 3.23 0 0 0-1.923-.562 3.295 3.295 0 0 0-3.054 2.121 3.337 3.337 0 0 0 0 2.58 3.295 3.295 0 0 0 3.054 2.121 3.13 3.13 0 0 0 1.875-.562c.516-.37.908-.882 1.131-1.467h.098L12.545 15c-.369.703-.934 1.3-1.642 1.731a4.449 4.449 0 0 1-4.615-.393 4.593 4.593 0 0 1-1.679-2.95 4.64 4.64 0 0 1 .98-3.95 4.407 4.407 0 0 1 3.225-1.462c1.113 0 2.184.41 3.01 1.156a4.176 4.176 0 0 1 1.423 2.983v.036Zm7.842-2.954v1.566h-1.887v1.887h-1.566v-1.887h-1.887v-1.566h1.887V7.31h1.566v1.887h1.887Z" 
    />
  </svg>
);

export default function CoAuthor() {
  // Component state
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeVersion, setActiveVersion] = useState('v4.0');
  const [compareVersions, setCompareVersions] = useState({ base: 'v4.0', compare: 'v3.2' });
  const [teamCollabOpen, setTeamCollabOpen] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  // Document editor integration state
  const [msWordPopupOpen, setMsWordPopupOpen] = useState(false);
  const [msWordAvailable, setMsWordAvailable] = useState(true); // Set to true for demo
  const [googleDocsPopupOpen, setGoogleDocsPopupOpen] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [editorType, setEditorType] = useState('google'); // Changed default to 'google'
  // AI Assistant state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantMode, setAiAssistantMode] = useState('suggestions'); // 'suggestions', 'compliance', 'formatting'
  const [aiUserQuery, setAiUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  // Structured Content Blocks state
  const [newDocumentDialogOpen, setNewDocumentDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contentAtoms, setContentAtoms] = useState([]);
  const [isLoadingAtoms, setIsLoadingAtoms] = useState(false);
  const [selectedContentAtom, setSelectedContentAtom] = useState(null);
  const [atomRegionFilter, setAtomRegionFilter] = useState('US');
  const [selectedContentBlocks, setSelectedContentBlocks] = useState([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentModule, setDocumentModule] = useState('');
  
  const { toast } = useToast();
  
  // Check Google authentication on component mount
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        setAuthLoading(true);
        const isAuthenticated = googleAuthService.isGoogleAuthenticated();
        setIsGoogleAuthenticated(isAuthenticated);
        
        if (isAuthenticated) {
          setGoogleUserInfo(googleAuthService.getCurrentUser());
          console.log('User is authenticated with Google');
        } else {
          console.log('User is not authenticated with Google');
        }
      } catch (error) {
        console.error('Error checking Google authentication:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkGoogleAuth();
  }, []);
  
  const [validationResults] = useState({
    completeness: 78,
    consistency: 92,
    references: 65,
    regulatory: 87,
    issues: [
      {
        id: 1,
        severity: 'critical',
        section: '2.5.4',
        description: 'Missing source citations for efficacy claims',
        suggestion: 'Add references to support the primary endpoint efficacy claims'
      },
      {
        id: 2,
        severity: 'major',
        section: '2.5.6',
        description: 'Incomplete benefit-risk assessment',
        suggestion: 'Expand the benefit-risk section to include analysis of secondary endpoints'
      },
      {
        id: 3,
        severity: 'minor',
        section: '2.5.2',
        description: 'Inconsistent product name usage',
        suggestion: 'Standardize product name as "Drug X" throughout the document'
      },
      {
        id: 4,
        severity: 'info',
        section: '2.5.1',
        description: 'FDA guidance updated since last edit',
        suggestion: 'Review latest FDA guidance on clinical overview format'
      }
    ]
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeTrackChanges: false,
    includeCoverPage: true,
    includeTableOfContents: true,
    includeAppendices: true
  });
  
  // AI query submission handler
  const handleAiQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!aiUserQuery.trim()) return;
    
    setAiIsLoading(true);
    setAiError(null);
    
    try {
      // Determine which AI service to call based on active mode
      let response;
      if (aiAssistantMode === 'compliance') {
        response = await aiService.checkComplianceAI(
          selectedDocument?.id || 'current-doc',
          "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
          ['ICH', 'FDA']
        );
      } else if (aiAssistantMode === 'formatting') {
        response = await aiService.analyzeFormattingAI(
          selectedDocument?.id || 'current-doc',
          "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
          'clinicalOverview'
        );
      } else {
        // Default mode: suggestions
        if (selectedDocument) {
          response = await aiService.generateContentSuggestions(
            selectedDocument.id || 'current-doc', 
            '2.5.5', 
            "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
            aiUserQuery
          );
        } else {
          // If no document is selected, use the general AI ask endpoint
          response = await aiService.askDocumentAI(aiUserQuery);
        }
      }
      
      setAiResponse(response);
      setAiUserQuery('');
      
      // Show success toast
      toast({
        title: "AI Response Generated",
        description: "The AI has generated a response based on your query.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiError(error.message || 'Failed to get AI response. Please try again.');
      
      // Show error toast
      toast({
        title: "AI Request Failed",
        description: error.message || "Could not generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiIsLoading(false);
    }
  };
  
  // Mock AI suggestions (will be replaced by actual AI responses)
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 1,
      type: 'completion',
      text: 'The safety profile is consistent with other drugs in this class...',
      section: '2.5.5',
      accepted: false
    },
    {
      id: 2,
      type: 'formatting',
      text: 'Table formatting for efficacy data does not meet ICH guidelines. Suggested template available.',
      section: '2.5.4.2',
      accepted: false
    },
    {
      id: 3,
      type: 'compliance',
      text: 'Missing Integrated Summary of Benefits and Risks required by FDA guidance.',
      section: '2.5.6',
      accepted: false
    }
  ]);
  
  // Version history mock data - in real implementation this would come from the Vault API
  const [versionHistory] = useState([
    { 
      id: 'v4.0', 
      name: 'Version 4.0', 
      date: 'May 11, 2025', 
      author: 'John Doe', 
      changes: 'Updated clinical endpoints in Module 2.5',
      commitHash: '8f7e6d5c4b3a2',
      status: 'Current'
    },
    { 
      id: 'v3.2', 
      name: 'Version 3.2', 
      date: 'April 28, 2025', 
      author: 'Jane Smith', 
      changes: 'Fixed formatting issues in Module 3',
      commitHash: '7a6b5c4d3e2f1',
      status: 'Previous'
    },
    { 
      id: 'v3.1', 
      name: 'Version 3.1', 
      date: 'April 25, 2025', 
      author: 'Sarah Williams', 
      changes: 'Updated regulatory citations in Module 1.3',
      commitHash: '6f5e4d3c2b1a9',
      status: 'Previous'
    },
    { 
      id: 'v3.0', 
      name: 'Version 3.0', 
      date: 'April 22, 2025', 
      author: 'John Doe', 
      changes: 'Major revision with updated clinical data',
      commitHash: '5e4d3c2b1a987',
      status: 'Previous'
    },
    { 
      id: 'v2.5', 
      name: 'Version 2.5', 
      date: 'April 15, 2025', 
      author: 'Emily Chen', 
      changes: 'Addressed regulatory feedback on Module 5',
      commitHash: '4d3c2b1a9876',
      status: 'Previous'
    }
  ]);

  // Mock documents data
  const [documents] = useState([
    { 
      id: 1, 
      title: 'Module 2.5 Clinical Overview', 
      module: 'Module 2',
      lastEdited: '2 hours ago',
      editedBy: 'John Doe',
      status: 'In Progress',
      version: 'v4.0',
      reviewers: ['Emily Chen', 'David Kim']
    },
    { 
      id: 2, 
      title: 'CMC Section 3.2.P', 
      module: 'Module 3',
      lastEdited: '1 day ago',
      editedBy: 'Mark Wilson',
      status: 'Draft',
      version: 'v1.4',
      reviewers: []
    },
    { 
      id: 3, 
      title: 'Clinical Overview', 
      module: 'Module 2',
      lastEdited: '3 days ago',
      editedBy: 'Jane Smith',
      status: 'Final',
      version: 'v3.0',
      reviewers: ['Robert Johnson', 'Emily Chen', 'David Kim']
    },
    { 
      id: 4, 
      title: 'Module 1.2 Application Form', 
      module: 'Module 1',
      lastEdited: '5 days ago',
      editedBy: 'Sarah Williams',
      status: 'In Review',
      version: 'v2.1',
      reviewers: ['John Doe', 'Mark Wilson']
    },
    { 
      id: 5, 
      title: 'Module 5.3.5 Integrated Summary of Efficacy', 
      module: 'Module 5',
      lastEdited: '1 week ago',
      editedBy: 'Emily Chen',
      status: 'Draft',
      version: 'v1.8',
      reviewers: []
    },
    { 
      id: 6, 
      title: 'Module 4.2.1 Pharmacology Study Reports', 
      module: 'Module 4',
      lastEdited: '2 weeks ago',
      editedBy: 'David Kim',
      status: 'Final',
      version: 'v2.0',
      reviewers: ['Jane Smith', 'Emily Chen']
    }
  ]);

  // Enhanced Structured Content Blocks - Content Atoms Registry with ICH-compliant validation rules
  // Content Atom Interface - matches database schema
  /*
   * ContentAtom {
   *   atom_id: number,
   *   region: string,         // 'US','EU','CA','JP','CN','AU','GLOBAL'
   *   module: number,         // 1–5
   *   section_code: string,   // '2.5','3.2.P'…
   *   type: string,           // 'narrative','table','figure'
   *   schema_json: Object,    // JSON Schema for this atom
   *   ui_config: Object,      // How to render/edit (labels, placeholders)
   *   created_by: number,     // References Users(user_id)
   *   created_at: Date        // Timestamp
   * }
   */

  // ContentAtom API functions - integrates with backend/routes/atoms.js
  
  // Function to fetch content atoms from API
  const fetchContentAtoms = async (filters = {}) => {
    try {
      setIsLoadingAtoms(true);
      
      // In a production implementation, we call the actual backend API
      // with proper query params for filtering
      const queryParams = new URLSearchParams();
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.module) queryParams.append('module', filters.module);
      if (filters.section) queryParams.append('section', filters.section);
      
      try {
        const response = await fetch(`/api/atoms?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setContentAtoms(data);
          return;
        }
      } catch (error) {
        console.log("Backend API not available, using mock data:", error);
      }
      
      // For development, we'll use the registry in the component
      let atomsFromRegistry = [
        ...contentBlockRegistry.tables.map(table => ({
          atom_id: parseInt(table.id.split('-')[1]),
          region: table.regions[0] || 'GLOBAL',
          module: parseInt(table.moduleId.replace('module', '')),
          section_code: table.section,
          type: 'table',
          schema_json: table.schema,
          ui_config: { template: table.template },
          created_by: 1,
          created_at: new Date()
        })),
        ...contentBlockRegistry.narratives.map(narrative => ({
          atom_id: parseInt(narrative.id.split('-')[1]),
          region: narrative.regions[0] || 'GLOBAL',
          module: parseInt(narrative.moduleId.replace('module', '')),
          section_code: narrative.section,
          type: 'narrative',
          schema_json: narrative.schema,
          ui_config: { template: narrative.template },
          created_by: 1,
          created_at: new Date()
        })),
        ...contentBlockRegistry.figures.map(figure => ({
          atom_id: parseInt(figure.id.split('-')[1]),
          region: figure.regions[0] || 'GLOBAL',
          module: parseInt(figure.moduleId.replace('module', '')),
          section_code: figure.section,
          type: 'figure',
          schema_json: figure.schema,
          ui_config: { template: figure.template },
          created_by: 1,
          created_at: new Date()
        }))
      ];
      
      setContentAtoms(atomsFromRegistry);
    } catch (error) {
      console.error("Error fetching content atoms:", error);
    } finally {
      setIsLoadingAtoms(false);
    }
  };

  // Load content atoms on component mount
  useEffect(() => {
    fetchContentAtoms();
  }, []);

  // Create a new content atom (Admin only)
  const createContentAtom = async (atomData) => {
    try {
      const response = await fetch('/api/atoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(atomData)
      });
      
      if (!response.ok) {
        throw new Error(`Error creating content atom: ${response.statusText}`);
      }
      
      const newAtom = await response.json();
      // Add the new atom to the state
      setContentAtoms(prevAtoms => [...prevAtoms, newAtom]);
      return newAtom;
    } catch (error) {
      console.error("Error creating content atom:", error);
      throw error;
    }
  };

  // Filter content atoms by criteria
  const filterContentAtoms = (criteria) => {
    if (!contentAtoms.length) return [];
    
    return contentAtoms.filter(atom => {
      if (criteria.region && atom.region !== criteria.region) return false;
      if (criteria.module && atom.module !== criteria.module) return false;
      if (criteria.section && !atom.section_code.startsWith(criteria.section)) return false;
      if (criteria.type && atom.type !== criteria.type) return false;
      return true;
    });
  };

  const contentBlockRegistry = {
    // Table blocks - discrete, reusable content atoms with metadata
    tables: [
      {
        id: 'table-2-5-1',
        name: 'Clinical Study Overview Table',
        type: 'table',
        moduleId: 'module2',
        section: '2.5',
        description: 'Standardized table for presenting clinical study overview data in Module 2.5',
        schema: {
          columns: ['Study ID', 'Study Design', 'Population', 'Treatment', 'Endpoints', 'Results'],
          rules: {
            required: ['Study ID', 'Study Design', 'Endpoints'],
            validation: {
              'Study ID': {
                pattern: /^[A-Z0-9\-]+$/,
                message: 'Must follow standard study ID format (e.g., ABC-123)',
                ichReference: 'ICH M4E(R2) 2.5.1'
              },
              'Study Design': {
                minLength: 10,
                message: 'Must provide complete study design with control groups, blinding, and randomization details',
                ichReference: 'ICH E6(R2) 6.2.1'
              },
              'Endpoints': {
                minLength: 5,
                message: 'Must specify primary and secondary endpoints',
                ichReference: 'ICH E9(R1) 4.2.1'
              }
            }
          }
        },
        regions: ['FDA', 'EMA', 'PMDA'],
        metadata: {
          ichCompliant: true,
          ichGuideline: 'ICH M4E(R2) Common Technical Document',
          ectdSection: '2.5.1',
          lastUpdated: '2025-04-15',
          version: '2.3',
          auditTrail: [
            { date: '2024-11-15', user: 'Sarah Johnson', action: 'Created' },
            { date: '2025-04-01', user: 'Michael Chen', action: 'Updated validation rules' }
          ],
          validationLevel: 'Required',
          regulatoryRequirement: true
        },
        template: `<table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Design</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoints</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">[Study ID]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Study Design]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Population]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Treatment]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Endpoints]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Results]</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'table-3-2-1',
        name: 'Drug Substance Specification Table',
        type: 'table',
        moduleId: 'module3',
        section: '3.2.S.4.1',
        schema: {
          columns: ['Test', 'Method', 'Acceptance Criteria', 'Reference'],
          rules: {
            required: ['Test', 'Method', 'Acceptance Criteria'],
            validation: {
              'Acceptance Criteria': {minLength: 5, message: 'Must provide detailed acceptance criteria'}
            }
          }
        },
        regions: ['FDA', 'EMA', 'Health Canada'],
        metadata: {
          ichCompliant: true,
          lastUpdated: '2025-03-21',
          version: '1.4'
        },
        template: `<table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance Criteria</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">[Test Name]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Method Description]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Acceptance Criteria]</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">[Reference Method]</td>
            </tr>
          </tbody>
        </table>`
      }
    ],
    
    // Narrative blocks
    narratives: [
      {
        id: 'narrative-1-2-cover',
        name: 'NDA Cover Letter',
        type: 'narrative',
        moduleId: 'module1',
        section: '1.2',
        description: 'Standard cover letter format for FDA New Drug Application submissions',
        schema: {
          sections: ['Applicant Information', 'Product Information', 'Submission Details', 'Regulatory History'],
          rules: {
            required: ['Applicant Information', 'Product Information', 'Submission Details'],
            wordCount: {min: 200, max: 1000},
            validation: {
              'Applicant Information': {
                requiredElements: ['Company Name', 'Address', 'Contact Person', 'Phone', 'Email'],
                message: 'Must include all required company contact information',
                ichReference: 'FDA Guidance: Cover Letters and Information for NDA and BLA Submissions'
              },
              'Product Information': {
                requiredElements: ['Proprietary Name', 'Established Name', 'Dosage Form', 'Strength', 'Route of Administration'],
                message: 'Must include complete product identification information',
                ichReference: 'FDA Guidance: Cover Letters and Information for NDA and BLA Submissions'
              },
              'Submission Details': {
                requiredElements: ['Submission Type', 'Proposed Indication', 'User Fee ID', 'Date'],
                message: 'Must specify submission type and related regulatory identifiers',
                ichReference: 'FDA Guidance: Cover Letters and Information for NDA and BLA Submissions'
              }
            }
          }
        },
        regions: ['FDA', 'EMA'],
        metadata: {
          ichCompliant: true,
          ichGuideline: 'FDA Guidance: Cover Letters for NDA and BLA Submissions',
          ectdSection: '1.2',
          lastUpdated: '2025-04-15',
          version: '1.1',
          auditTrail: [
            { date: '2025-01-22', user: 'Amanda Lewis', action: 'Created' },
            { date: '2025-04-15', user: 'Robert Kim', action: 'Updated FDA requirements' }
          ],
          validationLevel: 'Required',
          regulatoryRequirement: true
        },
        template: `<div class="border p-4 rounded">
          <h3 class="text-lg font-bold mb-4">NDA Cover Letter</h3>
          <h4 class="font-medium mb-2">Applicant Information</h4>
          <p class="mb-4">[Insert applicant company name, address, and contact information]</p>
          
          <h4 class="font-medium mb-2">Product Information</h4>
          <p class="mb-4">[Insert product name, dosage form, strength, and intended use]</p>
          
          <h4 class="font-medium mb-2">Submission Details</h4>
          <p class="mb-4">[Insert submission type, date, and reference information]</p>
          
          <h4 class="font-medium mb-2">Regulatory History</h4>
          <p>[Insert previous meeting information, IND references, and other relevant history]</p>
        </div>`
      },
      {
        id: 'narrative-2-5-benefit-risk',
        name: 'Benefit-Risk Assessment Framework',
        type: 'narrative',
        moduleId: 'module2',
        section: '2.5.6',
        description: 'Structured framework for assessing benefit-risk balance per ICH M4E guidelines',
        schema: {
          sections: ['Evidence of Benefits', 'Evidence of Risks', 'Benefit-Risk Assessment', 'Benefit-Risk Summary', 'Risk Management Strategies'],
          rules: {
            required: ['Evidence of Benefits', 'Evidence of Risks', 'Benefit-Risk Summary'],
            wordCount: {min: 500, max: 2500},
            validation: {
              'Evidence of Benefits': {
                requiredElements: ['Efficacy Results', 'Clinical Significance', 'Statistical Analysis'],
                message: 'Must summarize primary efficacy results with statistical significance',
                ichReference: 'ICH M4E(R2) 2.5.6'
              },
              'Evidence of Risks': {
                requiredElements: ['Safety Profile', 'Adverse Events', 'Serious Adverse Events'],
                message: 'Must describe key safety findings including frequency and severity',
                ichReference: 'ICH M4E(R2) 2.5.6'
              },
              'Benefit-Risk Summary': {
                minLength: 100,
                message: 'Must provide integrated assessment of overall benefit-risk balance',
                ichReference: 'ICH M4E(R2) 2.5.6'
              }
            }
          }
        },
        regions: ['FDA', 'EMA', 'Health Canada', 'PMDA'],
        metadata: {
          ichCompliant: true,
          ichGuideline: 'ICH M4E(R2) Common Technical Document',
          ectdSection: '2.5.6',
          lastUpdated: '2025-05-01',
          version: '3.1',
          auditTrail: [
            { date: '2024-07-18', user: 'John Davis', action: 'Created' },
            { date: '2025-01-10', user: 'Emily Wilson', action: 'Updated risk assessment format' },
            { date: '2025-05-01', user: 'Michael Chen', action: 'Added ICH M4E(R2) reference' }
          ],
          validationLevel: 'Required',
          regulatoryRequirement: true
        },
        template: `<div class="border p-4 rounded">
          <h3 class="text-lg font-bold mb-4">Benefit-Risk Assessment Framework</h3>
          <h4 class="font-medium mb-2">Evidence of Benefits</h4>
          <p class="mb-4">[Insert description of benefits, including magnitude and clinical significance]</p>
          
          <h4 class="font-medium mb-2">Evidence of Risks</h4>
          <p class="mb-4">[Insert description of risks, including severity, frequency, and mitigation strategies]</p>
          
          <h4 class="font-medium mb-2">Benefit-Risk Assessment</h4>
          <p class="mb-4">[Insert analysis of benefits versus risks, including uncertainty considerations]</p>
          
          <h4 class="font-medium mb-2">Benefit-Risk Summary</h4>
          <p class="mb-4">[Insert integrated assessment of benefits and risks, concluding with overall benefit-risk determination]</p>
          
          <h4 class="font-medium mb-2">Risk Management Strategies</h4>
          <p>[Insert proposed risk minimization measures and post-marketing surveillance plans]</p>
        </div>`
      }
    ],
    
    // Figure blocks
    figures: [
      {
        id: 'figure-2-7-3-forest-plot',
        name: 'Efficacy Forest Plot',
        type: 'figure',
        moduleId: 'module2',
        section: '2.7.3',
        description: 'Standardized forest plot for presenting efficacy results across subgroups',
        schema: {
          elements: ['Title', 'Figure', 'Legend', 'Source Data Reference', 'Statistical Methods'],
          rules: {
            required: ['Title', 'Figure', 'Source Data Reference'],
            imageFormat: ['SVG', 'PNG', 'JPEG'],
            resolution: {min: '300dpi'},
            validation: {
              'Title': {
                pattern: /^[A-Za-z0-9\s\-\(\):]+$/,
                message: 'Must have clear descriptive title identifying the analysis',
                ichReference: 'ICH E9 5.2.2'
              },
              'Figure': {
                requiredElements: ['Treatment Groups', 'Effect Sizes', 'Confidence Intervals'],
                message: 'Must display effect sizes with confidence intervals for all subgroups',
                ichReference: 'ICH E3 11.4.2.2'
              },
              'Legend': {
                minLength: 20,
                message: 'Must explain all symbols, error bars, and interpretation guidance',
                ichReference: 'ICH E3 Appendix IV'
              },
              'Source Data Reference': {
                pattern: /^[A-Za-z0-9\s\-\.]+$/,
                message: 'Must reference specific study and statistical analysis plan',
                ichReference: 'ICH E3 11.4.2'
              }
            }
          }
        },
        regions: ['FDA', 'EMA', 'PMDA'],
        metadata: {
          ichCompliant: true,
          ichGuideline: 'ICH E3 Clinical Study Reports',
          ectdSection: '2.7.3',
          lastUpdated: '2025-03-10',
          version: '1.2',
          auditTrail: [
            { date: '2024-12-03', user: 'Lisa Wang', action: 'Created' },
            { date: '2025-03-10', user: 'James Miller', action: 'Updated statistical requirements' }
          ],
          validationLevel: 'Required',
          regulatoryRequirement: true
        },
        template: `<div class="border p-4 rounded">
          <h4 class="text-lg font-medium mb-2">[Figure Title]</h4>
          <div class="bg-gray-100 h-64 flex items-center justify-center text-gray-500 mb-2">
            [Forest Plot Placeholder - Upload Image]
          </div>
          <p class="text-sm text-gray-500">Source: [Insert Data Source Reference]</p>
          <p class="text-sm italic mt-2">[Insert Figure Legend]</p>
          <p class="text-xs text-gray-500 mt-2">Statistical Methods: [Insert statistical methods description]</p>
        </div>`
      }
    ]
  };

  // Mock templates data with structured content blocks
  const [templates] = useState([
    {
      id: 101,
      name: 'Clinical Overview Template',
      description: 'Standard template for Module 2.5 Clinical Overview with structured content blocks',
      category: 'Module 2',
      lastUpdated: '2 months ago',
      regions: [
        { id: 201, name: 'FDA Module 2 Regional', region: 'US FDA', lastUpdated: '2 months ago' },
        { id: 202, name: 'EMA Module 2 Regional', region: 'EU EMA', lastUpdated: '2 months ago' }
      ],
      contentBlocks: [
        'table-2-5-1',
        'narrative-2-5-benefit-risk',
        'figure-2-7-3-forest-plot'
      ]
    },
    {
      id: 102,
      name: 'CTD Module 3 Quality Template',
      description: 'Comprehensive template for all Module 3 Quality sections with structured content blocks',
      category: 'Module 3',
      lastUpdated: '1 month ago',
      regions: [
        { id: 201, name: 'FDA Module 3 Regional', region: 'US FDA', lastUpdated: '1 month ago' },
        { id: 202, name: 'EMA Module 3 Regional', region: 'EU EMA', lastUpdated: '1 month ago' }
      ],
      contentBlocks: [
        'table-3-2-1'
      ]
    },
    {
      id: 103,
      name: 'NDA Cover Letter Template',
      description: 'Official cover letter format for NDA submissions',
      category: 'Module 1',
      lastUpdated: '3 weeks ago',
      regions: [
        { id: 201, name: 'FDA Module 1 Regional', region: 'US FDA', lastUpdated: '3 weeks ago' },
        { id: 202, name: 'EMA Module 1 Regional', region: 'EU EMA', lastUpdated: '1 month ago' }
      ],
      contentBlocks: [
        'narrative-1-2-cover'
      ]
    }
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <header className="mb-6 pt-4 px-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <img src="https://www.trialsage.com/logo.svg" alt="TrialSage" className="h-8 mr-2" />
            <h1 className="text-2xl font-bold">eCTD Co-Author Module</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTreeOpen(!isTreeOpen)}
              className="flex items-center"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              {isTreeOpen ? "Hide Navigation" : "Show Navigation"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTeamCollabOpen(true)}
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Collaboration
            </Button>
            <Button 
              variant={aiAssistantOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className={`flex items-center ${aiAssistantOpen ? "bg-blue-600 text-white" : ""}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">Enterprise Edition</span>
            <span className="mx-2">|</span>
            <span>Powered by AI Document Intelligence</span>
          </div>
          {selectedDocument && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center text-blue-700 border-blue-200"
              >
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
              <Badge variant="outline" className="border-blue-200 text-blue-700 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Current: {activeVersion}
              </Badge>
              <div className="text-sm text-gray-500">
                Last edited by <span className="font-medium text-gray-700">John Doe</span> on May 11, 2025
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with optional navigation tree and AI assistant */}
      <div className="px-6 pb-6 flex">
        {/* Document Tree Navigation - Enterprise Edition Feature */}
        {isTreeOpen && (
          <div className="w-64 border-r pr-4 mr-6 flex-shrink-0">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Document Structure</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setIsTreeOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="border-l-4 border-blue-600 pl-2 py-1 font-medium">
                  Module 1: Administrative Information
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 1.1: Cover Letter
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer text-blue-600">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Section 1.2: Table of Contents
                    <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-600 pl-2 py-1 font-medium flex items-center justify-between group">
                  <span>Module 2: Common Technical Document</span>
                  <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 2.1: CTD Table of Contents
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 2.2: Introduction
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Section 2.3: Quality Overall Summary</span>
                  </div>
                  <div className="flex items-center text-sm py-1 bg-slate-50 rounded px-2 cursor-pointer font-medium">
                    <FileText className="h-4 w-4 mr-2 text-slate-600" />
                    <span>Section 2.5: Clinical Overview</span>
                    <Badge className="ml-2 h-5 bg-amber-100 text-amber-700 border-amber-200 text-[10px]">In Review</Badge>
                  </div>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-2 py-1 font-medium">
                  Module 3: Quality
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 3.2.P: Drug Product
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 3.2.S: Drug Substance
                  </div>
                </div>
                
                <div className="border-l-4 border-purple-600 pl-2 py-1 font-medium">
                  Module 4: Nonclinical Study Reports
                </div>
                
                <div className="border-l-4 border-indigo-600 pl-2 py-1 font-medium">
                  Module 5: Clinical Study Reports
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm font-medium mb-2">Document Health</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completeness</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <Progress value={72} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Consistency</span>
                      <span className="font-medium">86%</span>
                    </div>
                    <Progress value={86} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Issue Resolution</span>
                      <span className="font-medium">63%</span>
                    </div>
                    <Progress value={63} className="h-2 bg-slate-100" indicatorClassName="bg-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Assistant Panel - Enterprise Grade Feature */}
        {aiAssistantOpen && (
          <div className="w-80 border rounded-md overflow-hidden bg-white shadow-md flex-shrink-0 mr-6">
            <div className="sticky top-0">
              <div className="bg-blue-50 border-b p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  <h3 className="font-medium text-sm">AI Document Assistant</h3>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAiAssistantOpen(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="border-b">
                <div className="flex p-1">
                  <Button 
                    variant={aiAssistantMode === 'suggestions' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('suggestions')}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Suggestions
                  </Button>
                  <Button 
                    variant={aiAssistantMode === 'compliance' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('compliance')}
                  >
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    Compliance
                  </Button>
                  <Button 
                    variant={aiAssistantMode === 'formatting' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('formatting')}
                  >
                    <ListChecks className="h-3 w-3 mr-1" />
                    Formatting
                  </Button>
                </div>
              </div>
              
              <div className="p-3 max-h-[calc(100vh-14rem)] overflow-y-auto space-y-3">
                {aiAssistantMode === 'suggestions' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <Bot className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Content Suggestions</span>
                      </div>
                      <p className="text-xs text-slate-500">The AI can suggest text improvements, missing content, and help you complete sections.</p>
                    </div>
                  
                    {aiSuggestions.filter(s => s.type === 'completion').map(suggestion => (
                      <div key={suggestion.id} className="bg-blue-50 rounded-md p-3 border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <X className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">Insert</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Modify</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border border-dashed rounded-md p-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <p className="text-xs text-slate-500">Ask the AI to help you complete this section or improve specific text.</p>
                        <Button variant="outline" size="sm" className="text-xs h-7">Generate Suggestions</Button>
                      </div>
                    </div>
                  </>
                )}
                
                {aiAssistantMode === 'compliance' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <ClipboardCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Regulatory Compliance</span>
                      </div>
                      <p className="text-xs text-slate-500">Checks your document against FDA, EMA and ICH guidelines.</p>
                    </div>
                    
                    {aiSuggestions.filter(s => s.type === 'compliance').map(suggestion => (
                      <div key={suggestion.id} className="bg-amber-50 rounded-md p-3 border border-amber-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">Compliance</Badge>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700">Fix Issue</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Ignore</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-green-50 rounded-md border border-green-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                        <span className="text-sm font-medium">ICH M4E Compliant</span>
                      </div>
                      <p className="text-xs text-slate-700">Your document structure follows ICH M4E guidelines for Clinical Overview format.</p>
                    </div>
                    
                    <Button className="w-full text-xs" variant="outline">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Run Full Compliance Check
                    </Button>
                  </>
                )}
                
                {aiAssistantMode === 'formatting' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <ListChecks className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Format Assistance</span>
                      </div>
                      <p className="text-xs text-slate-500">Fix tables, improve formatting, and apply consistent styles.</p>
                    </div>
                    
                    {aiSuggestions.filter(s => s.type === 'formatting').map(suggestion => (
                      <div key={suggestion.id} className="bg-slate-50 rounded-md p-3 border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Info className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">Format</Badge>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs">Apply Fix</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Preview</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 rounded-md border border-slate-200">
                      <div className="flex items-center mb-2">
                        <Settings className="h-4 w-4 mr-1.5 text-slate-600" />
                        <span className="text-sm font-medium">Format Settings</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Apply ICH formatting</span>
                          <Badge>Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Auto-fix tables</span>
                          <Badge>Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Standardize headings</span>
                          <Badge>Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="border-t p-2 bg-slate-50">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs text-slate-500">Powered by OpenAI GPT-4o</span>
                  <Button variant="ghost" size="sm" className="h-6 flex items-center justify-center text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
                
                {aiError && (
                  <div className="mb-2 p-2 text-xs bg-red-50 border border-red-200 rounded-md text-red-600">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p>{aiError}</p>
                  </div>
                )}
                
                {aiResponse && aiAssistantMode === 'suggestions' && (
                  <div className="mb-2 p-2 text-xs bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start">
                      <Sparkles className="h-3 w-3 mr-1 mt-0.5 text-blue-600" />
                      <div>
                        <span className="font-medium text-blue-800">Suggestion</span>
                        <p className="text-slate-700">{aiResponse.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {aiResponse && aiAssistantMode === 'ask' && (
                  <div className="mb-2 p-2 text-xs bg-slate-50 border rounded-md">
                    <div className="flex items-start">
                      <Bot className="h-3 w-3 mr-1 mt-0.5 text-indigo-600" />
                      <div>
                        <span className="font-medium text-indigo-800">Response</span>
                        <p className="text-slate-700">{aiResponse.answer}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleAiQuerySubmit} className="relative">
                  <input 
                    type="text" 
                    className="w-full h-8 text-xs pl-3 pr-8 rounded-md border" 
                    placeholder="Ask the AI Assistant..." 
                    value={aiUserQuery}
                    onChange={(e) => setAiUserQuery(e.target.value)}
                    disabled={aiIsLoading}
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-1 top-1 h-6 w-6 p-0" 
                    size="icon"
                    disabled={aiIsLoading || !aiUserQuery.trim()}
                  >
                    {aiIsLoading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {/* AI-Powered Document Editor Card - Enterprise-Grade Enhanced */}
          <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <Edit className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Powered Document Editor
                </CardTitle>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Create and edit regulatory documents with intelligent assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Open the new document dialog instead of immediately creating
                      setSelectedTemplate(null);
                      setSelectedContentBlocks([]);
                      setDocumentTitle('');
                      setDocumentModule('');
                      setNewDocumentDialogOpen(true);
                    }}
                  >
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-200 text-blue-700"
                    disabled={authLoading}
                    onClick={async () => {
                      if (!selectedDocument) {
                        toast({
                          title: "Select a Document",
                          description: "Please select a document to edit first.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      toast({
                        title: "Opening Google Docs",
                        description: "Preparing document for editing in Google Docs...",
                        variant: "default",
                      });
                      console.log("Creating Google Docs editing session for VAULT document " + selectedDocument.id + "...");
                        
                        // Check if user is authenticated with Google
                        if (!isGoogleAuthenticated) {
                          try {
                            console.log("User not authenticated with Google, initiating sign-in");
                            // Add loading state
                            setAuthLoading(true);
                            
                            // Set up event listener for the auth callback
                            // This is important for handling the auth response from the popup
                            window.addEventListener('message', function handleAuthMessage(event) {
                              if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                                window.removeEventListener('message', handleAuthMessage);
                                setIsGoogleAuthenticated(true);
                                setGoogleUserInfo(event.data.user);
                                setAuthLoading(false);
                                
                                toast({
                                  title: "Google Sign-In Successful",
                                  description: `Signed in as ${event.data.user.name}`,
                                  variant: "default",
                                });
                                
                                // Continue with opening the document after successful authentication
                                setTimeout(() => {
                                  setGoogleDocsPopupOpen(true);
                                }, 500);
                              } else if (event.data && event.data.type === 'GOOGLE_AUTH_ERROR') {
                                window.removeEventListener('message', handleAuthMessage);
                                setAuthLoading(false);
                                
                                toast({
                                  title: "Authentication Error",
                                  description: event.data.error || "Failed to sign in with Google. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            });
                            
                            const user = await googleAuthService.signInWithGoogle();
                            
                            // If we get here synchronously (without going through the message event),
                            // it means the authentication was handled by the service directly
                            setAuthLoading(false);
                            setIsGoogleAuthenticated(true);
                            setGoogleUserInfo(user);
                            
                            toast({
                              title: "Google Sign-In Successful",
                              description: `Signed in as ${user.name}`,
                              variant: "default",
                            });
                            
                            // Continue with opening the document after successful authentication
                            setTimeout(() => {
                              setGoogleDocsPopupOpen(true);
                            }, 500);
                          } catch (error) {
                            console.error("Error signing in with Google:", error);
                            setAuthLoading(false);
                            
                            toast({
                              title: "Authentication Error",
                              description: error.message || "Failed to sign in with Google. Please try again.",
                              variant: "destructive",
                            });
                            return;
                          }
                        } else {
                          console.log("User already authenticated with Google, opening document editor");
                          // User is already authenticated, open the document
                          setTimeout(() => {
                            setGoogleDocsPopupOpen(true);
                            toast({
                              title: "Google Docs Ready",
                              description: "Document is now ready for editing in Google Docs.",
                              variant: "default",
                            });
                          }, 700);
                        }
                      }
                    }
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Edit in Google Docs
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-200">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm">
                    Recent Documents
                  </div>
                  <div className="divide-y">
                    {documents.slice(0, 3).map((doc) => (
                      <div 
                        key={doc.id} 
                        className="p-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{doc.module} • Last edited {doc.lastEdited}</div>
                            </div>
                          </div>
                          <Badge 
                            className={`
                              ${doc.status === 'Final' ? 'bg-green-100 text-green-800 border-green-200' : 
                                doc.status === 'In Review' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-blue-100 text-blue-700 border-blue-200'}
                            `}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <Button size="sm" variant="ghost" className="w-full text-blue-600">
                      View All Documents
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Templates Card - Enterprise-Grade Enhanced */}
          <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <LayoutTemplate className="h-5 w-5 mr-2 text-green-600" />
                  Document Templates
                </CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Start with pre-approved templates for regulatory documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-200">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </Button>
                </div>
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm flex justify-between items-center">
                    <span>Featured Templates</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">ICH-Compliant</Badge>
                  </div>
                  <div className="divide-y">
                    {templates.map((template) => (
                      <div key={template.id} className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTemplate(template)}>
                        <div className="flex items-start space-x-2">
                          <LayoutTemplate className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="w-full">
                            <div className="font-medium flex items-center justify-between">
                              <span>{template.name}</span>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validated
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{template.category} • Updated {template.lastUpdated}</div>
                            
                            {/* Region Badges */}
                            <div className="flex flex-wrap gap-2 text-xs items-center">
                              {template.regions.map((region) => (
                                <Badge 
                                  key={region.id}
                                  variant="outline" 
                                  className="mt-2 h-5 justify-center bg-slate-50 border-slate-200"
                                >
                                  {region.region}
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Structured Content Block Section */}
                            {template.contentBlocks && template.contentBlocks.length > 0 && (
                              <div className="mt-3 border-t pt-2">
                                <div className="text-xs font-medium mb-1 flex justify-between">
                                  <span>eCTD Structured Content Blocks:</span>
                                  <span className="text-green-600 text-[10px]">ICH Guidelines Referenced</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {template.contentBlocks.map(blockId => {
                                    // Find the block in the registry
                                    let block = null;
                                    let blockType = '';
                                    let icon = null;
                                    
                                    if (blockId.startsWith('table-')) {
                                      block = contentBlockRegistry.tables.find(t => t.id === blockId);
                                      blockType = 'table';
                                      icon = <TableIcon className="h-3 w-3 mr-1" />;
                                    } else if (blockId.startsWith('narrative-')) {
                                      block = contentBlockRegistry.narratives.find(n => n.id === blockId);
                                      blockType = 'narrative';
                                      icon = <FileText className="h-3 w-3 mr-1" />;
                                    } else if (blockId.startsWith('figure-')) {
                                      block = contentBlockRegistry.figures.find(f => f.id === blockId);
                                      blockType = 'figure';
                                      icon = <BarChart3 className="h-3 w-3 mr-1" />;
                                    }
                                    
                                    if (!block) return null;
                                    
                                    // Badge color based on section number exactly matching screenshot
                                    let badgeColor = '';
                                    
                                    // Color mappings based on the screenshot
                                    if (block.section === '2.5') {
                                      badgeColor = 'bg-blue-100 text-blue-800';
                                    } else if (block.section === '2.5.6') {
                                      badgeColor = 'bg-blue-100 text-blue-800';
                                    } else if (block.section === '2.7.3') {
                                      badgeColor = 'bg-purple-100 text-purple-800';
                                    } else if (block.section === '3.2.S.4.1') {
                                      badgeColor = 'bg-green-100 text-green-800';
                                    } else if (block.section === '1.2') {
                                      badgeColor = 'bg-blue-100 text-blue-800';
                                    }
                                    
                                    const hasIchReference = block.metadata?.ichGuideline || 
                                               (block.schema?.rules?.validation && 
                                                Object.values(block.schema.rules.validation).some(v => v.ichReference));
                                    
                                    return (
                                      <Badge 
                                        key={blockId}
                                        className={`${badgeColor} h-5 px-2 justify-center text-xs rounded-full flex items-center`}
                                      >
                                        {icon}
                                        <span>{block.section}</span>
                                        {hasIchReference && (
                                          <Check className="h-3 w-3 ml-1 text-white bg-green-600 rounded-full p-[1px]" />
                                        )}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Validation Dashboard - Enterprise-Grade Enhanced */}
          <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Validation Dashboard
                </CardTitle>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Ensure compliance with regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm flex justify-between items-center">
                    <span>Module 2.5 Clinical Overview</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Content Completeness</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Regulatory Compliance</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Reference Validation</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">4 validation issues require attention</p>
                        <p className="mt-1">Missing source citations in section 2.5.4 and incomplete benefit-risk assessment.</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => setShowValidationDialog(true)}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Open Validation Report
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Overall: 68%</span>
                    <span className="text-gray-500 ml-1.5">complete</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 h-8"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Document Content Area (Displayed when document is selected) */}
        {selectedDocument && (
          <div className="mt-8 border rounded-md shadow">
            <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                  <div className="text-sm text-slate-500">
                    {selectedDocument.module} • Last edited {selectedDocument.lastEdited}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-200 text-blue-700"
                  onClick={() => setShowValidationDialog(true)}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-green-200 text-green-700"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Editor Tabs */}
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-3">
                  <TabsTrigger value="edit" className="flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="view" className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Changes
                  </TabsTrigger>
                </TabsList>
                
                {/* Edit Tab Content */}
                <TabsContent value="edit" className="pt-4 space-y-4">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="h-8 w-8 mb-4 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-500">Loading Microsoft Word editor...</p>
                      </div>
                    </div>
                  }>
                    <EnhancedDocumentEditor 
                      documentId={selectedDocument?.id?.toString() || 'current-doc'}
                      sectionId="2.5.5"
                      initialContent="The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects)."
                      documentTitle={selectedDocument?.title || "Module 2.5 Clinical Overview"}
                      sectionTitle="Safety Profile"
                      onSave={(content) => {
                        console.log("Saving document content:", content);
                        toast({
                          title: "Document Saved",
                          description: "Your changes have been saved to the document vault.",
                          variant: "default",
                        });
                      }}
                      onLockDocument={(locked) => setDocumentLocked(locked)}
                      isLocked={documentLocked}
                      lockedBy={lockedBy}
                    />
                  </Suspense>
                  
                  {/* AI Assistance Panel when in document editing mode */}
                  {aiAssistantOpen && (
                    <div className="bg-slate-50 border rounded-md p-4 my-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                          <h4 className="font-medium">AI Document Assistant</h4>
                        </div>
                        
                        {aiIsLoading && (
                          <Badge className="bg-blue-50 text-blue-600 border border-blue-200">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-1.5" />
                            Processing...
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 mb-3">
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'suggestions' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('suggestions')}
                        >
                          <Lightbulb className="h-4 w-4 mr-1.5" />
                          Content Suggestions
                        </Button>
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'compliance' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('compliance')}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1.5" />
                          Compliance Check
                        </Button>
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'formatting' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('formatting')}
                        >
                          <ListChecks className="h-4 w-4 mr-1.5" />
                          Format & Structure
                        </Button>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-md p-3 relative">
                        {aiResponse ? (
                          <div className="prose prose-sm max-w-none text-slate-700">
                            <div dangerouslySetInnerHTML={{ __html: aiResponse.suggestion?.replace(/\n/g, '<br />') || '' }} />
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-slate-700">
                            <p>
                              Ask the AI assistant for help with your document. You can request suggestions for content improvements, 
                              check compliance with regulatory guidelines, or get help with formatting and structure.
                            </p>
                          </div>
                        )}
                        
                        {aiResponse && aiResponse.references && aiResponse.references.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                            <strong>References:</strong>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                              {aiResponse.references.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                          >
                            <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                            Copy to Clipboard
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                          >
                            <FilePlus2 className="h-3.5 w-3.5 mr-1.5" />
                            Insert to Document
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                            onClick={() => {
                              // Create a regeneration request
                              setAiUserQuery("Suggest improvements for the safety profile section");
                              handleAiQuerySubmit({ preventDefault: () => {} });
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Regenerate Response
                          </Button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleAiQuerySubmit} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 h-9 rounded-md border text-sm px-3"
                          placeholder="Ask the AI to help you complete this section or improve specific text..."
                          value={aiUserQuery}
                          onChange={(e) => setAiUserQuery(e.target.value)}
                          disabled={aiIsLoading}
                        />
                        <Button 
                          type="submit"
                          size="sm" 
                          className="h-9"
                          disabled={aiIsLoading || !aiUserQuery.trim()}
                        >
                          <Send className="h-4 w-4 mr-1.5" />
                          Ask AI
                        </Button>
                      </form>
                    </div>
                  )}
                </TabsContent>
                
                {/* Preview Tab Content */}
                <TabsContent value="view" className="pt-4 space-y-4">
                  <div className="border rounded-md p-6">
                    <div className="prose prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 max-w-none">
                      <h1>2.5 Clinical Overview</h1>
                      <h2>2.5.5 Safety Profile</h2>
                      
                      <p>
                        The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p>
                        The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.
                      </p>
                      <p>
                        No serious adverse events were considered related to the study medication, and the discontinuation rate due to adverse events was low (3.2%), comparable to placebo (2.8%).
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Changes Tab Content */}
                <TabsContent value="history" className="pt-4 space-y-4">
                  <div className="border rounded-md divide-y">
                    <div className="p-3 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center text-sm font-medium">
                        <History className="h-4 w-4 mr-1.5 text-blue-600" />
                        Recent Changes
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        View Full History
                      </Button>
                    </div>
                    
                    <div className="p-3 flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">JD</div>
                        <div className="w-0.5 bg-slate-200 h-full mt-2"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="text-xs text-slate-500">Updated safety profile section</div>
                        <div className="text-xs text-slate-400">Today at 10:32 AM</div>
                        <div className="mt-2 border-l-2 border-blue-400 pl-3 ml-1 text-sm">
                          <p>Added additional data on adverse event rates and discontinuation percentages.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium">SW</div>
                        <div className="w-0.5 bg-slate-200 h-full mt-2"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sarah Williams</div>
                        <div className="text-xs text-slate-500">Edited introduction paragraph</div>
                        <div className="text-xs text-slate-400">Yesterday at 4:15 PM</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
      
      {/* Google Docs Integration */}
      <Dialog open={googleDocsPopupOpen} onOpenChange={setGoogleDocsPopupOpen} className="max-w-[90%] w-[1200px]">
        <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Google Docs - {selectedDocument?.title || "Module 2.5 Clinical Overview"}
            </DialogTitle>
            <DialogDescription>
              Edit your document with Google Docs, embedded directly in TrialSage.
              {!isGoogleAuthenticated && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-amber-700 text-sm">
                    Sign in with Google for full document editing capabilities.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Suspense fallback={
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p>Loading Google Docs...</p>
              <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
            </div>
          }>
            {!isGoogleAuthenticated ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="bg-blue-50 rounded-lg p-6 max-w-md text-center mb-4">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Google Authentication Required</h3>
                  <p className="text-gray-600 mb-4">
                    To edit documents with Google Docs, you need to sign in with your Google account.
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        setAuthLoading(true);
                        const user = await googleAuthService.signInWithGoogle();
                        setIsGoogleAuthenticated(true);
                        setGoogleUserInfo(user);
                        setAuthLoading(false);
                      } catch (error) {
                        console.error("Error signing in with Google:", error);
                        setAuthLoading(false);
                        toast({
                          title: "Authentication Error",
                          description: error.message || "Failed to sign in with Google. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={authLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="h-4 w-4 mr-2" />
                        Sign in with Google
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <GoogleDocsEmbed 
                documentId={selectedDocument?.id === 1 ? "1LfAYfIxHWDNTxzzHK9HuZZvDJCZpPGXbDJF-UaXgTf8" : "1lHBM9PlzCDuiJaVeUFvCuqglEELXJRBGTJFHvcfSYw4"}
                documentName={selectedDocument?.title || "Module 2.5 Clinical Overview"}
              />
            )}
          </Suspense>
          
          <DialogFooter className="mt-4">
            <div className="flex justify-between w-full">
              <div>
                {isGoogleAuthenticated ? (
                  <>
                    <Button 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700 mr-2"
                      onClick={async () => {
                        try {
                          toast({
                            title: "Saving to VAULT",
                            description: "Saving document to VAULT...",
                            variant: "default",
                          });
                          
                          // Get current document ID from selected document
                          const docId = selectedDocument?.id === 1 ? 
                            "1LfAYfIxHWDNTxzzHK9HuZZvDJCZpPGXbDJF-UaXgTf8" : 
                            "1lHBM9PlzCDuiJaVeUFvCuqglEELXJRBGTJFHvcfSYw4";
                          
                          // Save to VAULT using our service
                          const result = await googleDocsService.saveToVault(docId, {
                            title: selectedDocument?.title,
                            module: selectedDocument?.module || "2.5",
                            status: "Draft",
                            organizationId: 1,
                            savedBy: googleUserInfo?.name || "Current User",
                            timestamp: new Date().toISOString()
                          });
                          
                          console.log("Document saved to VAULT:", result);
                          
                          toast({
                            title: "Document Saved",
                            description: "Your document has been saved to the VAULT successfully.",
                            variant: "default",
                          });
                        } catch (error) {
                          console.error("Error saving to VAULT:", error);
                          toast({
                            title: "Error Saving Document",
                            description: "There was an error saving your document to VAULT.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save to VAULT
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-700 mr-2"
                      onClick={() => {
                        // Get the document URL for the current document
                        const docId = selectedDocument?.id === 1 ? 
                          "1LfAYfIxHWDNTxzzHK9HuZZvDJCZpPGXbDJF-UaXgTf8" : 
                          "1lHBM9PlzCDuiJaVeUFvCuqglEELXJRBGTJFHvcfSYw4";
                        
                        // Open in a new tab
                        window.open(`https://docs.google.com/document/d/${docId}/edit`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-red-100 text-red-600"
                      onClick={async () => {
                        try {
                          await googleAuthService.signOutFromGoogle();
                          setIsGoogleAuthenticated(false);
                          setGoogleUserInfo(null);
                          
                          toast({
                            title: "Signed Out",
                            description: "You have been signed out from Google.",
                            variant: "default",
                          });
                        } catch (error) {
                          console.error("Error signing out:", error);
                        }
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 mr-2"
                    onClick={async () => {
                      try {
                        const user = await googleAuthService.signInWithGoogle();
                        setIsGoogleAuthenticated(true);
                        setGoogleUserInfo(user);
                        
                        toast({
                          title: "Google Sign-In Successful",
                          description: `Signed in as ${user.name}`,
                          variant: "default",
                        });
                      } catch (error) {
                        console.error("Error signing in with Google:", error);
                        toast({
                          title: "Sign-In Failed",
                          description: "Failed to sign in with Google. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12c0,5.523,4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                )}
              </div>
              
              <Button variant="outline" onClick={() => setGoogleDocsPopupOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Document Version History
            </DialogTitle>
            <DialogDescription>
              Review previous versions of this document. You can compare versions or restore a previous version.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 p-3 border-b bg-slate-50 font-medium text-sm">
              <div>Version</div>
              <div className="col-span-2">Changes</div>
              <div>Date</div>
              <div>Author</div>
            </div>
            
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {versionHistory.map((version) => (
                <div key={version.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-slate-50">
                  <div className="font-medium">
                    {version.name}
                    {version.status === 'Current' && (
                      <Badge className="ml-2 h-5 bg-green-100 text-green-800 border-green-200 text-[10px]">Current</Badge>
                    )}
                  </div>
                  <div className="col-span-2">{version.changes}</div>
                  <div>{version.date}</div>
                  <div className="flex justify-between items-center">
                    <span>{version.author}</span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setCompareVersions({
                            base: activeVersion, 
                            compare: version.id
                          });
                          setShowVersionHistory(false);
                          setShowCompareDialog(true);
                        }}
                        title="Compare with current version"
                      >
                        <GitMerge className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setActiveVersion(version.id);
                          setShowVersionHistory(false);
                        }}
                        title="View this version"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3 mt-3">
            <div className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1 text-blue-500" />
              All versions are stored securely in Vault with 21 CFR Part 11 compliant audit trails
            </div>
            <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Version Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog} className="max-w-4xl">
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <GitMerge className="h-5 w-5 mr-2" />
              Compare Document Versions
            </DialogTitle>
            <DialogDescription>
              Comparing {compareVersions.base} with {compareVersions.compare}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="side-by-side" className="w-full mb-4">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="side-by-side" className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Side-by-Side View
                </TabsTrigger>
                <TabsTrigger value="inline" className="flex items-center">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Inline Differences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="side-by-side" className="mt-4">
                <div className="grid grid-cols-2 gap-4 overflow-auto flex-grow">
                  <div className="border rounded-md overflow-auto">
                    <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                      {compareVersions.base} (Current)
                    </div>
                    <div className="p-3 text-sm">
                      <p className="mb-2">
                        <span className="bg-green-100 px-1">The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects.</span> Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p className="mb-2">
                        The efficacy of Drug X was evaluated across multiple endpoints. <span className="bg-green-100 px-1">Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001)</span> with consistent results across all study sites.
                      </p>
                      <p className="mb-2">
                        Long-term safety data from extension studies (up to 24 months) <span className="bg-red-100 px-1 line-through">showed no new safety signals</span> and confirmed the favorable benefit-risk profile observed in shorter studies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-auto">
                    <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                      {compareVersions.compare}
                    </div>
                    <div className="p-3 text-sm">
                      <p className="mb-2">
                        The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p className="mb-2">
                        The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.
                      </p>
                      <p className="mb-2">
                        Long-term safety data from extension studies (up to 24 months) <span className="bg-green-100 px-1">demonstrated a continued absence of significant safety concerns</span> and confirmed the favorable benefit-risk profile observed in shorter studies.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="inline" className="mt-4">
                <div className="border rounded-md max-h-[400px] overflow-auto">
                  <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                    Inline Changes
                  </div>
                  <div className="p-3 text-sm">
                    <p className="mb-2">
                      <span className="bg-blue-50 px-1 border-l-4 border-blue-400 pl-2">The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).</span>
                    </p>
                    <p className="mb-2">
                      <span className="bg-blue-50 px-1 border-l-4 border-blue-400 pl-2">The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.</span>
                    </p>
                    <p className="mb-2">
                      Long-term safety data from extension studies (up to 24 months) 
                      <span className="bg-red-100 px-1 mx-1 line-through">showed no new safety signals</span>
                      <span className="bg-green-100 px-1 mx-1">demonstrated a continued absence of significant safety concerns</span>
                      and confirmed the favorable benefit-risk profile observed in shorter studies.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Plus className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Added</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Minus className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Removed</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Info className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600">Unchanged</span>
                </Badge>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveVersion(compareVersions.compare)}
                  className="border-green-200 text-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore This Version
                </Button>
                <Button onClick={() => setShowCompareDialog(false)}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Team Collaboration Dialog */}
      <Dialog open={teamCollabOpen} onOpenChange={setTeamCollabOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Collaboration
            </DialogTitle>
            <DialogDescription>
              View team members working on this document and manage access permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md">
              <div className="bg-slate-50 p-2 font-medium border-b text-sm">Active Collaborators</div>
              <div className="divide-y">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium mr-3">JD</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-gray-500">Editor</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Editing</Badge>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium mr-3">JS</div>
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-xs text-gray-500">Reviewer</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Viewing</Badge>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md">
              <div className="bg-slate-50 p-2 font-medium border-b text-sm">Document Access Controls</div>
              <div className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Document Locking</div>
                    <Button
                      size="sm"
                      variant={documentLocked ? "destructive" : "outline"}
                      onClick={() => setDocumentLocked(!documentLocked)}
                      className="h-8"
                    >
                      {documentLocked ? (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Unlock Document
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Lock for Editing
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {documentLocked ? 
                      "Document is currently locked. Only you can make changes." : 
                      "Lock the document to prevent others from making changes while you edit."}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1 text-blue-500" />
              All document access is logged for audit purposes
            </div>
            <Button onClick={() => setTeamCollabOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              Document Validation Report
            </DialogTitle>
            <DialogDescription>
              Detailed validation results for Module 2.5 Clinical Overview
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-auto">
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="issues" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Issues ({validationResults.issues.length})
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Compliance
                </TabsTrigger>
                <TabsTrigger value="references" className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  References
                </TabsTrigger>
                <TabsTrigger value="guidance" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guidance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Validation Issues</h3>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Critical: 1</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-amber-50 text-amber-700 border-amber-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Major: 1</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Info className="h-3 w-3" />
                      <span>Minor: 2</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 p-3 border-b bg-slate-50 font-medium text-sm">
                    <div>Severity</div>
                    <div>Location</div>
                    <div className="col-span-2">Issue</div>
                    <div>Action</div>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {validationResults.issues.map((issue) => (
                      <div key={issue.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-slate-50">
                        <div>
                          {issue.severity === 'critical' && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
                          )}
                          {issue.severity === 'major' && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Major</Badge>
                          )}
                          {issue.severity === 'minor' && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Minor</Badge>
                          )}
                          {issue.severity === 'info' && (
                            <Badge className="bg-slate-100 text-slate-800 border-slate-200">Info</Badge>
                          )}
                        </div>
                        <div className="font-medium">Section {issue.section}</div>
                        <div className="col-span-2">
                          <div>{issue.description}</div>
                          <div className="text-xs text-slate-500 mt-1">Suggestion: {issue.suggestion}</div>
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 border-blue-200 text-blue-700"
                          >
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Fix Issue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-md p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <FileWarning className="h-4 w-4 mr-2 text-amber-600" />
                    AI-Powered Recommendation
                  </h4>
                  <p className="text-sm text-slate-600">
                    Based on analysis of your document and regulatory requirements, we recommend addressing the critical citation issue in Section 2.5.4 first. Consider using the Citation Assistant to automatically search for relevant references from your literature database.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Regulatory Compliance</h3>
                    <div className="border rounded-md p-4 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>FDA Guidelines Compliance</span>
                          <span className="font-medium">{validationResults.regulatory}%</span>
                        </div>
                        <Progress value={validationResults.regulatory} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ICH M4 Compliance</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <Progress value={94} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EMA Guidelines Compliance</span>
                          <span className="font-medium">81%</span>
                        </div>
                        <Progress value={81} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-3">Missing Required Elements</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-xs">!</span>
                          </div>
                          <div>Comprehensive risk-benefit analysis in section 2.5.6</div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-xs">!</span>
                          </div>
                          <div>Discussion of results in specific populations (elderly, pediatric)</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Content Assessment</h3>
                    <div className="border rounded-md p-4 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content Completeness</span>
                          <span className="font-medium">{validationResults.completeness}%</span>
                        </div>
                        <Progress value={validationResults.completeness} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Internal Consistency</span>
                          <span className="font-medium">{validationResults.consistency}%</span>
                        </div>
                        <Progress value={validationResults.consistency} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Scientific Accuracy</span>
                          <span className="font-medium">89%</span>
                        </div>
                        <Progress value={89} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-3">Documentation Consistency</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Consistent with Investigator's Brochure
                          </div>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Consistent with Non-Clinical Overview
                          </div>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                            Consistent with Clinical Study Reports
                          </div>
                          <Badge className="bg-amber-100 text-amber-700">Needs Review</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="references" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Reference Analysis</h3>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Link className="h-3 w-3" />
                      <span>Total: 47</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Missing: 8</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                    <h4 className="font-medium text-sm">Reference Validation Status</h4>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center">
                        <Filter className="h-3 w-3 mr-1" />
                        Filter
                      </div>
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Select All
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Missing citation in Section 2.5.4</div>
                            <div className="text-xs text-slate-500 mt-1">Claim about efficacy requires statistical significance reference</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Add Reference
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Reference format inconsistency</div>
                            <div className="text-xs text-slate-500 mt-1">Multiple citation styles detected (Vancouver and APA)</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Standardize
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Outdated reference in Section 2.5.3</div>
                            <div className="text-xs text-slate-500 mt-1">Reference #18 has been superseded by newer publication</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm bg-slate-50 p-3 rounded-md border">
                  <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Reference Management Tips</p>
                    <p className="mt-1 text-slate-600">
                      You can use the AI Reference Assistant to automatically scan your document for claims requiring citations and match them with appropriate references from your literature database.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="guidance" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border rounded-md">
                    <div className="bg-slate-50 p-3 border-b font-medium">
                      Applicable Regulatory Guidance
                    </div>
                    <div className="divide-y">
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">ICH M4E(R2) - Guideline on Clinical Overview and Clinical Summary</div>
                            <div className="text-xs text-slate-500 mt-1">Last updated: January 2023</div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">FDA Guidance - Format and Content of the Clinical and Statistical Sections</div>
                            <div className="text-xs text-slate-500 mt-1">Last updated: March 2022</div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">EMA Clinical Documentation Requirements</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
                              Updated April 2025 (newer version available)
                            </div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="bg-slate-50 p-3 border-b font-medium">
                      Technical Guidance & Best Practices
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-medium text-sm">Section 2.5.4 - Analysis of Clinical Information</h4>
                      <div className="text-sm text-slate-600">
                        <p className="mb-2">This section should include a detailed and critical analysis of all clinical data submitted in the clinical study reports. Key components include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Study designs and key study endpoints</li>
                          <li>Statistical approaches and analyses</li>
                          <li>Comparative efficacy and safety across all studies</li>
                          <li>Patient exposure with identification of safety database</li>
                          <li>Analysis of intrinsic and extrinsic factors on efficacy and safety</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-700">
                          <FileCheck className="h-4 w-4 mr-2" />
                          View Template
                        </Button>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Best Practices
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-200 text-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-200 text-purple-700"
              >
                <Info className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>
            </div>
            <Button onClick={() => setShowValidationDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Document Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Document
            </DialogTitle>
            <DialogDescription>
              Customize export options for Module 2.5 Clinical Overview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <div className="flex flex-col space-y-2">
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'pdf' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>PDF Format</span>
                  </div>
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'word' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('word')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'word' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>Word Document</span>
                  </div>
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'html' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('html')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'html' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>HTML Format</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeComments} 
                      onChange={() => setExportOptions({...exportOptions, includeComments: !exportOptions.includeComments})}
                    />
                    <span className="text-sm">Include Comments</span>
                  </label>
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeTrackChanges} 
                      onChange={() => setExportOptions({...exportOptions, includeTrackChanges: !exportOptions.includeTrackChanges})}
                    />
                    <span className="text-sm">Include Track Changes</span>
                  </label>
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeCoverPage} 
                      onChange={() => setExportOptions({...exportOptions, includeCoverPage: !exportOptions.includeCoverPage})}
                    />
                    <span className="text-sm">Include Cover Page</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-3 bg-blue-50 text-blue-800 text-sm flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Documents will be exported with 21 CFR Part 11 compliance information and audit trail details attached as metadata.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowExportDialog(false)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Document Dialog with Structured Content Blocks */}
      <Dialog open={newDocumentDialogOpen} onOpenChange={setNewDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Document with Structured Content</DialogTitle>
            <DialogDescription>
              Select a template and structured content blocks to include in your new document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Document Basic Information */}
            <div className="grid gap-3">
              <div className="text-sm font-medium">Document Information</div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="documentTitle" className="text-sm font-medium">
                    Document Title
                  </label>
                  <input
                    id="documentTitle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="moduleSelect" className="text-sm font-medium">
                    eCTD Module
                  </label>
                  <select
                    id="moduleSelect"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={documentModule}
                    onChange={(e) => setDocumentModule(e.target.value)}
                  >
                    <option value="">Select an eCTD module...</option>
                    <option value="2.2">Module 2.2 - Introduction</option>
                    <option value="2.3">Module 2.3 - Quality Overall Summary</option>
                    <option value="2.4">Module 2.4 - Nonclinical Overview</option>
                    <option value="2.5">Module 2.5 - Clinical Overview</option>
                    <option value="2.7.3">Module 2.7.3 - Summary of Clinical Efficacy</option>
                    <option value="2.7.4">Module 2.7.4 - Summary of Clinical Safety</option>
                    <option value="3.2">Module 3.2 - Body of Data (Quality)</option>
                    <option value="5.3.5.1">Module 5.3.5.1 - Study Reports of Controlled Clinical Studies</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Template Selection */}
            <div className="grid gap-3">
              <div className="text-sm font-medium">Document Template</div>
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                <div className="divide-y">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate?.id === template.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        
                        // Pre-select all content blocks that match the selected module
                        if (documentModule) {
                          const modulePrefix = documentModule.split('.')[0];
                          const matchingBlocks = [];
                          
                          // Only preselect blocks if they match the selected module
                          if (template.contentBlocks) {
                            template.contentBlocks.forEach(blockId => {
                              let block;
                              
                              if (blockId.startsWith('table-')) {
                                block = contentBlockRegistry.tables.find(t => t.id === blockId);
                              } else if (blockId.startsWith('narrative-')) {
                                block = contentBlockRegistry.narratives.find(n => n.id === blockId);
                              } else if (blockId.startsWith('figure-')) {
                                block = contentBlockRegistry.figures.find(f => f.id === blockId);
                              }
                              
                              if (block && block.section.startsWith(modulePrefix)) {
                                matchingBlocks.push(blockId);
                              }
                            });
                          }
                          
                          setSelectedContentBlocks(matchingBlocks);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-2">
                        <LayoutTemplate className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{template.category} • Updated {template.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Structured Content Blocks Selection */}
            {selectedTemplate && (
              <div className="grid gap-3">
                <div className="text-sm font-medium">Structured Content Blocks</div>
                <div className="text-xs text-gray-500 mb-2">
                  Select the content blocks you want to include in your document. These blocks will be inserted with proper ICH-compliant formatting.
                </div>
                
                {/* Display available content blocks for this template */}
                <div className="border rounded-md p-3 space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedTemplate.contentBlocks && selectedTemplate.contentBlocks.map(blockId => {
                    // Find the block in the registry
                    let block = null;
                    let blockType = '';
                    
                    if (blockId.startsWith('table-')) {
                      block = contentBlockRegistry.tables.find(t => t.id === blockId);
                      blockType = 'table';
                    } else if (blockId.startsWith('narrative-')) {
                      block = contentBlockRegistry.narratives.find(n => n.id === blockId);
                      blockType = 'narrative';
                    } else if (blockId.startsWith('figure-')) {
                      block = contentBlockRegistry.figures.find(f => f.id === blockId);
                      blockType = 'figure';
                    }
                    
                    if (!block) return null;
                    
                    // Color based on block type
                    const typeColors = {
                      table: 'bg-blue-50 border-blue-200',
                      narrative: 'bg-green-50 border-green-200',
                      figure: 'bg-purple-50 border-purple-200'
                    };
                    
                    const typeIcons = {
                      table: (
                        <svg className="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ),
                      narrative: (
                        <svg className="w-5 h-5 mr-2 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ),
                      figure: (
                        <svg className="w-5 h-5 mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )
                    };
                    
                    return (
                      <div 
                        key={blockId} 
                        className={`flex items-center p-3 border rounded-md ${typeColors[blockType]} relative`}
                      >
                        <input
                          type="checkbox"
                          id={`block-${blockId}`}
                          className="mr-3"
                          checked={selectedContentBlocks.includes(blockId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContentBlocks([...selectedContentBlocks, blockId]);
                            } else {
                              setSelectedContentBlocks(selectedContentBlocks.filter(id => id !== blockId));
                            }
                          }}
                        />
                        <label htmlFor={`block-${blockId}`} className="flex items-center flex-1 cursor-pointer">
                          {typeIcons[blockType]}
                          <div>
                            <div className="font-medium text-sm">{block.name}</div>
                            <div className="text-xs text-gray-600">Section {block.section}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {block.regions.join(', ')} • ICH Compliant: {block.metadata.ichCompliant ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </label>
                        
                        {/* Preview button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-2 top-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Content Block Preview",
                              description: `Preview for ${block.name} (Section ${block.section})`,
                              variant: "default",
                            });
                            // Show preview in a dialog (this would be implemented in a full version)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setNewDocumentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={!selectedTemplate || !documentTitle || selectedContentBlocks.length === 0 || !documentModule}
              onClick={async () => {
                try {
                  toast({
                    title: "Creating New Document",
                    description: "Setting up a new Google Doc with structured content blocks...",
                    variant: "default",
                  });
                  
                  // Build the structured content from selected blocks
                  let structuredContent = `# ${documentTitle}\n\n`;
                  structuredContent += `This document was created from the TrialSage eCTD Co-Author Module using structured content blocks.\n\n`;
                  
                  // Add each selected content block's HTML template
                  selectedContentBlocks.forEach(blockId => {
                    let block = null;
                    
                    if (blockId.startsWith('table-')) {
                      block = contentBlockRegistry.tables.find(t => t.id === blockId);
                    } else if (blockId.startsWith('narrative-')) {
                      block = contentBlockRegistry.narratives.find(n => n.id === blockId);
                    } else if (blockId.startsWith('figure-')) {
                      block = contentBlockRegistry.figures.find(f => f.id === blockId);
                    }
                    
                    if (block) {
                      structuredContent += `## Section ${block.section}: ${block.name}\n\n`;
                      structuredContent += block.template;
                      structuredContent += '\n\n';
                    }
                  });
                  
                  // Create a new document using our service
                  const result = await googleDocsService.createNewDoc(
                    googleDocsService.getDocumentId('module_2_5'), // Base template
                    documentTitle,
                    { 
                      initialContent: structuredContent,
                      organizationId: 1 // Use default organization ID
                    }
                  );
                  
                  // Set as the selected document
                  setSelectedDocument({
                    id: result.documentId,
                    title: result.title,
                    url: result.url,
                    date: new Date().toLocaleDateString(),
                    status: "Draft",
                    module: documentModule
                  });
                  
                  // Close the dialog
                  setNewDocumentDialogOpen(false);
                  
                  // Open the document editor after creation
                  setTimeout(() => {
                    setGoogleDocsPopupOpen(true);
                  }, 500);
                } catch (error) {
                  console.error("Error creating document:", error);
                  toast({
                    title: "Error Creating Document",
                    description: "There was an error creating your document. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}