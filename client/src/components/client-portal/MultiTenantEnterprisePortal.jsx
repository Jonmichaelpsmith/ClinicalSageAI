/**
 * Multi-Tenant Enterprise Client Portal - Premium Edition
 * 
 * This component provides a comprehensive multi-tenant enterprise hub for organizations,
 * supporting CRO clients with sub-clients and sub-projects, with full Lument ASSISTANT AI
 * integrated across all modules.
 * 
 * Features:
 * - Multi-tenant architecture with organization → client → sub-client hierarchy
 * - Project management across multiple client workspaces
 * - Global navigation with key sections accessible to all authorized roles
 * - Dynamic personalization based on organization, team, and user
 * - Lument ASSISTANT AI integration across all modules
 * - Advanced reporting with multi-client aggregation capabilities
 * - Context-aware security based on tenant hierarchy
 * - Microsoft 365-quality design system with role-specific adaptations
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Users, 
  Building, 
  ArrowLeft, 
  FileText, 
  BookOpen, 
  BarChart2, 
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Search,
  Plus,
  RefreshCw,
  Shield,
  Zap,
  Layout,
  Layers,
  Activity,
  Folder,
  Database,
  BarChartHorizontal,
  BookMarked,
  ClipboardList,
  Lightbulb,
  Beaker,
  Network,
  Share2,
  ListChecks,
  Settings,
  Briefcase,
  ArrowUpRight,
  ChevronRight,
  Globe,
  LineChart,
  PieChart,
  UserCog,
  Lock,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Github,
  BarChart,
  Award,
  Edit3,
  Download,
  Server,
  Grid,
  FileCheck,
  Upload,
  File,
  Check,
  Sparkles,
  ChevronDown,
  X,
  User,
  UserPlus,
  Brain,
  Cpu,
  Bot,
  ExternalLink,
  List,
  Layers3,
  Boxes,
  FolderTree,
  Send,
  Info,
  AlertTriangle
} from 'lucide-react';
import securityService from '../../services/SecurityService';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';
import { useToast } from '@/hooks/use-toast';
import ProjectManagerGrid from '../project-manager/ProjectManagerGrid';
import VaultQuickAccess from '../VaultQuickAccess';
import AnalyticsQuickView from '../AnalyticsQuickView';
import NextActionsSidebar from '../NextActionsSidebar';
import ReportsQuickWidget from '../ReportsQuickWidget';

// Dropdown Menu Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Lument ASSISTANT AI Component
const LumentAssistant = ({ active = false, context }) => {
  const [isOpen, setIsOpen] = useState(active);
  const [assistantMode, setAssistantMode] = useState('proactive');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'Lument ASSISTANT AI is ready to help you with your regulatory and clinical documents.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [capabilities, setCapabilities] = useState([
    { id: 'doc-analysis', name: 'Document Analysis', icon: <FileCheck size={14} /> },
    { id: 'reg-insights', name: 'Regulatory Insights', icon: <BookMarked size={14} /> },
    { id: 'protocol-design', name: 'Protocol Design', icon: <Edit3 size={14} /> },
    { id: 'submission-prep', name: 'Submission Preparation', icon: <ClipboardList size={14} /> },
    { id: 'data-summary', name: 'Data Summarization', icon: <BarChart size={14} /> }
  ]);
  
  // Simulate an AI suggestion based on context
  useEffect(() => {
    if (isOpen && context) {
      const contextType = context.type || 'general';
      const contextId = context.id || null;
      
      if (contextType && contextId && messages.length === 1) {
        setIsProcessing(true);
        
        setTimeout(() => {
          let suggestion = '';
          
          if (contextType === 'project') {
            suggestion = `I notice you're working on project "${context.name}". Would you like me to help with:
            
1. Analyzing the current project timeline
2. Suggesting regulatory strategies based on your development phase
3. Reviewing document completeness for your upcoming submission`;
          } else if (contextType === 'document') {
            suggestion = `I see you're viewing document "${context.name}". I can help with:
            
1. Analyzing this document for regulatory compliance
2. Extracting key insights from the content
3. Suggesting improvements to strengthen your submission`;
          } else if (contextType === 'client') {
            suggestion = `I see you're working with client "${context.name}". Based on their portfolio, I can:
            
1. Provide a summary of active regulatory projects
2. Suggest optimizations for their current submission strategy
3. Identify potential gaps in documentation`;
          }
          
          if (suggestion) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'assistant',
              content: suggestion,
              timestamp: new Date().toISOString()
            }]);
          }
          
          setIsProcessing(false);
        }, 1200);
      }
    }
  }, [isOpen, context]);
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    }]);
    
    setIsProcessing(true);
    setUserInput('');
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (userInput.toLowerCase().includes('protocol') && userInput.toLowerCase().includes('review')) {
        response = `I'd be happy to help review your protocol. To perform a comprehensive analysis, I'll need:

1. The full protocol document (you can upload it here)
2. Any specific regulatory framework you're targeting (FDA, EMA, etc.)
3. The therapeutic area and phase of development

Once I have this information, I can provide a detailed review including:
- Regulatory compliance assessment
- Statistical methodology evaluation
- Endpoint selection analysis
- Potential operational challenges

Would you like to proceed with this analysis?`;
      } else if (userInput.toLowerCase().includes('submission') || userInput.toLowerCase().includes('ind')) {
        response = `For your IND submission preparation, here's what I recommend:

1. **Module 1 (Administrative Information)**:
   - Current status: 85% complete
   - Missing: Final Form 1571 signatures

2. **Module 2 (Summaries)**:
   - Current status: 70% complete
   - Recommended focus: Strengthen nonclinical overview section with recent toxicology data

3. **Module 3 (Quality)**:
   - Current status: 90% complete
   - Well-documented manufacturing process

4. **Module 4 (Nonclinical)**:
   - Current status: 80% complete
   - Consider adding comparative analysis with similar compounds

5. **Module 5 (Clinical)**:
   - Current status: 75% complete
   - Add additional analysis of preliminary efficacy signals

Would you like me to generate a detailed readiness report for any specific module?`;
      } else if (userInput.toLowerCase().includes('timeline') || userInput.toLowerCase().includes('schedule')) {
        response = `Based on your current project progression and regulatory timelines, here's my analysis:

**Critical Path Items:**
- CMC stability data (due in 3 weeks)
- Final clinical study report for Study XYZ-001 (4 weeks behind schedule)
- Toxicology report finalization (on schedule)

**Recommended Timeline Adjustments:**
1. Consider parallel processing of CMC and clinical documentation
2. Prioritize statistical analysis of primary endpoints to recover clinical report timing
3. Begin regulatory agency meeting preparation now to avoid delays

I estimate these adjustments could recover 2-3 weeks in your submission timeline. Would you like me to create a detailed recovery plan?`;
      } else {
        response = `I understand you're interested in "${userInput}". Based on your current context, I can help in several ways:

1. Provide specific guidance on regulatory requirements
2. Analyze your current documentation for completeness
3. Suggest optimization strategies for your submission
4. Generate templates or draft content aligned with regulatory expectations

What specific aspect would you like me to focus on?`;
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }]);
      
      setIsProcessing(false);
    }, 2000);
  };
  
  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-700"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={16} />
        <span>Lument ASSISTANT</span>
      </Button>
    );
  }
  
  return (
    <Card className="border border-indigo-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
      <CardHeader className="bg-indigo-50 pb-3 px-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-700 text-lg">Lument ASSISTANT</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Cpu size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Assistant Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAssistantMode('proactive')}
                  className={assistantMode === 'proactive' ? 'bg-indigo-50' : ''}
                >
                  <Zap size={14} className="mr-2" />
                  <span>Proactive</span>
                  {assistantMode === 'proactive' && (
                    <CheckCircle size={14} className="ml-auto text-indigo-600" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAssistantMode('focused')}
                  className={assistantMode === 'focused' ? 'bg-indigo-50' : ''}
                >
                  <Lightbulb size={14} className="mr-2" />
                  <span>Focused</span>
                  {assistantMode === 'focused' && (
                    <CheckCircle size={14} className="ml-auto text-indigo-600" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAssistantMode('minimal')}
                  className={assistantMode === 'minimal' ? 'bg-indigo-50' : ''}
                >
                  <Clock size={14} className="mr-2" />
                  <span>Minimal</span>
                  {assistantMode === 'minimal' && (
                    <CheckCircle size={14} className="ml-auto text-indigo-600" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X size={14} />
            </Button>
          </div>
        </div>
        <CardDescription className="text-indigo-700/80">
          AI-powered assistance for regulatory and clinical documentation
        </CardDescription>
      </CardHeader>
      <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/30 px-4 py-2 flex-shrink-0">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {capabilities.map(capability => (
            <Badge 
              key={capability.id}
              variant="outline" 
              className="bg-white/80 text-indigo-700 border-indigo-200 whitespace-nowrap flex items-center gap-1 shadow-sm"
            >
              {capability.icon}
              <span>{capability.name}</span>
            </Badge>
          ))}
        </div>
      </div>
      <CardContent className="p-0 flex-grow overflow-auto">
        <div className="p-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot size={16} className="text-indigo-600" />
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-white' 
                  : message.type === 'system'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-indigo-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-line text-sm">{message.content}</div>
              </div>
              
              {message.type === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ml-2 flex-shrink-0">
                  <User size={16} className="text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="bg-indigo-100 text-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask me anything about your regulatory documents..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isProcessing || !userInput.trim()}>
            <Send size={16} className="mr-2" />
            <span>Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Client Tree Component
const ClientWorkspaceTree = ({ organizations, clients, currentOrg, currentClient, onSelectOrg, onSelectClient }) => {
  return (
    <div className="p-4">
      <h3 className="font-medium mb-3 text-gray-800">Organizations & Clients</h3>
      <div className="space-y-3">
        {organizations.map(org => (
          <div key={org.id} className="space-y-2">
            <div 
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                currentOrg?.id === org.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectOrg(org.id)}
            >
              <Building size={16} className="mr-2" />
              <span className="font-medium">{org.name}</span>
              {org.type === 'cro' && (
                <Badge variant="outline" className="ml-2 text-xs">CRO</Badge>
              )}
            </div>
            
            {/* Show clients under this org if it's the current org */}
            {currentOrg?.id === org.id && clients.filter(c => c.organizationId === org.id).map(client => (
              <div key={client.id} className="pl-6">
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    currentClient?.id === client.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectClient(client.id)}
                >
                  <Users size={14} className="mr-2" />
                  <span>{client.name}</span>
                </div>
                
                {/* Sub-clients would go here */}
                {client.subClients && client.subClients.length > 0 && currentClient?.id === client.id && (
                  <div className="pl-4 mt-2 space-y-2">
                    {client.subClients.map(subClient => (
                      <div 
                        key={subClient.id}
                        className="flex items-center p-1.5 rounded-md cursor-pointer hover:bg-gray-100"
                      >
                        <User size={12} className="mr-2" />
                        <span className="text-sm">{subClient.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Project KPI Card Component
const ProjectKPICard = ({ title, value, target, icon, change, trend }) => {
  const percentComplete = Math.min(100, Math.round((value / target) * 100));
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-gray-700">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500 ml-1">/ {target}</span>
          </div>
          
          <div className="mt-2">
            <Progress value={percentComplete} className="h-2" />
          </div>
          
          <div className="flex items-center mt-2">
            <span className={`text-sm ${trendColor} font-medium flex items-center`}>
              {trend === 'up' ? 
                <ArrowUpRight size={14} className="mr-1" /> : 
                trend === 'down' ? 
                <ArrowLeft size={14} className="mr-1 transform rotate-90" /> : 
                null
              }
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Multi-Tenant Enterprise Client Portal Component
const MultiTenantEnterprisePortal = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [organizations, setOrganizations] = useState([]);
  const [clients, setClients] = useState([]);
  const [subClients, setSubClients] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [currentSubClient, setCurrentSubClient] = useState(null);
  const [parentOrganization, setParentOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    components: {
      database: { status: 'healthy', latency: 32 },
      storage: { status: 'healthy', latency: 18 },
      api: { status: 'healthy', latency: 45 },
      cache: { status: 'healthy', latency: 8 }
    }
  });
  const [treeViewOpen, setTreeViewOpen] = useState(false);
  
  // Client workspace selection state
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  
  // User profile and personalization
  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: null,
    role: "Administrator",
    preferences: {
      theme: "light",
      notifications: true,
      dashboardLayout: "default"
    }
  });
  
  // AI Assistant context
  const [assistantContext, setAssistantContext] = useState(null);
  
  // Create a fallback object if ModuleIntegrationProvider is not available
  let moduleIntegration = {
    getSharedContext: () => ({}),
    shareContext: () => {} 
  };
  
  try {
    // Attempt to use the hook, but don't crash if the provider isn't available
    moduleIntegration = useModuleIntegration();
  } catch (error) {
    console.log('ModuleIntegration not available, using fallback');
  }
  
  // Fetch client data on mount
  useEffect(() => {
    const initClientPortal = async () => {
      try {
        // Get organization list
        const orgList = securityService.getAccessibleOrganizations() || [];
        setOrganizations(orgList);
        
        // Set the current organization if available, otherwise use the first one in the list
        const defaultOrg = securityService.currentOrganization || (orgList.length > 0 ? orgList[0] : null);
        const parentOrg = securityService.parentOrganization;
        
        if (defaultOrg) {
          setCurrentOrganization(defaultOrg);
          setParentOrganization(parentOrg);
          
          // Share client context with other modules (if available)
          if (moduleIntegration.shareContext) {
            moduleIntegration.shareContext('organization', defaultOrg.id, {
              organization: defaultOrg,
              parentOrganization: parentOrg
            });
          }
          
          // Fetch clients for this organization
          await fetchClients(defaultOrg.id);
          
          // Set user profile
          if (securityService.currentUser) {
            setUserProfile({
              ...userProfile,
              id: securityService.currentUser.id,
              name: `${securityService.currentUser.firstName} ${securityService.currentUser.lastName}`,
              email: securityService.currentUser.email
            });
            
            // Set user role
            const roles = securityService.getUserRoles();
            if (roles && roles.length > 0) {
              setUserRole(roles[0]);
            }
          }
          
          // Load user teams (simulated)
          setUserTeams([
            {id: 'team-1', name: 'Clinical Operations', role: 'Member'},
            {id: 'team-2', name: 'Regulatory Affairs', role: 'Lead'},
            {id: 'team-3', name: 'Data Management', role: 'Member'}
          ]);
          
          // Simulate notifications
          setNotifications([
            {id: 'notif-1', title: 'Document requires approval', type: 'action', unread: true, time: '1h ago'},
            {id: 'notif-2', title: 'New comment on IND submission', type: 'comment', unread: true, time: '3h ago'},
            {id: 'notif-3', title: 'Meeting scheduled for tomorrow', type: 'meeting', unread: false, time: '1d ago'},
            {id: 'notif-4', title: 'Task deadline approaching', type: 'reminder', unread: false, time: '2d ago'}
          ]);
          
          // Set AI Assistant context to current organization
          setAssistantContext({
            type: 'organization',
            id: defaultOrg.id,
            name: defaultOrg.name
          });
          
          // Load initial data for the selected organization
          await loadOrganizationData();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing client portal:', err);
        setError(err.message);
        setLoading(false);
        
        toast({
          title: "Initialization Error",
          description: `Could not initialize client portal: ${err.message}`,
          variant: "destructive"
        });
      }
    };
    
    initClientPortal();
  }, []);
  
  // Add a useEffect to reload data when currentOrganization changes
  useEffect(() => {
    if (currentOrganization) {
      // Load data for the selected organization
      const loadData = async () => {
        try {
          // Fetch clients for this organization
          await fetchClients(currentOrganization.id);
          
          // Load organization data
          await loadOrganizationData();
          
          // Update AI context
          setAssistantContext({
            type: 'organization',
            id: currentOrganization.id,
            name: currentOrganization.name
          });
        } catch (err) {
          console.error("Error loading organization data:", err);
          setError(err.message);
          
          toast({
            title: "Data Loading Error",
            description: `Failed to load organization data: ${err.message}`,
            variant: "destructive"
          });
        }
      };
      
      loadData();
      
      // Reset current client and sub-client when changing organization
      setCurrentClient(null);
      setCurrentSubClient(null);
      
      // Log the current organization to confirm changes
      console.log("Current organization updated:", currentOrganization.name);
    }
  }, [currentOrganization]);
  
  // Add effect for client change
  useEffect(() => {
    if (currentClient) {
      // Load client projects
      loadClientProjects(currentClient.id);
      
      // Update AI context
      setAssistantContext({
        type: 'client',
        id: currentClient.id,
        name: currentClient.name,
        organizationId: currentClient.organizationId
      });
      
      console.log("Current client updated:", currentClient.name);
    }
  }, [currentClient]);
  
  // Add effect for project selection
  useEffect(() => {
    if (selectedProject) {
      // Update AI context
      setAssistantContext({
        type: 'project',
        id: selectedProject.id,
        name: selectedProject.name,
        clientId: selectedProject.clientId,
        organizationId: selectedProject.organizationId
      });
      
      console.log("Selected project updated:", selectedProject.name);
    }
  }, [selectedProject]);
  
  // Fetch clients for an organization
  const fetchClients = async (organizationId) => {
    try {
      // In a real implementation, this would be an API call
      // Using mock data for demonstration
      const clientList = [
        {
          id: 'client-1',
          name: 'BioPharm Research',
          organizationId: 'org-001',
          type: 'sponsor',
          status: 'active',
          projects: 5,
          subClients: [
            { id: 'subclient-1', name: 'BioPharm Oncology Division', parentId: 'client-1' },
            { id: 'subclient-2', name: 'BioPharm Neurology Division', parentId: 'client-1' }
          ]
        },
        {
          id: 'client-2',
          name: 'MedDevice Innovations',
          organizationId: 'org-001',
          type: 'sponsor',
          status: 'active',
          projects: 3,
          subClients: [
            { id: 'subclient-3', name: 'MedDevice Cardio Division', parentId: 'client-2' }
          ]
        },
        {
          id: 'client-3',
          name: 'GeneTech Solutions',
          organizationId: 'org-001',
          type: 'sponsor',
          status: 'active',
          projects: 2,
          subClients: []
        },
        {
          id: 'client-4',
          name: 'NeuroWave Research',
          organizationId: 'org-002',
          type: 'sponsor',
          status: 'active',
          projects: 4,
          subClients: []
        }
      ];
      
      // Filter clients by organization
      const filteredClients = clientList.filter(
        client => client.organizationId === organizationId
      );
      
      // Update clients state
      setClients(filteredClients);
      
      // Collect all sub-clients
      const allSubClients = filteredClients.flatMap(
        client => client.subClients || []
      );
      
      // Update sub-clients state
      setSubClients(allSubClients);
      
      return filteredClients;
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast({
        title: "Client Fetch Error",
        description: `Could not load clients: ${err.message}`,
        variant: "destructive"
      });
      return [];
    }
  };
  
  // Load client projects
  const loadClientProjects = async (clientId) => {
    try {
      // In a real implementation, this would be an API call
      const clientProjectList = [
        {
          id: 'cp-1',
          name: 'Phase II Clinical Trial - BTX-112',
          clientId: 'client-1',
          organizationId: 'org-001',
          status: 'in_progress',
          module: 'trial-vault',
          progress: 65,
          dueDate: '2025-06-15',
          priority: 'high'
        },
        {
          id: 'cp-2',
          name: 'IND Application - BTX-112',
          clientId: 'client-1',
          organizationId: 'org-001',
          status: 'in_progress',
          module: 'ind-wizard',
          progress: 42,
          dueDate: '2025-05-30',
          priority: 'high'
        },
        {
          id: 'cp-3',
          name: 'Protocol Development - BTX-115',
          clientId: 'client-1',
          organizationId: 'org-001',
          status: 'not_started',
          module: 'study-architect',
          progress: 0,
          dueDate: '2025-07-21',
          priority: 'medium'
        },
        {
          id: 'cp-4',
          name: 'Device 510(k) Submission',
          clientId: 'client-2',
          organizationId: 'org-001',
          status: 'in_progress',
          module: 'ind-wizard',
          progress: 75,
          dueDate: '2025-06-10',
          priority: 'high'
        },
        {
          id: 'cp-5',
          name: 'Clinical Study Report - GTS-001',
          clientId: 'client-3',
          organizationId: 'org-001',
          status: 'pending_review',
          module: 'csr-intelligence',
          progress: 95,
          dueDate: '2025-05-10',
          priority: 'medium'
        }
      ];
      
      // Filter projects by client
      const filteredProjects = clientProjectList.filter(
        project => project.clientId === clientId
      );
      
      // Update client projects state
      setClientProjects(filteredProjects);
      
      // If we have projects and no currently selected project, select the first one
      if (filteredProjects.length > 0 && !selectedProject) {
        setSelectedProject(filteredProjects[0]);
      }
      
      return filteredProjects;
    } catch (err) {
      console.error('Error loading client projects:', err);
      toast({
        title: "Project Loading Error",
        description: `Failed to load client projects: ${err.message}`,
        variant: "destructive"
      });
      return [];
    }
  };
  
  // Load organization data when organization changes
  const loadOrganizationData = async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      
      // In a real app, these would be API calls
      // Fetch projects
      const projectList = await fetchProjects(currentOrganization.id);
      setProjects(projectList);
      
      // Set a selected project if none is selected yet
      if (!selectedProject && projectList.length > 0) {
        setSelectedProject(projectList[0]);
      }
      
      // Fetch recent documents
      const docList = await fetchDocuments(currentOrganization.id);
      setDocuments(docList);
      
      // Fetch recent activities
      const activityList = await fetchActivities(currentOrganization.id);
      setActivities(activityList);
      
      // Update security service
      if (securityService.currentOrganization?.id !== currentOrganization.id) {
        securityService.switchOrganization(currentOrganization.id);
      }
      
      setLoading(false);
      
      toast({
        title: "Data Refreshed",
        description: "Latest organization data has been loaded",
      });
    } catch (err) {
      console.error('Error loading organization data:', err);
      setError(`Error loading organization data: ${err.message}`);
      setLoading(false);
      
      toast({
        title: "Data Refresh Failed",
        description: `Could not load latest data: ${err.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle organization change
  const handleOrganizationChange = async (newOrgId) => {
    const newOrg = organizations.find(org => org.id === newOrgId);
    if (newOrg) {
      try {
        // Update the organization in SecurityService first
        await securityService.switchOrganization(newOrgId, {
          notifySubscribers: true,
          updateRoutes: false
        });
        
        // Then update our local state - this will trigger the useEffect
        setCurrentOrganization(newOrg);
        console.log(`Switching to organization: ${newOrg.name} (${newOrg.id})`);
        setSelectedProject(null);
        
        toast({
          title: "Organization Changed",
          description: `Now viewing ${newOrg.name}`,
        });
        
        // No need to explicitly call loadOrganizationData here
        // as it's now handled by the useEffect that watches currentOrganization
      } catch (err) {
        console.error('Error switching organization:', err);
        
        toast({
          title: "Switch Failed",
          description: `Could not switch to ${newOrg.name}: ${err.message}`,
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle client selection
  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setCurrentClient(selectedClient);
      setCurrentSubClient(null); // Reset sub-client when changing client
      
      toast({
        title: "Client Selected",
        description: `Now viewing ${selectedClient.name}`,
      });
    }
  };
  
  // Handle sub-client selection
  const handleSubClientSelect = (subClientId) => {
    const selectedSubClient = subClients.find(subClient => subClient.id === subClientId);
    if (selectedSubClient) {
      setCurrentSubClient(selectedSubClient);
      
      toast({
        title: "Sub-Client Selected",
        description: `Now viewing ${selectedSubClient.name}`,
      });
    }
  };
  
  // Handle return to CRO portal
  const handleReturnToCRO = async () => {
    try {
      const result = await securityService.returnToParentOrganization();
      
      if (result.success) {
        toast({
          title: "Returning to CRO Portal",
          description: "You will be redirected to the CRO administration portal",
        });
        
        // Redirect to CRO dashboard (admin)
        window.location.href = '/admin'; // Using window.location for immediate navigation
      } else {
        setError(result.error || 'Failed to return to CRO portal');
        
        toast({
          title: "Navigation Failed",
          description: result.error || 'Failed to return to CRO portal',
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error returning to CRO portal:', err);
      setError(err.message);
      
      toast({
        title: "Navigation Error",
        description: `Error returning to CRO portal: ${err.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    // In a real app, would navigate to search results
    console.log(`Searching for: ${searchQuery}`);
    setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  // Navigate to a module
  const navigateToModule = (module) => {
    console.log(`Navigating to module: ${module}`);
    setLocation(`/${module}`);
  };
  
  // Fetch projects (simulated for demo)
  const fetchProjects = async (orgId) => {
    // In a real app, would be an API call
    return [
      {
        id: 1,
        name: 'Phase II Clinical Trial - BX-107',
        status: 'in_progress',
        module: 'trial-vault',
        progress: 65,
        dueDate: '2025-06-15',
        team: 'Clinical Operations',
        priority: 'high',
        organizationId: 'org-001',
        clientId: 'client-1',
        kpis: [
          { id: 'kpi-1', name: 'Patient Enrollment', value: 42, target: 65, change: '+8%', trend: 'up' },
          { id: 'kpi-2', name: 'Protocol Deviations', value: 3, target: 10, change: '-2%', trend: 'up' },
          { id: 'kpi-3', name: 'Data Completion', value: 65, target: 100, change: '+5%', trend: 'up' },
          { id: 'kpi-4', name: 'Site Activation', value: 8, target: 10, change: '0%', trend: 'neutral' }
        ]
      },
      {
        id: 2,
        name: 'IND Application for BTX-331',
        status: 'in_progress',
        module: 'ind-wizard',
        progress: 42,
        dueDate: '2025-05-30',
        team: 'Regulatory Affairs',
        priority: 'high',
        organizationId: 'org-001',
        clientId: 'client-2',
        kpis: [
          { id: 'kpi-1', name: 'Module Completion', value: 12, target: 28, change: '+15%', trend: 'up' },
          { id: 'kpi-2', name: 'Review Cycles', value: 2, target: 3, change: '0%', trend: 'neutral' },
          { id: 'kpi-3', name: 'Document Approvals', value: 18, target: 42, change: '+12%', trend: 'up' },
          { id: 'kpi-4', name: 'Quality Metrics', value: 85, target: 100, change: '+3%', trend: 'up' }
        ]
      },
      {
        id: 3,
        name: 'Clinical Study Report - Phase I',
        status: 'pending_review',
        module: 'csr-intelligence',
        progress: 95,
        dueDate: '2025-05-10',
        team: 'Clinical Operations',
        priority: 'medium',
        organizationId: 'org-001',
        clientId: 'client-3',
        kpis: [
          { id: 'kpi-1', name: 'Section Completion', value: 19, target: 20, change: '+5%', trend: 'up' },
          { id: 'kpi-2', name: 'Data Tables', value: 45, target: 45, change: '+15%', trend: 'up' },
          { id: 'kpi-3', name: 'QC Findings', value: 5, target: 20, change: '-30%', trend: 'up' },
          { id: 'kpi-4', name: 'Reviewer Approvals', value: 3, target: 4, change: '+50%', trend: 'up' }
        ]
      },
      {
        id: 4,
        name: 'Study Protocol Development',
        status: 'not_started',
        module: 'study-architect',
        progress: 0,
        dueDate: '2025-07-21',
        team: 'Clinical Operations',
        priority: 'low',
        organizationId: 'org-001',
        clientId: 'client-1',
        kpis: [
          { id: 'kpi-1', name: 'Section Drafts', value: 0, target: 12, change: '0%', trend: 'neutral' },
          { id: 'kpi-2', name: 'Review Cycles', value: 0, target: 3, change: '0%', trend: 'neutral' },
          { id: 'kpi-3', name: 'Stakeholder Input', value: 2, target: 8, change: '+100%', trend: 'up' },
          { id: 'kpi-4', name: 'SAP Progress', value: 10, target: 100, change: '+10%', trend: 'up' }
        ]
      }
    ];
  };
  
  // Fetch documents (simulated for demo)
  const fetchDocuments = async (orgId) => {
    // In a real app, would be an API call
    return [
      {
        id: 1,
        name: 'BX-107 Protocol.docx',
        type: 'protocol',
        module: 'study-architect',
        updatedAt: '2025-04-25T15:30:00Z',
        updatedBy: 'John Davis',
        clientId: 'client-1',
        organizationId: 'org-001'
      },
      {
        id: 2,
        name: 'BTX-331 Investigator Brochure.pdf',
        type: 'brochure',
        module: 'ind-wizard',
        updatedAt: '2025-04-24T09:15:00Z',
        updatedBy: 'Sarah Johnson',
        clientId: 'client-2',
        organizationId: 'org-001'
      },
      {
        id: 3,
        name: 'Phase I CSR Draft.docx',
        type: 'report',
        module: 'csr-intelligence',
        updatedAt: '2025-04-23T11:45:00Z',
        updatedBy: 'Mark Wilson',
        clientId: 'client-3',
        organizationId: 'org-001'
      },
      {
        id: 4,
        name: 'BTX-331 Chemistry Data.xlsx',
        type: 'data',
        module: 'ind-wizard',
        updatedAt: '2025-04-22T14:20:00Z',
        updatedBy: 'Emily Chen',
        clientId: 'client-2',
        organizationId: 'org-001'
      }
    ];
  };
  
  // Fetch activities (simulated for demo)
  const fetchActivities = async (orgId) => {
    // In a real app, would be an API call
    return [
      {
        id: 1,
        type: 'document_updated',
        description: 'BX-107 Protocol updated',
        timestamp: '2025-04-25T15:30:00Z',
        user: 'John Davis',
        module: 'study-architect',
        clientId: 'client-1',
        organizationId: 'org-001'
      },
      {
        id: 2,
        type: 'task_completed',
        description: 'Phase I CSR Quality Check completed',
        timestamp: '2025-04-24T16:45:00Z',
        user: 'Sarah Johnson',
        module: 'csr-intelligence',
        clientId: 'client-3',
        organizationId: 'org-001'
      },
      {
        id: 3,
        type: 'comment_added',
        description: 'Comment added to BTX-331 IND application',
        timestamp: '2025-04-24T10:15:00Z',
        user: 'Mark Wilson',
        module: 'ind-wizard',
        clientId: 'client-2',
        organizationId: 'org-001'
      },
      {
        id: 4,
        type: 'meeting_scheduled',
        description: 'FDA Meeting scheduled for May 10',
        timestamp: '2025-04-23T09:30:00Z',
        user: 'Emily Chen',
        module: 'ind-wizard',
        clientId: 'client-2',
        organizationId: 'org-001'
      },
      {
        id: 5,
        type: 'document_shared',
        description: 'Phase I CSR shared with regulatory team',
        timestamp: '2025-04-22T14:20:00Z',
        user: 'Emily Chen',
        module: 'csr-intelligence',
        clientId: 'client-3',
        organizationId: 'org-001'
      }
    ];
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHr < 24) {
      return `${diffHr}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return formatDate(timestamp);
    }
  };
  
  // Get status icon and text
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle size={16} className="text-green-500" />,
          text: 'Completed',
          className: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'in_progress':
        return { 
          icon: <Clock size={16} className="text-blue-500" />,
          text: 'In Progress',
          className: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'pending_review':
        return { 
          icon: <AlertCircle size={16} className="text-yellow-500" />,
          text: 'Pending Review',
          className: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'not_started':
        return { 
          icon: <Calendar size={16} className="text-gray-500" />,
          text: 'Not Started',
          className: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      default:
        return { 
          icon: <Clock size={16} className="text-gray-500" />,
          text: 'Unknown',
          className: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-700">Normal</Badge>;
    }
  };
  
  // Get module icon
  const getModuleIcon = (module) => {
    switch (module) {
      case 'ind-wizard':
        return <FileText size={16} className="text-primary" />;
      case 'trial-vault':
        return <Building size={16} className="text-primary" />;
      case 'csr-intelligence':
        return <BookOpen size={16} className="text-primary" />;
      case 'study-architect':
        return <Users size={16} className="text-primary" />;
      case 'analytics':
        return <BarChart2 size={16} className="text-primary" />;
      default:
        return <FileText size={16} className="text-primary" />;
    }
  };
  
  // Get team badge
  const getTeamBadge = (team) => {
    switch (team) {
      case 'Clinical Operations':
        return <Badge variant="outline" className="bg-purple-100 border-purple-200 text-purple-700">{team}</Badge>;
      case 'Regulatory Affairs':
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700">{team}</Badge>;
      case 'Data Management':
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">{team}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-700">{team}</Badge>;
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'action':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'comment':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'meeting':
        return <Calendar size={16} className="text-purple-500" />;
      case 'reminder':
        return <Bell size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };
  
  // Format KPI icon
  const getKPIIcon = (name) => {
    if (name.toLowerCase().includes('enrollment') || name.toLowerCase().includes('patient')) {
      return <Users size={16} />;
    } else if (name.toLowerCase().includes('completion') || name.toLowerCase().includes('progress')) {
      return <CheckCircle size={16} />;
    } else if (name.toLowerCase().includes('deviation') || name.toLowerCase().includes('finding')) {
      return <AlertCircle size={16} />;
    } else if (name.toLowerCase().includes('review') || name.toLowerCase().includes('approval')) {
      return <FileCheck size={16} />;
    } else if (name.toLowerCase().includes('site') || name.toLowerCase().includes('activation')) {
      return <Building size={16} />;
    } else if (name.toLowerCase().includes('data') || name.toLowerCase().includes('table')) {
      return <Database size={16} />;
    } else if (name.toLowerCase().includes('quality') || name.toLowerCase().includes('metric')) {
      return <Award size={16} />;
    } else {
      return <BarChart size={16} />;
    }
  };
  
  // Step 4: Render the landing page when no organization is selected
  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <Building size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to TrialSage</h2>
          <p className="text-gray-600 mb-4">Please select an organization to continue.</p>
          {error && (
            <div className="text-red-500 mb-4 flex items-center justify-center">
              <AlertCircle size={16} className="mr-1" />
              <span>{error}</span>
            </div>
          )}
          {organizations.length > 0 ? (
            <div className="space-y-2">
              {organizations.map(org => (
                <button 
                  key={org.id}
                  onClick={() => {
                    setCurrentOrganization(org);
                    securityService.switchOrganization(org.id);
                  }}
                  className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 flex items-center justify-center"
                >
                  <Building size={16} className="mr-2" />
                  {org.name}
                </button>
              ))}
            </div>
          ) : loading ? (
            <div className="animate-pulse p-4">Loading organizations...</div>
          ) : (
            <button 
              onClick={() => {
                const testOrg = { 
                  id: 'org-001', 
                  name: 'Acme CRO', 
                  type: 'cro',
                  role: 'Administrator',
                  clients: 5,
                  lastUpdated: '2025-05-10'
                };
                setCurrentOrganization(testOrg);
                setOrganizations([testOrg]);
              }}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              Use Test Organization
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Show the dashboard when organization is selected
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Global Navigation Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-lg text-gray-900">TrialSage</span>
              </Link>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Organization Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{currentOrganization?.name || 'Select Organization'}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organizations.map(org => (
                    <DropdownMenuItem 
                      key={org.id} 
                      onClick={() => handleOrganizationChange(org.id)}
                      className="cursor-pointer"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      <span>{org.name}</span>
                      {org.id === currentOrganization?.id && (
                        <CheckCircle className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Client Workspace Selector - Only visible when organization is selected */}
              {currentOrganization && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">
                          {currentClient ? currentClient.name : 'Select Client'}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                      <DropdownMenuLabel>Clients</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {clients.length > 0 ? clients.map(client => (
                        <DropdownMenuItem 
                          key={client.id} 
                          onClick={() => handleClientSelect(client.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span className="truncate">{client.name}</span>
                            </div>
                            <div className="pl-6 text-xs text-gray-500">
                              {client.projects} {client.projects === 1 ? 'project' : 'projects'}
                            </div>
                          </div>
                          {client.id === currentClient?.id && (
                            <CheckCircle className="h-4 w-4 ml-2 text-primary flex-shrink-0" />
                          )}
                        </DropdownMenuItem>
                      )) : (
                        <div className="px-2 py-4 text-center text-sm text-gray-500">
                          No clients found
                        </div>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsClientSelectOpen(true)}>
                        <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
                          <FolderTree size={14} className="mr-2" />
                          <span>View Client Tree</span>
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Sub-Client Selector - Only visible when client is selected */}
                  {currentClient && currentClient.subClients && currentClient.subClients.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">
                            {currentSubClient ? currentSubClient.name : 'Select Division'}
                          </span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>
                          {currentClient.name} Divisions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setCurrentSubClient(null)}>
                          <Building className="h-4 w-4 mr-2" />
                          <span>All Divisions</span>
                          {!currentSubClient && (
                            <CheckCircle className="h-4 w-4 ml-auto text-primary" />
                          )}
                        </DropdownMenuItem>
                        {currentClient.subClients.map(subClient => (
                          <DropdownMenuItem 
                            key={subClient.id} 
                            onClick={() => handleSubClientSelect(subClient.id)}
                            className="cursor-pointer"
                          >
                            <User className="h-4 w-4 mr-2" />
                            <span>{subClient.name}</span>
                            {subClient.id === currentSubClient?.id && (
                              <CheckCircle className="h-4 w-4 ml-auto text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
              
              {/* Return to CRO Button (if applicable) */}
              {parentOrganization && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReturnToCRO}
                  className="text-sm flex items-center"
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Return to {parentOrganization.name}
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Global Search */}
              <form onSubmit={handleSearch} className="relative w-64">
                <input
                  type="text"
                  placeholder="Search across all modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search size={14} className="text-gray-500" />
                </span>
              </form>
              
              {/* User Teams */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm">
                    <Users size={14} className="mr-1" />
                    <span>Teams</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Your Teams</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userTeams.map(team => (
                    <DropdownMenuItem key={team.id} className="flex justify-between">
                      <span>{team.name}</span>
                      <Badge variant="outline" className="text-xs ml-2">{team.role}</Badge>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserPlus size={14} className="mr-2" />
                    <span>Manage Teams</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* System Health */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`text-sm ${
                      systemHealth.status === 'healthy' 
                        ? 'text-green-600' 
                        : systemHealth.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {systemHealth.status === 'healthy' ? (
                      <CheckCircle size={14} className="mr-1" />
                    ) : systemHealth.status === 'warning' ? (
                      <AlertTriangle size={14} className="mr-1" />
                    ) : (
                      <AlertCircle size={14} className="mr-1" />
                    )}
                    <span>System</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>System Health</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(systemHealth.components).map(([key, component]) => (
                    <div key={key} className="px-2 py-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{key}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            component.status === 'healthy' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : component.status === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {component.status === 'healthy' ? 'Healthy' : component.status === 'warning' ? 'Warning' : 'Error'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Latency: {component.latency}ms
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={18} />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notifications.filter(n => n.unread).length > 0 && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Mark all as read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex justify-center">
                    <Button variant="ghost" size="sm" className="w-full text-center" asChild>
                      <Link href="/notifications">View all notifications</Link>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Help */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Documentation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Contact Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    <span>Product Tour</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Github className="h-4 w-4 mr-2" />
                    <span>API Documentation</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatar || null} alt={userProfile.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{userProfile.name}</span>
                      <span className="text-xs text-gray-500">{userRole}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">{userProfile.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Security</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Main Navigation Tabs */}
          <nav className="flex px-4">
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex items-center">
                <Layout size={16} className="mr-2" />
                Dashboard
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('projects')}
            >
              <div className="flex items-center">
                <Briefcase size={16} className="mr-2" />
                Projects
              </div>
            </button>
            
            {/* CER2V Module Tab - Prominently Featured */}
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'cer2v'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50/50'
              }`}
              onClick={() => {
                setActiveTab('cer2v');
                // Navigate to CERV2 module
                setLocation('/client-portal/cer2v');
              }}
            >
              <div className="flex items-center">
                <FileCheck size={16} className="mr-2" />
                <span className="font-semibold">CER2V Module</span>
              </div>
            </button>
            
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              <div className="flex items-center">
                <FileText size={16} className="mr-2" />
                Documents
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <div className="flex items-center">
                <BarChart size={16} className="mr-2" />
                Reports
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <div className="flex items-center">
                <LineChart size={16} className="mr-2" />
                Analytics
              </div>
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'vault'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('vault')}
            >
              <div className="flex items-center">
                <Database size={16} className="mr-2" />
                Vault
              </div>
            </button>
            
            {/* AI Assistant Button */}
            <button
              className={`ml-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'assistant'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-indigo-600 hover:text-indigo-700 hover:border-indigo-300'
              }`}
              onClick={() => setActiveTab('assistant')}
            >
              <div className="flex items-center">
                <Sparkles size={16} className="mr-2" />
                Lument ASSISTANT
              </div>
            </button>
            
            {/* Settings Dropdown */}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'settings'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      Settings
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => setActiveTab('org-settings')}>
                    <Building className="h-4 w-4 mr-2" />
                    <span>Organization Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('user-settings')}>
                    <UserCog className="h-4 w-4 mr-2" />
                    <span>User Management</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('security')}>
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Security Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('integrations')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Integrations</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab('system-config')}>
                    <Server className="h-4 w-4 mr-2" />
                    <span>System Configuration</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  onClick={() => loadOrganizationData()}
                >
                  <RefreshCw size={14} className="mr-2" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Client Context-specific header when client is selected */}
        {currentClient && !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {currentClient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h2 className="font-bold text-xl text-gray-900">{currentClient.name}</h2>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {currentClient.type === 'sponsor' ? 'Sponsor' : 'CRO'}
                    </Badge>
                    {currentSubClient && (
                      <div className="flex items-center ml-3">
                        <Separator orientation="vertical" className="h-4 mx-2" />
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {currentSubClient.name}
                        </Badge>
                      </div>
                    )}
                    <div className="ml-4 text-sm text-gray-500">
                      {currentClient.projects} {currentClient.projects === 1 ? 'Project' : 'Projects'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={() => setActiveTab('projects')} variant="outline" className="flex items-center">
                  <Briefcase size={16} className="mr-2" />
                  View Projects
                </Button>
                <Button onClick={() => setActiveTab('documents')} variant="outline" className="flex items-center">
                  <FileText size={16} className="mr-2" />
                  Documents
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Client Settings
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* CER2V Module Tab */}
        {activeTab === 'cer2v' && !loading && !error && (
          <>
            <div className="flex items-center mb-6">
              <FileCheck className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">CER2V Module</h1>
              <div className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Enterprise Feature
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Main CER2V Content - Load the actual CERV2Page component in an iframe */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 230px)" }}>
                  <iframe 
                    src="/cerv2" 
                    className="w-full h-full border-0"
                    title="CER2V Module"
                  ></iframe>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* CER2V Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-green-700 bg-green-50 hover:bg-green-100 border-green-200">
                      <FileText className="mr-2 h-4 w-4" />
                      Create New CER Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-green-700 bg-green-50 hover:bg-green-100 border-green-200">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Existing Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-green-700 bg-green-50 hover:bg-green-100 border-green-200">
                      <ListChecks className="mr-2 h-4 w-4" />
                      View Report Templates
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-green-700 bg-green-50 hover:bg-green-100 border-green-200">
                      <BarChart className="mr-2 h-4 w-4" />
                      CER Analytics Dashboard
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Recent CER Activities */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">CER Report for BTX-112 Updated</p>
                        <p className="text-xs text-gray-500">Today at 11:43 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-1.5 rounded-full">
                        <File className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New Literature Added</p>
                        <p className="text-xs text-gray-500">Yesterday at 4:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-amber-100 p-1.5 rounded-full">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vigilance Alert: Post-Market Data</p>
                        <p className="text-xs text-gray-500">May 9, 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* AI Integration */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium text-indigo-800">AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-indigo-700 mb-3">Ask Lument AI about your Clinical Evaluation Reports</p>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Ask about CER preparation, literature, etc..."
                        className="w-full px-4 py-2 pr-10 border border-indigo-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Sparkles className="absolute right-3 top-2.5 h-4 w-4 text-indigo-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
        
        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && !loading && !error && (
          <>
            {/* Welcome Banner with Organization Info (When no client is selected) */}
            {!currentClient && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Welcome to {currentOrganization?.name || 'TrialSage'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Your multi-tenant portal for managing clinical and regulatory projects across all clients
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => setIsClientSelectOpen(true)}
                      className="flex items-center"
                    >
                      <Users size={16} className="mr-2" />
                      Manage Clients
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => loadOrganizationData()}
                      className="flex items-center"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Main Dashboard Layout - 3 column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Quick Navigation */}
              <div className="lg:col-span-1">
                {/* Client/Organization Selector */}
                <Card className="shadow-sm mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Layers3 size={16} className="mr-2 text-primary" />
                      Tenant Structure
                    </CardTitle>
                    <CardDescription>
                      Your multi-tenant hierarchy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => setTreeViewOpen(true)}
                    >
                      <FolderTree size={14} className="mr-2" />
                      <span>View Client Tree</span>
                    </Button>
                    
                    {clients.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Access</h4>
                        <div className="space-y-2">
                          {clients.slice(0, 4).map(client => (
                            <Button 
                              key={client.id}
                              variant="ghost" 
                              className={`w-full justify-start text-left ${
                                currentClient?.id === client.id ? 'bg-primary/10 text-primary' : ''
                              }`}
                              onClick={() => handleClientSelect(client.id)}
                            >
                              <Users size={14} className="mr-2" />
                              <span className="truncate">{client.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* AI Assistant - Compact View */}
                <Card className="shadow-sm mb-6 border-indigo-200">
                  <CardHeader className="bg-indigo-50/50 pb-3">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Sparkles size={16} className="mr-2 text-indigo-600" />
                      Lument ASSISTANT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-700 mb-3">
                      AI-powered assistance for your regulatory and clinical documentation.
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => setActiveTab('assistant')}
                    >
                      <Brain size={14} className="mr-2" />
                      <span>Open Assistant</span>
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Module Quick Access */}
                <Card className="shadow-sm mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Folder size={16} className="mr-2 text-primary" />
                      Module Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigateToModule('ind-wizard')}
                      >
                        <FileText size={14} className="mr-2 text-primary" />
                        <span>IND Wizard</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigateToModule('csr-intelligence')}
                      >
                        <BookMarked size={14} className="mr-2 text-purple-500" />
                        <span>CSR Intelligence</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigateToModule('trial-vault')}
                      >
                        <Database size={14} className="mr-2 text-blue-500" />
                        <span>Trial Vault</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigateToModule('study-architect')}
                      >
                        <Beaker size={14} className="mr-2 text-green-500" />
                        <span>Study Architect</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => navigateToModule('analytics')}
                      >
                        <BarChartHorizontal size={14} className="mr-2 text-amber-500" />
                        <span>Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Center Content - Global Project Manager */}
              <div className="lg:col-span-2">
                {/* Show client-specific projects when client is selected */}
                {currentClient ? (
                  <Card className="shadow-sm mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          {currentClient.name} Projects
                        </CardTitle>
                        <Button variant="outline" size="sm" className="h-8">
                          <Plus size={14} className="mr-1" />
                          New Project
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {clientProjects.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md">
                          <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <h3 className="text-sm font-medium text-gray-700">No projects yet</h3>
                          <p className="text-sm text-gray-500 mt-1">Create your first project for this client</p>
                          <Button size="sm" className="mt-3">
                            <Plus size={14} className="mr-1" />
                            New Project
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {clientProjects.map(project => (
                            <div 
                              key={project.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedProject?.id === project.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedProject(project)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                                  <div className="flex items-center mt-1 text-sm">
                                    <Badge className={getStatusDisplay(project.status).bgColor}>
                                      {getStatusDisplay(project.status).text}
                                    </Badge>
                                    <span className="mx-2">·</span>
                                    <span className="text-gray-500">Due: {formatDate(project.dueDate)}</span>
                                    <span className="ml-2">{getPriorityBadge(project.priority)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold mr-2">
                                    {project.progress}%
                                  </span>
                                  <ChevronRight size={16} className="text-gray-400" />
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-sm mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Grid className="h-5 w-5 mr-2 text-primary" />
                          Global Project Manager
                        </CardTitle>
                        <Button variant="outline" size="sm" className="h-8">
                          <Plus size={14} className="mr-1" />
                          New Project
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ProjectManagerGrid 
                        userId={userProfile.id}
                        orgId={currentOrganization.id}
                        onProjectSelect={(projectId) => {
                          const project = projects.find(p => p.id === projectId);
                          if (project) {
                            setSelectedProject(project);
                            // Also select the client for this project
                            const projectClient = clients.find(c => c.id === project.clientId);
                            if (projectClient) {
                              setCurrentClient(projectClient);
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Selected Project KPIs - Only show when a project is selected */}
                {selectedProject && (
                  <Card className="shadow-sm mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center">
                          <BarChart className="h-5 w-5 mr-2 text-primary" />
                          Project KPIs: {selectedProject.name}
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink size={14} className="mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProject.kpis?.map(kpi => (
                          <div 
                            key={kpi.id}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex items-start">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {getKPIIcon(kpi.name)}
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-sm">{kpi.name}</h4>
                                <div className="flex items-baseline mt-1">
                                  <span className="text-xl font-bold">{kpi.value}</span>
                                  <span className="text-xs text-gray-500 ml-1">/ {kpi.target}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <span className={`text-xs ${
                                    kpi.trend === 'up' 
                                      ? 'text-green-600' 
                                      : kpi.trend === 'down' 
                                      ? 'text-red-600' 
                                      : 'text-gray-600'
                                  } font-medium`}>
                                    {kpi.change}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Recent Documents */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Recent Documents
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="h-8">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Filter documents by current client if one is selected */}
                    {(currentClient 
                      ? documents.filter(doc => doc.clientId === currentClient.id)
                      : documents
                    ).length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-md">
                        <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-700">No documents yet</h3>
                        <p className="text-sm text-gray-500 mt-1">Upload or create your first document</p>
                        <Button size="sm" className="mt-3">
                          <Plus size={14} className="mr-1" />
                          New Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(currentClient 
                          ? documents.filter(doc => doc.clientId === currentClient.id)
                          : documents
                        ).map(doc => (
                          <div 
                            key={doc.id}
                            className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // Update AI Assistant context to this document
                              setAssistantContext({
                                type: 'document',
                                id: doc.id,
                                name: doc.name,
                                clientId: doc.clientId,
                                module: doc.module
                              });
                              
                              // Navigate to document
                              setLocation(`/${doc.module}/documents/${doc.id}`);
                            }}
                          >
                            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                              {getModuleIcon(doc.module)}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center">
                                <h4 className="font-medium text-sm text-gray-900 truncate">{doc.name}</h4>
                                {doc.type && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {doc.type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <span>{formatTimestamp(doc.updatedAt)}</span>
                                <span className="mx-1">·</span>
                                <span>{doc.updatedBy}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                              <ExternalLink size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Sidebar - Activities and AI Assistant */}
              <div className="lg:col-span-1">
                {/* Recent Activities */}
                <Card className="shadow-sm mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Filter activities by current client if one is selected */}
                    {(currentClient 
                      ? activities.filter(activity => activity.clientId === currentClient.id)
                      : activities
                    ).length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-md">
                        <Activity className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-700">No recent activity</h3>
                        <p className="text-sm text-gray-500 mt-1">Activity will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(currentClient 
                          ? activities.filter(activity => activity.clientId === currentClient.id)
                          : activities
                        ).map(activity => (
                          <div key={activity.id} className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              {getModuleIcon(activity.module)}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <span>{formatTimestamp(activity.timestamp)}</span>
                                <span className="mx-1">·</span>
                                <span>{activity.user}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Lument ASSISTANT */}
                <LumentAssistant context={assistantContext} active={false} />
              </div>
            </div>
          </>
        )}
        
        {/* Lument ASSISTANT Tab */}
        {activeTab === 'assistant' && !loading && !error && (
          <div>
            <div className="flex items-center mb-6">
              <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Lument ASSISTANT</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {/* Full Assistant View */}
                <LumentAssistant context={assistantContext} active={true} />
              </div>
              
              <div className="md:col-span-1">
                <Card className="shadow-sm mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cpu className="h-5 w-5 mr-2 text-indigo-600" />
                      Assistant Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium flex items-center text-indigo-700">
                          <FileCheck size={16} className="mr-2" />
                          Document Analysis
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Analyze documents for completeness, regulatory compliance, and data consistency
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium flex items-center text-indigo-700">
                          <BookMarked size={16} className="mr-2" />
                          Regulatory Insights
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Get actionable insights on regulatory requirements and submission strategy
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium flex items-center text-indigo-700">
                          <Edit3 size={16} className="mr-2" />
                          Protocol Design
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Get assistance with protocol design, endpoint selection, and statistical methods
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium flex items-center text-indigo-700">
                          <ClipboardList size={16} className="mr-2" />
                          Submission Preparation
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Generate reports, summaries, and reviews needed for regulatory submissions
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium flex items-center text-indigo-700">
                          <BarChart size={16} className="mr-2" />
                          Data Summarization
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Transform complex data into clear summaries, tables, and visualizations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tenant Tree View Sheet */}
      <Sheet open={treeViewOpen || isClientSelectOpen} onOpenChange={isClientSelectOpen ? setIsClientSelectOpen : setTreeViewOpen}>
        <SheetContent side="left" className="sm:max-w-md">
          <SheetHeader className="mb-4">
            <SheetTitle>Organization & Client Structure</SheetTitle>
            <SheetDescription>
              View and manage your multi-tenant hierarchy
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4">
            <ClientWorkspaceTree 
              organizations={organizations}
              clients={clients}
              currentOrg={currentOrganization}
              currentClient={currentClient}
              onSelectOrg={handleOrganizationChange}
              onSelectClient={handleClientSelect}
            />
          </div>
          
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button>Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MultiTenantEnterprisePortal;