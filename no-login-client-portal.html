/**
 * Client Portal Landing
 * 
 * This component serves as the landing page for the Client Portal module,
 * designed specifically for CRO users managing multiple biotech clients.
 * It provides a centralized view of all client organizations, their projects,
 * and key metrics to enable efficient client management.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useModuleIntegration, MODULES } from '../integration/ModuleIntegrationLayer';

// UI components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Plus, 
  Users, 
  FileText, 
  ClipboardList, 
  BarChart, 
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CloudUpload,
  Filter
} from 'lucide-react';

/**
 * Client Portal Landing Component
 */
export const ClientPortalLanding = () => {
  // State
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredClients, setFilteredClients] = useState([]);
  
  // Integration hooks
  const { 
    services, 
    switchClient,
    clientContext
  } = useModuleIntegration();
  
  // Fetch clients on load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        
        // Fetch client organizations using security service
        const clientOrgs = await services.security.getClientOrganizations();
        setClients(clientOrgs);
        setFilteredClients(clientOrgs);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching client organizations:', error);
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [services.security]);
  
  // Filter clients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(query) || 
      client.industry?.toLowerCase().includes(query) ||
      client.contactPerson?.toLowerCase().includes(query)
    );
    
    setFilteredClients(filtered);
  }, [searchQuery, clients]);
  
  // Handle client selection
  const handleClientSelect = async (clientId) => {
    try {
      await switchClient(clientId);
    } catch (error) {
      console.error('Error switching client context:', error);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground mt-1">
            Manage your biotech clients and their regulatory projects
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>
      
      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <MetricCard 
              title="Total Clients" 
              value={clients.length} 
              icon={<Users className="h-5 w-5" />}
              change="+2 this month"
              changeType="positive"
            />
            <MetricCard 
              title="Active Projects" 
              value="24" 
              icon={<FileText className="h-5 w-5" />}
              change="+3 this week"
              changeType="positive"
            />
            <MetricCard 
              title="Pending Submissions" 
              value="8" 
              icon={<ClipboardList className="h-5 w-5" />}
              change="-2 since last week"
              changeType="positive"
            />
            <MetricCard 
              title="Regulatory Alerts" 
              value="5" 
              icon={<AlertCircle className="h-5 w-5" />}
              change="+2 new alerts"
              changeType="negative"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across all client accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="space-y-4">
                    <ActivityItem 
                      client="NeuraTech Biomedical"
                      action="IND submission completed"
                      time="2 hours ago"
                      icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    />
                    <ActivityItem 
                      client="GenomaCure Therapeutics"
                      action="New protocol version uploaded"
                      time="5 hours ago"
                      icon={<CloudUpload className="h-5 w-5 text-blue-500" />}
                    />
                    <ActivityItem 
                      client="CellCore Biologics"
                      action="FDA information request received"
                      time="Yesterday"
                      icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                    />
                    <ActivityItem 
                      client="SynaptiCure"
                      action="CMC section reviewed"
                      time="Yesterday"
                      icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    />
                    <ActivityItem 
                      client="ImmunoGenix"
                      action="Meeting scheduled with FDA"
                      time="2 days ago"
                      icon={<Calendar className="h-5 w-5 text-purple-500" />}
                    />
                    <ActivityItem 
                      client="OncoBiome"
                      action="Phase 2 study results submitted"
                      time="3 days ago"
                      icon={<CloudUpload className="h-5 w-5 text-blue-500" />}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" size="sm">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>
                  Critical dates for the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="space-y-4">
                    <DeadlineItem 
                      client="GenomaCure Therapeutics"
                      deadline="FDA Response Due"
                      daysLeft={2}
                      severity="high"
                    />
                    <DeadlineItem 
                      client="NeuraTech Biomedical"
                      deadline="Annual IND Report"
                      daysLeft={5}
                      severity="medium"
                    />
                    <DeadlineItem 
                      client="CellCore Biologics"
                      deadline="Protocol Amendment"
                      daysLeft={8}
                      severity="medium"
                    />
                    <DeadlineItem 
                      client="SynaptiCure"
                      deadline="Safety Update"
                      daysLeft={12}
                      severity="low"
                    />
                    <DeadlineItem 
                      client="ImmunoGenix"
                      deadline="CMC Update"
                      daysLeft={18}
                      severity="low"
                    />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" size="sm">
                  View All Deadlines
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>
                  Clients with the most active regulatory projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.slice(0, 6).map((client) => (
                    <ClientCard 
                      key={client.id}
                      client={client}
                      onSelect={() => handleClientSelect(client.id)}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setActiveTab('clients')}
                >
                  View All Clients
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard 
                key={client.id}
                client={client}
                onSelect={() => handleClientSelect(client.id)}
              />
            ))}
          </div>
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No clients found matching your search.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <ProjectsTable clients={clients} />
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-6">
          <SubmissionsTable clients={clients} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analytics Module</AlertTitle>
            <AlertDescription>
              For detailed analytics across all clients, please visit the Analytics module.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Active INDs" 
              value="18" 
              icon={<FileText className="h-5 w-5" />}
              change="+2 this quarter"
              changeType="positive"
            />
            <MetricCard 
              title="Ongoing Trials" 
              value="37" 
              icon={<ClipboardList className="h-5 w-5" />}
              change="+5 this quarter"
              changeType="positive"
            />
            <MetricCard 
              title="Regulatory Meetings" 
              value="12" 
              icon={<Calendar className="h-5 w-5" />}
              change="+3 this month"
              changeType="positive"
            />
            <MetricCard 
              title="Submission Success" 
              value="92%" 
              icon={<BarChart className="h-5 w-5" />}
              change="+4% from last year"
              changeType="positive"
            />
          </div>
          
          <div className="text-center py-12">
            <Button 
              onClick={() => {
                const { navigateToModule } = useModuleIntegration();
                navigateToModule(MODULES.ANALYTICS);
              }}
            >
              Go to Analytics Module
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ title, value, icon, change, changeType }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${
            changeType === 'positive' ? 'text-green-500' : 
            changeType === 'negative' ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Client Card Component
 */
const ClientCard = ({ client, onSelect }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Avatar className="h-12 w-12">
            <AvatarImage src={client.avatarUrl} alt={client.name} />
            <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
            {client.status || 'Active'}
          </Badge>
        </div>
        <CardTitle className="text-lg truncate mt-3">{client.name}</CardTitle>
        <CardDescription className="truncate">
          {client.industry || 'Biotechnology'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Projects</p>
            <p className="font-medium">{client.projectCount || 3}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submissions</p>
            <p className="font-medium">{client.submissionCount || 2}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" size="sm" onClick={onSelect}>
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Access Client
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ client, action, time, icon }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium mb-0.5">{action}</p>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">{client}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Deadline Item Component
 */
const DeadlineItem = ({ client, deadline, daysLeft, severity }) => {
  // Determine severity colors
  const severityColor = 
    severity === 'high' ? 'bg-red-500' : 
    severity === 'medium' ? 'bg-amber-500' : 
    'bg-green-500';
  
  const progressValue = 
    severity === 'high' ? 85 : 
    severity === 'medium' ? 60 : 
    30;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium">{deadline}</p>
          <p className="text-xs text-muted-foreground">{client}</p>
        </div>
        <Badge 
          variant={
            severity === 'high' ? 'destructive' : 
            severity === 'medium' ? 'outline' : 
            'secondary'
          }
          className="h-fit"
        >
          {daysLeft} days left
        </Badge>
      </div>
      <Progress value={progressValue} className={severityColor} />
    </div>
  );
};

/**
 * Projects Table Component
 */
const ProjectsTable = ({ clients }) => {
  // Sample project data
  const projects = [
    {
      id: 'p1',
      name: 'IND-2025-034',
      type: 'IND Application',
      client: 'NeuraTech Biomedical',
      status: 'In Progress',
      phase: 'Phase 2',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'p2',
      name: 'PROT-A342',
      type: 'Protocol Development',
      client: 'GenomaCure Therapeutics',
      status: 'Under Review',
      phase: 'Phase 1',
      lastUpdated: '1 day ago'
    },
    {
      id: 'p3',
      name: 'NDA-2025-012',
      type: 'NDA Submission',
      client: 'CellCore Biologics',
      status: 'Approved',
      phase: 'Phase 3',
      lastUpdated: '3 days ago'
    },
    {
      id: 'p4',
      name: 'IND-Amendment-022',
      type: 'IND Amendment',
      client: 'SynaptiCure',
      status: 'In Progress',
      phase: 'Phase 2',
      lastUpdated: '4 days ago'
    },
    {
      id: 'p5',
      name: 'CSR-2024-089',
      type: 'Clinical Study Report',
      client: 'ImmunoGenix',
      status: 'Completed',
      phase: 'Phase 2',
      lastUpdated: '1 week ago'
    }
  ];
  
  return (
    <div className="rounded-md border">
      <div className="p-4 bg-muted/40">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Projects</h3>
          <div className="flex items-center space-x-2">
            <div className="relative w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8 h-9"
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Project Name</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Client</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phase</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Updated</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b hover:bg-muted/30">
                <td className="p-3">
                  <div className="font-medium">{project.name}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{project.type}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{project.client}</div>
                </td>
                <td className="p-3">
                  <Badge 
                    variant={
                      project.status === 'Approved' || project.status === 'Completed' ? 'default' : 
                      project.status === 'In Progress' ? 'outline' : 
                      'secondary'
                    }
                  >
                    {project.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="text-sm">{project.phase}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-muted-foreground">{project.lastUpdated}</div>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Submissions Table Component
 */
const SubmissionsTable = ({ clients }) => {
  // Sample submission data
  const submissions = [
    {
      id: 's1',
      name: 'IND-2025-034',
      type: 'IND Application',
      client: 'NeuraTech Biomedical',
      status: 'Submitted',
      authority: 'FDA',
      submissionDate: 'Apr 15, 2025',
      responseExpected: 'May 15, 2025'
    },
    {
      id: 's2',
      name: 'Amendment-A342',
      type: 'Protocol Amendment',
      client: 'GenomaCure Therapeutics',
      status: 'In Preparation',
      authority: 'FDA',
      submissionDate: 'Pending',
      responseExpected: 'N/A'
    },
    {
      id: 's3',
      name: 'NDA-2025-012',
      type: 'NDA',
      client: 'CellCore Biologics',
      status: 'Approved',
      authority: 'FDA',
      submissionDate: 'Feb 10, 2025',
      responseExpected: 'Approved on Apr 5, 2025'
    },
    {
      id: 's4',
      name: 'IMPD-2025-034',
      type: 'IMPD',
      client: 'SynaptiCure',
      status: 'Under Review',
      authority: 'EMA',
      submissionDate: 'Mar 20, 2025',
      responseExpected: 'Jun 20, 2025'
    },
    {
      id: 's5',
      name: 'Annual-Report-2025',
      type: 'Annual Report',
      client: 'ImmunoGenix',
      status: 'In Preparation',
      authority: 'FDA',
      submissionDate: 'Due May 15, 2025',
      responseExpected: 'N/A'
    }
  ];
  
  return (
    <div className="rounded-md border">
      <div className="p-4 bg-muted/40">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Regulatory Submissions</h3>
          <div className="flex items-center space-x-2">
            <div className="relative w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search submissions..."
                className="pl-8 h-9"
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Submission
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Submission Name</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Client</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Authority</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Submission Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Response Expected</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b hover:bg-muted/30">
                <td className="p-3">
                  <div className="font-medium">{submission.name}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{submission.type}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{submission.client}</div>
                </td>
                <td className="p-3">
                  <Badge 
                    variant={
                      submission.status === 'Approved' ? 'default' : 
                      submission.status === 'Submitted' || submission.status === 'Under Review' ? 'outline' : 
                      'secondary'
                    }
                  >
                    {submission.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="text-sm">{submission.authority}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{submission.submissionDate}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-muted-foreground">{submission.responseExpected}</div>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientPortalLanding;