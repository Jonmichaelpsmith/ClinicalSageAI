import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
import { 
  FileText, 
  Plus, 
  Check, 
  CalendarCheck, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Search, 
  Download,
  Upload,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  AlertTriangle,
  Users,
  FilePlus,
  FileCheck,
  CalendarDays,
  Calendar,
  User,
  Building,
  Settings,
  Globe,
  HelpCircle,
  BookOpen,
  BarChart3,
  FileSymlink,
  Trash2,
  Pencil,
  Lock,
  Folder,
  FolderPlus,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckSquare,
  XCircle,
  PlusCircle,
  Repeat,
  Info,
  Workflow,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Wrap the component with auth guard for security
import withAuthGuard from '../utils/withAuthGuard';

// Protocol Deviation Component
const ProtocolDeviationLog = () => {
  const [deviations, setDeviations] = useState([
    {
      id: 1,
      subject: 'Subject-101',
      site: 'Site 03',
      date: '2025-04-12',
      category: 'Inclusion/Exclusion',
      description: 'Subject enrolled with HbA1c of 6.8%, below minimum inclusion criterion of 7.0%',
      impact: 'Low - Subject remains eligible for all study procedures and assessments',
      status: 'Identified',
      mitigation: 'Subject to remain in study with protocol deviation documented. Data to be analyzed in both ITT and PP populations.',
      preventable: true
    },
    {
      id: 2,
      subject: 'Subject-118',
      site: 'Site 05',
      date: '2025-04-08',
      category: 'Study Procedures',
      description: 'Visit window exceeded by 4 days for Week 12 visit',
      impact: 'Medium - May affect interpretation of time-dependent endpoints',
      status: 'Resolved',
      mitigation: 'Statistical analysis plan updated to account for visit window deviations. Site retrained on scheduling procedures.',
      preventable: true
    },
    {
      id: 3,
      subject: 'Subject-205',
      site: 'Site 11',
      date: '2025-03-28',
      category: 'Informed Consent',
      description: 'Updated ICF version not obtained prior to additional procedures',
      impact: 'High - Ethical and regulatory concern',
      status: 'Reported',
      mitigation: 'Reported to EC/IRB. Subject re-consented with correct ICF. Site audit conducted and comprehensive retraining completed.',
      preventable: true
    },
    {
      id: 4,
      subject: 'N/A',
      site: 'Site 08',
      date: '2025-03-15',
      category: 'Investigational Product',
      description: 'Temperature excursion for drug product storage (15°C for 8 hours, below required 20°C minimum)',
      impact: 'Medium - Potential product stability concern',
      status: 'Resolved',
      mitigation: 'QA review confirmed stability unaffected within documented excursion parameters. Site retrained on storage requirements.',
      preventable: true
    },
  ]);

  const [newDeviation, setNewDeviation] = useState({
    subject: '',
    site: '',
    date: '',
    category: '',
    description: '',
    impact: '',
    mitigation: '',
    preventable: true
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSite, setFilterSite] = useState('All');

  const handleAddDeviation = () => {
    setDeviations([...deviations, { ...newDeviation, id: deviations.length + 1, status: 'Identified' }]);
    setNewDeviation({
      subject: '',
      site: '',
      date: '',
      category: '',
      description: '',
      impact: '',
      mitigation: '',
      preventable: true
    });
    setShowAddForm(false);
  };

  const filteredDeviations = deviations.filter(d => {
    return (filterCategory === 'All' || d.category === filterCategory) &&
           (filterSite === 'All' || d.site === filterSite);
  });

  const getImpactBadge = (impact) => {
    switch (impact.split(' ')[0]) {
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'High':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return <Badge>{impact}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Identified':
        return <Badge className="bg-blue-100 text-blue-800">Identified</Badge>;
      case 'Reported':
        return <Badge className="bg-purple-100 text-purple-800">Reported</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Protocol Deviation Log</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Deviation
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Add New Protocol Deviation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject ID</Label>
                <Input 
                  id="subject" 
                  value={newDeviation.subject} 
                  onChange={e => setNewDeviation({...newDeviation, subject: e.target.value})}
                  placeholder="e.g., Subject-101" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Select 
                  onValueChange={value => setNewDeviation({...newDeviation, site: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site 01">Site 01</SelectItem>
                    <SelectItem value="Site 03">Site 03</SelectItem>
                    <SelectItem value="Site 05">Site 05</SelectItem>
                    <SelectItem value="Site 08">Site 08</SelectItem>
                    <SelectItem value="Site 11">Site 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date Identified</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newDeviation.date} 
                  onChange={e => setNewDeviation({...newDeviation, date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={value => setNewDeviation({...newDeviation, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inclusion/Exclusion">Inclusion/Exclusion</SelectItem>
                    <SelectItem value="Informed Consent">Informed Consent</SelectItem>
                    <SelectItem value="Study Procedures">Study Procedures</SelectItem>
                    <SelectItem value="Investigational Product">Investigational Product</SelectItem>
                    <SelectItem value="Visit Schedule">Visit Schedule</SelectItem>
                    <SelectItem value="Adverse Event Reporting">Adverse Event Reporting</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="impact">Impact Assessment</Label>
                <Select
                  onValueChange={value => setNewDeviation({...newDeviation, impact: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low - Minimal impact on safety or data integrity">Low</SelectItem>
                    <SelectItem value="Medium - Moderate impact on data analysis">Medium</SelectItem>
                    <SelectItem value="High - Significant impact on safety or data integrity">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDeviation.description}
                onChange={e => setNewDeviation({...newDeviation, description: e.target.value})}
                placeholder="Describe the protocol deviation in detail..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitigation">Corrective/Preventive Action</Label>
              <Textarea
                id="mitigation"
                value={newDeviation.mitigation}
                onChange={e => setNewDeviation({...newDeviation, mitigation: e.target.value})}
                placeholder="Describe actions taken to mitigate this deviation and prevent recurrence..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="preventable" 
                checked={newDeviation.preventable}
                onCheckedChange={(checked) => setNewDeviation({...newDeviation, preventable: checked})}
              />
              <label 
                htmlFor="preventable" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Preventable deviation
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="mr-2" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={handleAddDeviation}>Add Deviation</Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search deviations..."
            className="max-w-sm"
            prefix={<Search className="w-4 h-4 mr-2" />}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter" className="whitespace-nowrap">Category:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger id="category-filter" className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Inclusion/Exclusion">Inclusion/Exclusion</SelectItem>
              <SelectItem value="Informed Consent">Informed Consent</SelectItem>
              <SelectItem value="Study Procedures">Study Procedures</SelectItem>
              <SelectItem value="Investigational Product">Investigational Product</SelectItem>
              <SelectItem value="Visit Schedule">Visit Schedule</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="site-filter" className="whitespace-nowrap">Site:</Label>
          <Select value={filterSite} onValueChange={setFilterSite}>
            <SelectTrigger id="site-filter" className="w-[150px]">
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sites</SelectItem>
              <SelectItem value="Site 03">Site 03</SelectItem>
              <SelectItem value="Site 05">Site 05</SelectItem>
              <SelectItem value="Site 08">Site 08</SelectItem>
              <SelectItem value="Site 11">Site 11</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Subject</TableHead>
            <TableHead className="w-[100px]">Site</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Impact</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeviations.map((deviation) => (
            <TableRow key={deviation.id}>
              <TableCell className="font-medium">{deviation.subject}</TableCell>
              <TableCell>{deviation.site}</TableCell>
              <TableCell>{deviation.date}</TableCell>
              <TableCell>{deviation.category}</TableCell>
              <TableCell className="max-w-[300px] truncate" title={deviation.description}>
                {deviation.description}
              </TableCell>
              <TableCell>{getImpactBadge(deviation.impact)}</TableCell>
              <TableCell>{getStatusBadge(deviation.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// TMF Document Manager Component
const TMFDocumentManager = () => {
  const [documents, setDocuments] = useState([
    { 
      id: 1, 
      title: 'Final Protocol v1.0', 
      category: 'Protocol', 
      version: '1.0',
      date: '2025-03-10',
      status: 'Approved',
      required: true,
      available: true,
      zone: 'Trial Management' 
    },
    { 
      id: 2, 
      title: 'ICF Template - Main Study', 
      category: 'Informed Consent', 
      version: '1.0',
      date: '2025-03-12',
      status: 'Approved',
      required: true,
      available: true,
      zone: 'Ethics' 
    },
    { 
      id: 3, 
      title: 'Statistical Analysis Plan', 
      category: 'Statistics', 
      version: 'Draft',
      date: '2025-03-25',
      status: 'In Development',
      required: true,
      available: false,
      zone: 'Data Management' 
    },
    { 
      id: 4, 
      title: 'Lab Manual', 
      category: 'Laboratory', 
      version: '1.0',
      date: '2025-03-18',
      status: 'Approved',
      required: true,
      available: true,
      zone: 'Clinical Operations' 
    },
    { 
      id: 5, 
      title: 'Monitoring Plan', 
      category: 'Monitoring', 
      version: '1.0',
      date: '2025-03-22',
      status: 'In Review',
      required: true,
      available: false,
      zone: 'Clinical Operations' 
    },
    { 
      id: 6, 
      title: 'Investigator Brochure', 
      category: 'Investigational Product', 
      version: '2.1',
      date: '2025-02-15',
      status: 'Approved',
      required: true,
      available: true,
      zone: 'Trial Management' 
    },
    { 
      id: 7, 
      title: 'Case Report Form', 
      category: 'Data Collection', 
      version: 'Draft',
      date: '2025-03-28',
      status: 'In Development',
      required: true,
      available: false,
      zone: 'Data Management' 
    },
    { 
      id: 8, 
      title: 'Safety Management Plan', 
      category: 'Safety', 
      version: '1.0',
      date: '2025-03-20',
      status: 'In Review',
      required: true,
      available: false,
      zone: 'Safety' 
    },
  ]);

  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [tmfCompleteness, setTmfCompleteness] = useState(62);

  // Filter documents based on selected filters
  const filteredDocuments = documents.filter(doc => {
    return (selectedZone === 'All' || doc.zone === selectedZone) &&
           (selectedStatus === 'All' || doc.status === selectedStatus);
  });

  // Calculate TMF completeness
  const requiredDocs = documents.filter(doc => doc.required).length;
  const availableDocs = documents.filter(doc => doc.required && doc.available).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'In Review':
        return <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>;
      case 'In Development':
        return <Badge className="bg-blue-100 text-blue-800">In Development</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trial Master File</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">TMF Completeness:</div>
            <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${tmfCompleteness}%`, 
                  backgroundColor: tmfCompleteness < 50 ? '#ef4444' : tmfCompleteness < 80 ? '#f59e0b' : '#22c55e' 
                }}
              />
            </div>
            <div className="text-sm font-medium">{tmfCompleteness}%</div>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Document
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            className="max-w-sm"
            prefix={<Search className="w-4 h-4 mr-2" />}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="zone-filter" className="whitespace-nowrap">TMF Zone:</Label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger id="zone-filter" className="w-[200px]">
              <SelectValue placeholder="Filter by TMF zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Zones</SelectItem>
              <SelectItem value="Trial Management">Trial Management</SelectItem>
              <SelectItem value="Ethics">Ethics</SelectItem>
              <SelectItem value="Data Management">Data Management</SelectItem>
              <SelectItem value="Clinical Operations">Clinical Operations</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter" className="whitespace-nowrap">Status:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status-filter" className="w-[170px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="In Development">In Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Document</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead className="w-[80px]">Version</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">TMF Zone</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.title}</TableCell>
              <TableCell>{doc.category}</TableCell>
              <TableCell>{doc.version}</TableCell>
              <TableCell>{doc.date}</TableCell>
              <TableCell>{getStatusBadge(doc.status)}</TableCell>
              <TableCell>{doc.zone}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  {doc.available ? (
                    <>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">TMF Readiness: {availableDocs} of {requiredDocs} required documents available ({Math.round(availableDocs/requiredDocs*100)}%)</p>
            <p className="mt-1">
              The Trial Master File (TMF) is essential for inspection readiness. Ensure all required documents are prepared, 
              reviewed, and properly filed according to ICH GCP and regulatory requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protocol Deviation Prevention Plan Component
const DeviationPreventionPlan = () => {
  const [strategies, setStrategies] = useState([
    {
      id: 1,
      category: 'Inclusion/Exclusion Criteria',
      riskLevel: 'High',
      preventionStrategy: 'Implement pre-screening checklist with automated validation rules to prevent eligibility errors',
      implementation: 'Study start-up phase',
      responsible: 'Clinical Operations',
      status: 'Implemented'
    },
    {
      id: 2,
      category: 'Visit Schedule Adherence',
      riskLevel: 'Medium',
      preventionStrategy: 'Automated visit scheduling system with calendar integration and proactive reminders (14-day, 7-day, 2-day)',
      implementation: 'Prior to first patient enrolled',
      responsible: 'Data Management',
      status: 'In Progress'
    },
    {
      id: 3,
      category: 'Data Collection Completeness',
      riskLevel: 'Medium',
      preventionStrategy: 'EDC edit checks and field validation rules to ensure required data fields cannot be skipped',
      implementation: 'Study start-up phase',
      responsible: 'Data Management',
      status: 'Implemented'
    },
    {
      id: 4,
      category: 'Protocol Understanding',
      riskLevel: 'High',
      preventionStrategy: 'Protocol walkthrough training with knowledge assessment quiz and protocol design justification explanations',
      implementation: 'Investigator Meeting',
      responsible: 'Clinical Operations/Medical Affairs',
      status: 'Planned'
    },
    {
      id: 5,
      category: 'Investigational Product Management',
      riskLevel: 'High',
      preventionStrategy: 'Temperature monitoring with real-time alerts and comprehensive IP accountability training',
      implementation: 'Site initiation',
      responsible: 'Clinical Supply/Monitoring',
      status: 'In Progress'
    },
    {
      id: 6,
      category: 'Informed Consent Process',
      riskLevel: 'Critical',
      preventionStrategy: 'Detailed consent process workflow with documentation checkpoints and remote consent monitoring',
      implementation: 'Prior to first patient enrolled',
      responsible: 'Clinical Operations',
      status: 'Planned'
    },
    {
      id: 7,
      category: 'Adverse Event Reporting',
      riskLevel: 'High',
      preventionStrategy: 'Mobile app for immediate SAE reporting with automated email cascades and follow-up tracking',
      implementation: 'Study start-up phase',
      responsible: 'Safety/Pharmacovigilance',
      status: 'In Progress'
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    category: '',
    riskLevel: '',
    preventionStrategy: '',
    implementation: '',
    responsible: '',
    status: 'Planned'
  });

  const [filterRisk, setFilterRisk] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleAddStrategy = () => {
    setStrategies([...strategies, { ...newStrategy, id: strategies.length + 1 }]);
    setNewStrategy({
      category: '',
      riskLevel: '',
      preventionStrategy: '',
      implementation: '',
      responsible: '',
      status: 'Planned'
    });
    setShowAddForm(false);
  };

  const filteredStrategies = strategies.filter(s => {
    return (filterRisk === 'All' || s.riskLevel === filterRisk) &&
           (filterStatus === 'All' || s.status === filterStatus);
  });

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case 'Medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case 'High':
        return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>;
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge>{risk}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'Planned':
        return <Badge className="bg-gray-100 text-gray-800">Planned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Protocol Deviation Prevention Plan</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Prevention Strategy
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Add New Prevention Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Potential Deviation Category</Label>
                <Select
                  onValueChange={value => setNewStrategy({...newStrategy, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inclusion/Exclusion Criteria">Inclusion/Exclusion Criteria</SelectItem>
                    <SelectItem value="Visit Schedule Adherence">Visit Schedule Adherence</SelectItem>
                    <SelectItem value="Data Collection Completeness">Data Collection Completeness</SelectItem>
                    <SelectItem value="Protocol Understanding">Protocol Understanding</SelectItem>
                    <SelectItem value="Investigational Product Management">Investigational Product Management</SelectItem>
                    <SelectItem value="Informed Consent Process">Informed Consent Process</SelectItem>
                    <SelectItem value="Adverse Event Reporting">Adverse Event Reporting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select
                  onValueChange={value => setNewStrategy({...newStrategy, riskLevel: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preventionStrategy">Prevention Strategy</Label>
              <Textarea
                id="preventionStrategy"
                value={newStrategy.preventionStrategy}
                onChange={e => setNewStrategy({...newStrategy, preventionStrategy: e.target.value})}
                placeholder="Describe the strategy to prevent this type of deviation..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="implementation">Implementation Timepoint</Label>
                <Input 
                  id="implementation" 
                  value={newStrategy.implementation} 
                  onChange={e => setNewStrategy({...newStrategy, implementation: e.target.value})}
                  placeholder="e.g., Study start-up phase" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Party</Label>
                <Select
                  onValueChange={value => setNewStrategy({...newStrategy, responsible: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clinical Operations">Clinical Operations</SelectItem>
                    <SelectItem value="Data Management">Data Management</SelectItem>
                    <SelectItem value="Medical Affairs">Medical Affairs</SelectItem>
                    <SelectItem value="Safety/Pharmacovigilance">Safety/Pharmacovigilance</SelectItem>
                    <SelectItem value="Clinical Supply/Monitoring">Clinical Supply/Monitoring</SelectItem>
                    <SelectItem value="Multiple Departments">Multiple Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="mr-2" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={handleAddStrategy}>Add Strategy</Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search prevention strategies..."
            className="max-w-sm"
            prefix={<Search className="w-4 h-4 mr-2" />}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="risk-filter" className="whitespace-nowrap">Risk Level:</Label>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger id="risk-filter" className="w-[150px]">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Risks</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter" className="whitespace-nowrap">Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="status-filter" className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Implemented">Implemented</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Category</TableHead>
            <TableHead className="w-[100px]">Risk Level</TableHead>
            <TableHead>Prevention Strategy</TableHead>
            <TableHead className="w-[150px]">Implementation</TableHead>
            <TableHead className="w-[150px]">Responsible</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStrategies.map((strategy) => (
            <TableRow key={strategy.id}>
              <TableCell className="font-medium">{strategy.category}</TableCell>
              <TableCell>{getRiskBadge(strategy.riskLevel)}</TableCell>
              <TableCell className="max-w-[300px]">{strategy.preventionStrategy}</TableCell>
              <TableCell>{strategy.implementation}</TableCell>
              <TableCell>{strategy.responsible}</TableCell>
              <TableCell>{getStatusBadge(strategy.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="bg-yellow-50 p-3 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">Protocol Deviation Prevention</p>
            <p className="mt-1">
              Proactive prevention of protocol deviations is critical for study success. This plan focuses on identifying 
              potential risk areas and implementing targeted prevention strategies. Remember that the most effective 
              approach is to simplify protocol requirements when possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Study Planner Component
const StudyPlanner = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Study details
  const [studyDetails, setStudyDetails] = useState({
    title: 'Phase II Study of XYZ-123 in Type 2 Diabetes Mellitus',
    phase: 'Phase II',
    sponsor: 'XYZ Pharmaceuticals',
    indication: 'Type 2 Diabetes Mellitus',
    studyType: 'Interventional',
    design: 'Randomized, Double-Blind, Placebo-Controlled',
    duration: '26 weeks',
    targetSites: 25,
    targetEnrollment: 220,
    status: 'In Planning',
    targetMilestones: [
      { name: 'Final Protocol', date: '2025-05-15', status: 'Pending' },
      { name: 'First Site Activated', date: '2025-06-30', status: 'Pending' },
      { name: 'First Patient In', date: '2025-07-15', status: 'Pending' },
      { name: 'Last Patient In', date: '2025-12-30', status: 'Pending' },
      { name: 'Last Patient Out', date: '2026-06-30', status: 'Pending' },
      { name: 'Database Lock', date: '2026-07-30', status: 'Pending' },
      { name: 'Final CSR', date: '2026-10-30', status: 'Pending' }
    ]
  });

  const getMilestoneStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'Pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'Delayed':
        return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSaveStudy = () => {
    toast({
      title: "Study plan updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleExportStudy = () => {
    toast({
      title: "Exporting study plan",
      description: "Your study plan is being prepared for export.",
    });
    
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Study plan has been exported successfully.",
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
            <p className="text-gray-600 mt-2">
              Plan and manage your clinical study with intelligent tools for protocol development, 
              deviation management, and TMF preparation.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportStudy}>
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            <Button onClick={handleSaveStudy}>
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="mb-2">{studyDetails.phase}</Badge>
                <CardTitle className="text-xl">{studyDetails.title}</CardTitle>
                <CardDescription>
                  {studyDetails.sponsor} | {studyDetails.indication} | {studyDetails.design}
                </CardDescription>
              </div>
              <Badge 
                className={
                  studyDetails.status === 'Active' ? 'bg-green-100 text-green-800' :
                  studyDetails.status === 'In Planning' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {studyDetails.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Study Type</div>
                <div className="font-medium">{studyDetails.studyType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{studyDetails.duration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Target Sites</div>
                <div className="font-medium">{studyDetails.targetSites}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Target Enrollment</div>
                <div className="font-medium">{studyDetails.targetEnrollment} patients</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deviations">Protocol Deviations</TabsTrigger>
              <TabsTrigger value="prevention">Deviation Prevention</TabsTrigger>
              <TabsTrigger value="tmf">TMF Documents</TabsTrigger>
              <TabsTrigger value="integration">Document Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Key Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studyDetails.targetMilestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              milestone.status === 'Completed' ? 'bg-green-500' :
                              milestone.status === 'In Progress' ? 'bg-blue-500' :
                              milestone.status === 'Delayed' ? 'bg-red-500' :
                              'bg-gray-300'
                            }`} />
                            <div>
                              <div className="font-medium">{milestone.name}</div>
                              <div className="text-sm text-gray-500">{milestone.date}</div>
                            </div>
                          </div>
                          <div>
                            {getMilestoneStatusBadge(milestone.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/protocol-review')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Review Protocol Draft
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Create New Document
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Study Team
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Visit Schedule
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Edit Eligibility Criteria
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Statistical Design
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Folder className="h-4 w-4 mr-2" />
                        Document Manager
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Study Guidance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-md">
                        <div className="flex">
                          <Lightbulb className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Study Design Recommendation</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Consider adding a 12-week open-label extension period to your 26-week study. 
                              Based on similar studies in T2DM, this would provide valuable long-term safety data 
                              and may reduce dropout rates by allowing all patients access to active treatment.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-md">
                        <div className="flex">
                          <BookOpen className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Regulatory Insight</p>
                            <p className="text-sm text-green-700 mt-1">
                              Recent FDA feedback for T2DM studies suggests including continuous glucose monitoring 
                              as a secondary endpoint. 7 out of 8 recent approved protocols included this approach.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 rounded-md">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Risk Alert</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your target enrollment timeline may be optimistic based on historical recruitment rates 
                              for similar T2DM studies. Consider extending the recruitment period or expanding site network.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Get More AI Insights
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Study Team & Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-3">
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <div className="text-sm font-medium">Medical Director</div>
                          </div>
                          <div className="text-sm text-gray-500">Jane Smith, MD, PhD</div>
                          <div className="text-xs mt-1">Protocol design, medical monitoring</div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="flex items-center mb-2">
                            <Clipboard className="h-4 w-4 mr-2 text-green-500" />
                            <div className="text-sm font-medium">Study Manager</div>
                          </div>
                          <div className="text-sm text-gray-500">Robert Johnson, MPH</div>
                          <div className="text-xs mt-1">Operations, timeline management</div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="flex items-center mb-2">
                            <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                            <div className="text-sm font-medium">Statistician</div>
                          </div>
                          <div className="text-sm text-gray-500">Maria Garcia, PhD</div>
                          <div className="text-xs mt-1">Statistical design, analysis plan</div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="flex items-center mb-2">
                            <FileCheck className="h-4 w-4 mr-2 text-orange-500" />
                            <div className="text-sm font-medium">Regulatory Lead</div>
                          </div>
                          <div className="text-sm text-gray-500">David Chen, RAC</div>
                          <div className="text-xs mt-1">Regulatory strategy, submissions</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      View Full Team
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="deviations" className="mt-6">
              <ProtocolDeviationLog />
            </TabsContent>
            
            <TabsContent value="prevention" className="mt-6">
              <DeviationPreventionPlan />
            </TabsContent>
            
            <TabsContent value="tmf" className="mt-6">
              <TMFDocumentManager />
            </TabsContent>
            
            <TabsContent value="integration" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Management Integration</CardTitle>
                    <CardDescription>
                      Connect your study plan with TrialSage's Document Management System
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center">
                          <Folder className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="font-medium">Study Documents Folder</div>
                            <div className="text-sm text-gray-500">
                              12 documents, last updated 2 hours ago
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <FolderPlus className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <FileText className="h-5 w-5 text-blue-500 mr-2" />
                            <div className="font-medium">Protocol Documents</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Protocol v1.0 Draft</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Protocol Synopsis</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Protocol Review Notes</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <ClipboardList className="h-5 w-5 text-green-500 mr-2" />
                            <div className="font-medium">Study Plans</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Monitoring Plan</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Data Management Plan</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm">Statistical Analysis Plan</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-md">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Document Synchronization</p>
                            <p className="mt-1">
                              All documents created or modified in this study plan are automatically synchronized with the 
                              Document Management System. This ensures a single source of truth and maintains compliance 
                              with your organization's document control procedures.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setLocation('/document-management')}>
                      <Folder className="h-4 w-4 mr-2" />
                      Open Document Manager
                    </Button>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Document
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Protocol Review Integration</CardTitle>
                    <CardDescription>
                      Connect with Protocol Review & Intelligence for comprehensive analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="flex items-start">
                          <FileCheck className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium">Protocol Analysis History</div>
                            <div className="text-sm text-gray-500 mb-3">
                              Previous protocol reviews and analysis results
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                  <div className="text-sm font-medium">Protocol v0.8 Analysis</div>
                                  <div className="text-xs text-gray-500">Completed on April 15, 2025</div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                  <div className="text-sm font-medium">Protocol v0.9 Analysis</div>
                                  <div className="text-xs text-gray-500">Completed on April 20, 2025</div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="flex items-start">
                          <Brain className="h-5 w-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium">AI-Generated Protocol Improvements</div>
                            <div className="text-sm text-gray-500 mb-3">
                              Intelligence-driven suggestions from your last protocol analysis
                            </div>
                            
                            <div className="space-y-3">
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm font-medium">Primary Endpoint Optimization</div>
                                <div className="text-xs mt-1">
                                  Recommendation to include time-in-range CGM metrics as a co-primary endpoint
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">Dismiss</Button>
                                  <Button size="sm" className="h-7 text-xs ml-2">Apply</Button>
                                </div>
                              </div>
                              
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm font-medium">Statistical Analysis Approach</div>
                                <div className="text-xs mt-1">
                                  Recommendation to use multiple imputation instead of LOCF for missing data
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">Dismiss</Button>
                                  <Button size="sm" className="h-7 text-xs ml-2">Apply</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setLocation('/protocol-review')}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Analyze Current Protocol Draft
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default withAuthGuard(StudyPlanner);