import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import Layout from '../components/Layout';
import { 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  PieChart, 
  Layers, 
  Beaker, 
  Brain, 
  LineChart, 
  BarChart2, 
  HelpCircle,
  Upload,
  Folder,
  FilePlus,
  Clock,
  Tag,
  Search,
  Filter,
  AlertCircle,
  Lock,
  Download,
  ExternalLink,
  BookOpen,
  Share2
} from 'lucide-react';

const ClientPortal = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeDocumentTab, setActiveDocumentTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWordIntegration, setShowWordIntegration] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { toast } = useToast();

  // Hardcoded solutions for demo purposes
  const subscribedSolutions = [
    {
      id: 1,
      name: "IND Wizard",
      description: "Automate IND application creation",
      icon: <Beaker className="h-6 w-6" />,
      status: "active",
      route: "/solutions/ind-wizard",
      stats: { completedDocs: 12, inProgress: 3 },
      lastActivity: "2025-05-16",
      progress: 68,
      msOfficeIntegration: true
    },
    {
      id: 2,
      name: "CSR Deep Intelligence",
      description: "Advanced clinical study report analytics",
      icon: <Brain className="h-6 w-6" />,
      status: "active",
      route: "/solutions/csr-intelligence",
      stats: { analyzedReports: 28, insights: 142 },
      lastActivity: "2025-05-15",
      progress: 75,
      msOfficeIntegration: true
    },
    {
      id: 3,
      name: "CMC Insights",
      description: "Chemistry, Manufacturing & Controls management",
      icon: <Beaker className="h-6 w-6" />,
      status: "active",
      route: "/solutions/cmc-insights",
      stats: { activePlans: 5, validations: 17 },
      lastActivity: "2025-05-12",
      progress: 42,
      msOfficeIntegration: false
    },
    {
      id: 4,
      name: "Ask Lumen",
      description: "AI regulatory compliance assistant",
      icon: <HelpCircle className="h-6 w-6" />,
      status: "active",
      route: "/solutions/ask-lumen",
      stats: { queries: 64, avgResponseTime: "1.2s" },
      lastActivity: "2025-05-17",
      progress: 100,
      msOfficeIntegration: false
    },
    {
      id: 5,
      name: "Protocol Optimization",
      description: "Clinical protocol design and optimization",
      icon: <LineChart className="h-6 w-6" />,
      status: "active",
      route: "/solutions/protocol-optimization",
      stats: { optimizedProtocols: 8, improvements: 32 },
      lastActivity: "2025-05-10",
      progress: 35,
      msOfficeIntegration: true
    },
    {
      id: 6,
      name: "eCTD Co-Author",
      description: "AI-assisted co-authoring of regulatory submissions with Microsoft Word integration",
      icon: <FileEdit className="h-6 w-6" />,
      status: "active",
      route: "/coauthor",
      stats: { documents: 15, submissionReady: 8 },
      lastActivity: "2025-05-17",
      progress: 85,
      msOfficeIntegration: true,
      isNew: true
    },
    {
      id: 7,
      name: "Medical Device RA",
      description: "CER and 510(k) regulatory automation for medical devices",
      icon: <Stethoscope className="h-6 w-6" />,
      status: "active",
      route: "/cerv2",
      stats: { documents: 7, validationPassed: 5 },
      lastActivity: "2025-05-14",
      progress: 62,
      msOfficeIntegration: true
    },
    {
      id: 8,
      name: "Validation Hub",
      description: "21 CFR Part 11 compliance validation",
      icon: <CheckCircle className="h-6 w-6" />,
      status: "active",
      route: "/validation-hub-enhanced",
      stats: { validations: 23, compliance: "98%" },
      lastActivity: "2025-05-08",
      progress: 98,
      msOfficeIntegration: false
    }
  ];

  // Recent activities for the activity feed
  const recentActivities = [
    { id: 1, type: 'document', title: 'IND Application 2025-04R', action: 'modified', time: '2 hours ago' },
    { id: 2, type: 'validation', title: 'Protocol 23B Validation', action: 'completed', time: '3 hours ago' },
    { id: 3, type: 'analytics', title: 'CSR Performance Report', action: 'generated', time: '5 hours ago' },
    { id: 4, type: 'document', title: 'CMC Strategy Document', action: 'created', time: '1 day ago' },
    { id: 5, type: 'validation', title: 'Regulatory Compliance Check', action: 'passed', time: '2 days ago' }
  ];
  
  // Document management data
  const documentCategories = [
    { id: 'recent', name: 'Recent Documents', icon: <Clock className="h-4 w-4" /> },
    { id: 'regulatory', name: 'Regulatory', icon: <FileText className="h-4 w-4" /> },
    { id: 'clinical', name: 'Clinical', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'manufacturing', name: 'Manufacturing', icon: <Layers className="h-4 w-4" /> },
    { id: 'quality', name: 'Quality', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'shared', name: 'Shared With Me', icon: <Share2 className="h-4 w-4" /> },
  ];
  
  // Document data by category
  const documentsByCategory = {
    recent: [
      { id: 1, name: 'IND Application 2025-04R.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', status: 'Final', category: 'Regulatory' },
      { id: 2, name: 'Protocol 23B.docx', type: 'DOCX', size: '1.8 MB', modified: '3 hours ago', status: 'Draft', category: 'Clinical' },
      { id: 3, name: 'CSR Performance Report.xlsx', type: 'XLSX', size: '5.1 MB', modified: '5 hours ago', status: 'Final', category: 'Clinical' },
      { id: 4, name: 'CMC Strategy Document.pdf', type: 'PDF', size: '3.2 MB', modified: '1 day ago', status: 'In Review', category: 'Manufacturing' },
      { id: 5, name: 'Regulatory Compliance Check.pdf', type: 'PDF', size: '1.5 MB', modified: '2 days ago', status: 'Final', category: 'Quality' },
      { id: 6, name: 'Protocol Amendment 12.docx', type: 'DOCX', size: '2.1 MB', modified: '3 days ago', status: 'Draft', category: 'Clinical' },
    ],
    regulatory: [
      { id: 7, name: 'IND Application 2025-04R.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', status: 'Final', category: 'Regulatory' },
      { id: 8, name: 'NDA Form 356h.pdf', type: 'PDF', size: '1.3 MB', modified: '5 days ago', status: 'Final', category: 'Regulatory' },
      { id: 9, name: 'FDA Response Letter.pdf', type: 'PDF', size: '0.8 MB', modified: '1 week ago', status: 'Final', category: 'Regulatory' },
      { id: 10, name: 'EMA Submission Package.zip', type: 'ZIP', size: '24.6 MB', modified: '2 weeks ago', status: 'Final', category: 'Regulatory' },
      { id: 11, name: 'Regulatory Strategy 2025.pptx', type: 'PPTX', size: '5.7 MB', modified: '3 weeks ago', status: 'Draft', category: 'Regulatory' },
    ],
    clinical: [
      { id: 12, name: 'Protocol 23B.docx', type: 'DOCX', size: '1.8 MB', modified: '3 hours ago', status: 'Draft', category: 'Clinical' },
      { id: 13, name: 'CSR Performance Report.xlsx', type: 'XLSX', size: '5.1 MB', modified: '5 hours ago', status: 'Final', category: 'Clinical' },
      { id: 14, name: 'Protocol Amendment 12.docx', type: 'DOCX', size: '2.1 MB', modified: '3 days ago', status: 'Draft', category: 'Clinical' },
      { id: 15, name: 'Clinical Data Analysis.xlsx', type: 'XLSX', size: '7.2 MB', modified: '1 week ago', status: 'Final', category: 'Clinical' },
      { id: 16, name: 'Patient Enrollment Summary.pdf', type: 'PDF', size: '1.2 MB', modified: '2 weeks ago', status: 'Final', category: 'Clinical' },
    ],
    manufacturing: [
      { id: 17, name: 'CMC Strategy Document.pdf', type: 'PDF', size: '3.2 MB', modified: '1 day ago', status: 'In Review', category: 'Manufacturing' },
      { id: 18, name: 'Manufacturing Process Flow.pptx', type: 'PPTX', size: '4.5 MB', modified: '5 days ago', status: 'Final', category: 'Manufacturing' },
      { id: 19, name: 'Batch Production Records.pdf', type: 'PDF', size: '8.3 MB', modified: '1 week ago', status: 'Final', category: 'Manufacturing' },
      { id: 20, name: 'Stability Testing Results.xlsx', type: 'XLSX', size: '3.7 MB', modified: '2 weeks ago', status: 'Final', category: 'Manufacturing' },
    ],
    quality: [
      { id: 21, name: 'Regulatory Compliance Check.pdf', type: 'PDF', size: '1.5 MB', modified: '2 days ago', status: 'Final', category: 'Quality' },
      { id: 22, name: 'Quality Control Procedures.docx', type: 'DOCX', size: '2.2 MB', modified: '1 week ago', status: 'Final', category: 'Quality' },
      { id: 23, name: 'GMP Audit Results.pdf', type: 'PDF', size: '3.4 MB', modified: '3 weeks ago', status: 'Final', category: 'Quality' },
      { id: 24, name: 'CAPA Documentation.xlsx', type: 'XLSX', size: '1.9 MB', modified: '1 month ago', status: 'In Review', category: 'Quality' },
    ],
    shared: [
      { id: 25, name: 'Product Specification File.docx', type: 'DOCX', size: '1.7 MB', modified: '4 days ago', status: 'Final', category: 'Regulatory', sharedBy: 'Regulatory Affairs' },
      { id: 26, name: 'Clinical Study Synopsis.pdf', type: 'PDF', size: '2.3 MB', modified: '1 week ago', status: 'Draft', category: 'Clinical', sharedBy: 'Clinical Operations' },
      { id: 27, name: 'Manufacturing Site Transfer Plan.pptx', type: 'PPTX', size: '6.5 MB', modified: '2 weeks ago', status: 'In Review', category: 'Manufacturing', sharedBy: 'CMC Team' },
    ],
  };
  
  // Document status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Final':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Final</span>;
      case 'Draft':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Draft</span>;
      case 'In Review':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">In Review</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'validation': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'analytics': return <PieChart className="h-5 w-5 text-purple-500" />;
      default: return <Layers className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatDisplay = (solution) => {
    const stats = solution.stats;
    
    if (stats.completedDocs !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Completed:</span> 
            <span className="ml-1 font-medium">{stats.completedDocs}</span>
          </div>
          <div>
            <span className="text-gray-500">In Progress:</span> 
            <span className="ml-1 font-medium">{stats.inProgress}</span>
          </div>
        </div>
      );
    }
    
    if (stats.analyzedReports !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Reports:</span> 
            <span className="ml-1 font-medium">{stats.analyzedReports}</span>
          </div>
          <div>
            <span className="text-gray-500">Insights:</span> 
            <span className="ml-1 font-medium">{stats.insights}</span>
          </div>
        </div>
      );
    }
    
    if (stats.activePlans !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Active Plans:</span> 
            <span className="ml-1 font-medium">{stats.activePlans}</span>
          </div>
          <div>
            <span className="text-gray-500">Validations:</span> 
            <span className="ml-1 font-medium">{stats.validations}</span>
          </div>
        </div>
      );
    }
    
    if (stats.queries !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Queries:</span> 
            <span className="ml-1 font-medium">{stats.queries}</span>
          </div>
          <div>
            <span className="text-gray-500">Response Time:</span> 
            <span className="ml-1 font-medium">{stats.avgResponseTime}</span>
          </div>
        </div>
      );
    }
    
    if (stats.optimizedProtocols !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Protocols:</span> 
            <span className="ml-1 font-medium">{stats.optimizedProtocols}</span>
          </div>
          <div>
            <span className="text-gray-500">Improvements:</span> 
            <span className="ml-1 font-medium">{stats.improvements}</span>
          </div>
        </div>
      );
    }
    
    if (stats.validations !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Validations:</span> 
            <span className="ml-1 font-medium">{stats.validations}</span>
          </div>
          <div>
            <span className="text-gray-500">Compliance:</span> 
            <span className="ml-1 font-medium">{stats.compliance}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || 'Valued Customer'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your TrialSage Solutions</h2>
                <button 
                  onClick={() => setLocation('/account/subscribed-solutions')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscribedSolutions.map(solution => (
                  <div 
                    key={solution.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => setLocation(solution.route)}
                  >
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-50 mr-4">
                        {solution.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-md font-semibold text-gray-900">{solution.name}</h3>
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Active
                          </div>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600 mb-2">
                          {solution.description}
                        </p>
                        
                        {getStatDisplay(solution)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setLocation('/account/subscribed-solutions')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800 mt-2"
                >
                  See More Solutions
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            {/* Document Management Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Document Management</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowWordIntegration(true)}
                    className="mr-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                  >
                    <FileEdit className="h-3.5 w-3.5 mr-1" />
                    Edit in Word
                  </button>
                  <button
                    onClick={() => setLocation('/document-management')}
                    className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                  >
                    Full Document Manager
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 flex flex-wrap items-center justify-between">
                <div className="flex overflow-x-auto pb-2 mb-2 sm:mb-0 space-x-2">
                  {documentCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveDocumentTab(category.id)}
                      className={`flex items-center px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                        activeDocumentTab === category.id
                          ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {React.cloneElement(category.icon, { 
                        className: `mr-1.5 ${activeDocumentTab === category.id ? 'text-blue-500' : 'text-gray-500'}`
                      })}
                      {category.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <button
                    className="ml-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Modified
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documentsByCategory[activeDocumentTab]?.map((document) => (
                        <tr key={document.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-blue-50 rounded-md flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{document.name}</div>
                                <div className="text-xs text-gray-500">{document.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{document.category}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(document.status)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {document.modified}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {document.size}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-800" title="Download">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800" title="Share">
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800" title="Open">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <button 
                  onClick={() => setLocation('/enterprise-vault')}
                  className="text-sm flex items-center text-gray-600 hover:text-gray-800"
                >
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Secure Enterprise Vault
                </button>
                
                <button 
                  onClick={() => setLocation('/document-management')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FilePlus className="h-4 w-4 mr-1.5" />
                  Upload New Document
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Quick Analytics</h2>
                <button 
                  onClick={() => setLocation('/analytics-dashboard')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                >
                  View Complete Analytics
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Documents</p>
                      <p className="text-2xl font-bold text-gray-900">127</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-2 text-sm text-blue-600">+12% from last month</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Validations</p>
                      <p className="text-2xl font-bold text-gray-900">48</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2 text-sm text-green-600">98% compliance rate</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">AI Insights</p>
                      <p className="text-2xl font-bold text-gray-900">256</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2 text-sm text-purple-600">42 critical findings</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Feed</h2>
              
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        <span className="capitalize">{activity.action}</span> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setLocation('/activity-history')}
                className="mt-4 w-full py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex justify-center items-center"
              >
                View All Activity
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Workflows</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <div className="mr-3 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Pending Approval</h3>
                      <p className="text-xs text-yellow-700 mt-0.5">3 documents need your review</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button 
                      onClick={() => setLocation('/document-management?filter=pending')}
                      className="w-full py-1.5 px-3 bg-white border border-yellow-300 text-yellow-800 text-xs rounded-md hover:bg-yellow-50 transition-colors flex justify-center items-center"
                    >
                      Review Documents
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="mr-3 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Draft Documents</h3>
                      <p className="text-xs text-blue-700 mt-0.5">5 documents in draft stage</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button 
                      onClick={() => setLocation('/document-management?filter=draft')}
                      className="w-full py-1.5 px-3 bg-white border border-blue-300 text-blue-800 text-xs rounded-md hover:bg-blue-50 transition-colors flex justify-center items-center"
                    >
                      Continue Editing
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="mr-3 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Ready for Submission</h3>
                      <p className="text-xs text-green-700 mt-0.5">2 documents validated & ready</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button 
                      onClick={() => setLocation('/document-management?filter=ready')}
                      className="w-full py-1.5 px-3 bg-white border border-green-300 text-green-800 text-xs rounded-md hover:bg-green-50 transition-colors flex justify-center items-center"
                    >
                      Submit Documents
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={() => setLocation('/document-workflows')}
                  className="w-full py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex justify-center items-center"
                >
                  View All Workflows
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Support Resources</h2>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setLocation('/solutions/ask-lumen')}
                  className="w-full py-2 px-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex justify-between items-center"
                >
                  <span className="font-medium">Ask Lumen AI Assistant</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/documentation')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Documentation</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/training')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Training Videos</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/contact-support')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Contact Support</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Microsoft Word Integration Dialog */}
      <Dialog open={showWordIntegration} onOpenChange={setShowWordIntegration}>
        <DialogContent className="max-w-5xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Microsoft Word Integration</DialogTitle>
            <DialogDescription>
              Edit your documents using Microsoft Word with automatic VAULT synchronization
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[65vh]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p>Loading Microsoft Word integration...</p>
                </div>
              </div>
            }>
              <div className="h-full flex flex-col">
                {/* Document Header */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedDocument ? selectedDocument.name : "Document Editor"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Last modified: {selectedDocument ? selectedDocument.modified : "Just now"}
                      </span>
                      <Badge variant="outline">
                        {selectedDocument ? selectedDocument.status : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast({
                        title: "Document Downloaded",
                        description: "Document has been downloaded for offline editing.",
                      })}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Document Saved",
                          description: "All changes have been synchronized with VAULT.",
                        });
                        
                        // Close dialog after saving
                        setTimeout(() => {
                          setShowWordIntegration(false);
                        }, 1500);
                      }}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save to VAULT
                    </Button>
                  </div>
                </div>
                
                {/* Document Editing Frame */}
                <div className="border rounded-md h-full overflow-hidden">
                  <iframe 
                    src="https://learn.microsoft.com/en-us/office/client-developer/word/word-javascript-reference" 
                    className="w-full h-[55vh]" 
                    title="Microsoft Word Online" 
                  />
                </div>
                
                {/* Footer */}
                <div className="mt-4 border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileCheck className="h-4 w-4 mr-2" />
                    <span>VAULT synchronized • </span>
                    <AlertCircle className="h-4 w-4 mx-2" />
                    <span>All changes automatically tracked</span>
                  </div>
                  <Button onClick={() => setShowWordIntegration(false)}>
                    Complete Editing
                  </Button>
                </div>
              </div>
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClientPortal;