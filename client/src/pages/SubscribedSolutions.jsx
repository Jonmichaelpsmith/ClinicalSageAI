import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/use-auth';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  File, 
  FileText, 
  FileCheck, 
  Settings, 
  HelpCircle, 
  Plus,
  Filter,
  Share2,
  Download,
  Upload,
  MoreHorizontal,
  Grid,
  List,
  Clock,
  Star,
  Users,
  Trash2
} from 'lucide-react';

// Microsoft style color scheme
const msColors = {
  blue: "#0078d4",
  lightBlue: "#b3dbff",
  gray: "#f3f2f1",
  darkGray: "#252423",
  border: "#edebe9",
  hover: "#f5f5f5",
  selected: "#e1efff"
};

const SubscribedSolutions = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'type'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  const [selectedFolders, setSelectedFolders] = useState([]);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'home', label: 'Home', icon: <ChevronRight className="h-4 w-4" /> },
    { id: 'recent', label: 'Recent', icon: <Clock className="h-4 w-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Star className="h-4 w-4" /> },
    { id: 'shared', label: 'Shared with me', icon: <Users className="h-4 w-4" /> },
    { id: 'recycle', label: 'Recycle bin', icon: <Trash2 className="h-4 w-4" /> },
  ];

  // Module categories (like OneDrive main folders)
  const moduleCategories = [
    { id: 'indRegulatoryDocs', label: 'IND Applications' },
    { id: 'csrDocs', label: 'Clinical Study Reports' },
    { id: 'cmcDocs', label: 'CMC Documentation' },
    { id: 'validationDocs', label: 'Validation Documents' },
    { id: 'protocolDocs', label: 'Protocol Design Files' },
    { id: 'lumenDocs', label: 'Lumen AI Analyses' },
  ];

  // Document modules with Microsoft-style organization
  const documentModules = [
    {
      id: 1,
      name: "IND Wizard Documents",
      icon: <Folder size={40} className="text-[#ffd15c]" />,
      category: 'indRegulatoryDocs',
      lastModified: "2025-04-20",
      description: "Automated IND application documents",
      path: "/solutions/ind-wizard",
      files: [
        { id: 101, name: "IND Form 1571.docx", type: "docx", size: "2.4 MB", lastModified: "2025-04-19" },
        { id: 102, name: "Clinical Protocol.docx", type: "docx", size: "4.7 MB", lastModified: "2025-04-18" },
        { id: 103, name: "Investigator Brochure.pdf", type: "pdf", size: "3.2 MB", lastModified: "2025-04-17" },
        { id: 104, name: "CMC Section.docx", type: "docx", size: "5.1 MB", lastModified: "2025-04-16" },
        { id: 105, name: "Pharmacology Study.pdf", type: "pdf", size: "2.8 MB", lastModified: "2025-04-15" }
      ]
    },
    {
      id: 2,
      name: "CSR Intelligence",
      icon: <Folder size={40} className="text-[#4472c4]" />,
      category: 'csrDocs',
      lastModified: "2025-04-18",
      description: "Clinical study reports and analysis",
      path: "/solutions/csr-intelligence",
      files: [
        { id: 201, name: "Phase 2 CSR.docx", type: "docx", size: "7.2 MB", lastModified: "2025-04-18" },
        { id: 202, name: "Statistical Analysis.xlsx", type: "xlsx", size: "3.6 MB", lastModified: "2025-04-17" },
        { id: 203, name: "Efficacy Analysis.pptx", type: "pptx", size: "5.4 MB", lastModified: "2025-04-16" },
        { id: 204, name: "Safety Tables.xlsx", type: "xlsx", size: "2.9 MB", lastModified: "2025-04-15" },
        { id: 205, name: "CSR Template.docx", type: "docx", size: "1.8 MB", lastModified: "2025-04-14" }
      ]
    },
    {
      id: 3,
      name: "CMC Documentation",
      icon: <Folder size={40} className="text-[#5b9bd5]" />,
      category: 'cmcDocs',
      lastModified: "2025-04-17",
      description: "Chemistry, Manufacturing & Controls files",
      path: "/solutions/cmc-insights",
      files: [
        { id: 301, name: "Drug Substance.docx", type: "docx", size: "4.3 MB", lastModified: "2025-04-17" },
        { id: 302, name: "Manufacturing Process.pdf", type: "pdf", size: "6.8 MB", lastModified: "2025-04-16" },
        { id: 303, name: "Analytical Methods.docx", type: "docx", size: "3.5 MB", lastModified: "2025-04-15" },
        { id: 304, name: "Stability Data.xlsx", type: "xlsx", size: "2.7 MB", lastModified: "2025-04-14" },
        { id: 305, name: "Container Closure.pdf", type: "pdf", size: "1.9 MB", lastModified: "2025-04-13" }
      ]
    },
    {
      id: 4,
      name: "Validation Hub",
      icon: <Folder size={40} className="text-[#70ad47]" />,
      category: 'validationDocs',
      lastModified: "2025-04-15",
      description: "21 CFR Part 11 compliance validation",
      path: "/validation-hub-enhanced",
      files: [
        { id: 401, name: "Software Validation.pdf", type: "pdf", size: "3.8 MB", lastModified: "2025-04-15" },
        { id: 402, name: "CSV Documentation.docx", type: "docx", size: "5.2 MB", lastModified: "2025-04-14" },
        { id: 403, name: "Validation Protocol.docx", type: "docx", size: "4.6 MB", lastModified: "2025-04-13" },
        { id: 404, name: "Trace Matrix.xlsx", type: "xlsx", size: "2.1 MB", lastModified: "2025-04-12" },
        { id: 405, name: "Electronic Records.pdf", type: "pdf", size: "3.4 MB", lastModified: "2025-04-11" }
      ]
    },
    {
      id: 5,
      name: "Protocol Design",
      icon: <Folder size={40} className="text-[#ed7d31]" />,
      category: 'protocolDocs',
      lastModified: "2025-04-14",
      description: "Clinical protocol design documents",
      path: "/solutions/protocol-optimization",
      files: [
        { id: 501, name: "Protocol Template.docx", type: "docx", size: "3.7 MB", lastModified: "2025-04-14" },
        { id: 502, name: "Study Endpoints.docx", type: "docx", size: "2.5 MB", lastModified: "2025-04-13" },
        { id: 503, name: "Inclusion Criteria.docx", type: "docx", size: "1.9 MB", lastModified: "2025-04-12" },
        { id: 504, name: "Statistical Plan.pdf", type: "pdf", size: "4.3 MB", lastModified: "2025-04-11" },
        { id: 505, name: "Protocol Amendments.docx", type: "docx", size: "2.8 MB", lastModified: "2025-04-10" }
      ]
    },
    {
      id: 6,
      name: "Ask Lumen Reports",
      icon: <Folder size={40} className="text-[#a5a5a5]" />,
      category: 'lumenDocs',
      lastModified: "2025-04-12",
      description: "AI-generated regulatory insights",
      path: "/solutions/ask-lumen",
      files: [
        { id: 601, name: "Regulatory Requirements.pdf", type: "pdf", size: "2.6 MB", lastModified: "2025-04-12" },
        { id: 602, name: "Compliance Analysis.docx", type: "docx", size: "3.4 MB", lastModified: "2025-04-11" },
        { id: 603, name: "Submission Strategy.pptx", type: "pptx", size: "4.8 MB", lastModified: "2025-04-10" },
        { id: 604, name: "Regulatory Timeline.xlsx", type: "xlsx", size: "1.7 MB", lastModified: "2025-04-09" },
        { id: 605, name: "Market Insights.pdf", type: "pdf", size: "3.2 MB", lastModified: "2025-04-08" }
      ]
    }
  ];

  // Filter modules based on search query and selected category
  const filteredModules = documentModules
    .filter(module => 
      (!selectedModule || module.category === selectedModule) &&
      (searchQuery === '' || 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.lastModified) - new Date(b.lastModified)
          : new Date(b.lastModified) - new Date(a.lastModified);
      }
      return 0;
    });

  const handleModuleSelect = (moduleId) => {
    if (selectedFolders.includes(moduleId)) {
      setSelectedFolders(selectedFolders.filter(id => id !== moduleId));
    } else {
      setSelectedFolders([...selectedFolders, moduleId]);
    }
  };

  const handleModuleOpen = (path) => {
    setLocation(path);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'docx':
        return <FileText className="text-blue-600" />;
      case 'pdf':
        return <FileText className="text-red-600" />;
      case 'xlsx':
        return <FileText className="text-green-600" />;
      case 'pptx':
        return <FileText className="text-orange-600" />;
      default:
        return <File />;
    }
  };

  // Function to toggle module selection
  const toggleCategorySelection = (categoryId) => {
    if (selectedModule === categoryId) {
      setSelectedModule(null);
    } else {
      setSelectedModule(categoryId);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Left Sidebar Navigation (Microsoft-style) */}
        <div className="w-64 bg-white border-r border-[#edebe9] h-full overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">TrialSage Files</h2>
            
            <div className="space-y-1">
              {sidebarItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center py-2 px-3 rounded hover:bg-[#f3f2f1] cursor-pointer"
                >
                  <span className="mr-3 text-[#605e5c]">{item.icon}</span>
                  <span className="text-[#323130]">{item.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-wider text-[#605e5c] font-semibold px-3 mb-2">Categories</h3>
              
              <div className="space-y-1">
                {moduleCategories.map(category => (
                  <div 
                    key={category.id}
                    className={`flex items-center py-2 px-3 rounded cursor-pointer ${
                      selectedModule === category.id ? 'bg-[#e1efff] font-medium text-[#0078d4]' : 'hover:bg-[#f3f2f1] text-[#323130]'
                    }`}
                    onClick={() => toggleCategorySelection(category.id)}
                  >
                    <span className="mr-3">
                      {selectedModule === category.id ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </span>
                    <span>{category.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Command Bar (Microsoft-style) */}
          <div className="bg-white border-b border-[#edebe9] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Upload className="h-5 w-5" />
              </button>
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Share2 className="h-5 w-5" />
              </button>
              <div className="h-5 border-r border-[#edebe9] mx-1"></div>
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 pl-10 rounded border border-[#edebe9] focus:outline-none focus:ring-1 focus:ring-[#0078d4] focus:border-[#0078d4]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#605e5c]" />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#f3f2f1]' : 'hover:bg-[#f3f2f1]'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5 text-[#323130]" />
              </button>
              <button 
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#f3f2f1]' : 'hover:bg-[#f3f2f1]'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5 text-[#323130]" />
              </button>
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-[#323130] rounded hover:bg-[#f3f2f1]">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-[#323130]">My Documents</h1>
              <p className="text-[#605e5c]">
                {selectedModule ? 
                  moduleCategories.find(c => c.id === selectedModule)?.label : 
                  'All Documents'
                } 
                • {filteredModules.length} {filteredModules.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            {/* Grid or List View */}
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredModules.map(module => (
                  <div 
                    key={module.id}
                    className={`border rounded-md overflow-hidden cursor-pointer transition-all ${
                      selectedFolders.includes(module.id) 
                        ? 'border-[#0078d4] bg-[#e1efff]' 
                        : 'border-[#edebe9] hover:border-[#c8c6c4]'
                    }`}
                    onClick={() => handleModuleSelect(module.id)}
                    onDoubleClick={() => handleModuleOpen(module.path)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        {module.icon}
                        <button className="p-1 text-[#605e5c] hover:text-[#323130] hover:bg-[#f3f2f1] rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <h3 className="font-medium text-[#323130] truncate">{module.name}</h3>
                      <p className="text-sm text-[#605e5c] mt-1">{formatDate(module.lastModified)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-[#edebe9]">
                      <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange('name')}
                        >
                          Name
                          {sortBy === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Category</th>
                      <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange('date')}
                        >
                          Last Modified
                          {sortBy === 'date' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map(module => (
                      <tr 
                        key={module.id}
                        className={`border-b border-[#edebe9] hover:bg-[#f3f2f1] cursor-pointer ${
                          selectedFolders.includes(module.id) ? 'bg-[#e1efff]' : ''
                        }`}
                        onClick={() => handleModuleSelect(module.id)}
                        onDoubleClick={() => handleModuleOpen(module.path)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {module.icon}
                            <span className="ml-3 text-[#323130]">{module.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#605e5c]">
                          {moduleCategories.find(c => c.id === module.category)?.label}
                        </td>
                        <td className="py-3 px-4 text-[#605e5c]">{formatDate(module.lastModified)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-[#605e5c] hover:text-[#323130] hover:bg-[#f3f2f1] rounded">
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-[#605e5c] hover:text-[#323130] hover:bg-[#f3f2f1] rounded">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-[#605e5c] hover:text-[#323130] hover:bg-[#f3f2f1] rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* File Preview if a single folder is selected */}
            {selectedFolders.length === 1 && (
              <div className="mt-8 border-t border-[#edebe9] pt-6">
                <h2 className="text-xl font-semibold text-[#323130] mb-4">Folder Contents</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-[#edebe9]">
                        <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Name</th>
                        <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Type</th>
                        <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Size</th>
                        <th className="py-3 px-4 font-semibold text-[#605e5c] text-sm">Last Modified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentModules
                        .find(m => m.id === selectedFolders[0])?.files
                        .map(file => (
                          <tr 
                            key={file.id}
                            className="border-b border-[#edebe9] hover:bg-[#f3f2f1] cursor-pointer"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getFileIcon(file.type)}
                                <span className="ml-3 text-[#323130]">{file.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#605e5c] uppercase">{file.type}</td>
                            <td className="py-3 px-4 text-[#605e5c]">{file.size}</td>
                            <td className="py-3 px-4 text-[#605e5c]">{formatDate(file.lastModified)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Status Bar */}
          <div className="bg-white border-t border-[#edebe9] px-4 py-2 text-sm text-[#605e5c] flex justify-between items-center">
            <div>
              {filteredModules.length} {filteredModules.length === 1 ? 'item' : 'items'}
            </div>
            <div className="flex items-center">
              <button className="p-1 text-[#605e5c] hover:text-[#323130] rounded">
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscribedSolutions;