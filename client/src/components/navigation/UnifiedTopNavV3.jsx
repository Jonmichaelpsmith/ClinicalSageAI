import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  LayoutDashboard, 
  FileText, 
  FlaskConical,
  Folder, 
  Search, 
  BarChart3, 
  Calendar,
  Bell,
  HelpCircle,
  User,
  MessageSquare
} from "lucide-react";

const moduleConfig = [
  { id: "regulatory-intel", name: "Regulatory Intelligence", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
  { id: "ind-wizard", name: "IND Wizard", icon: <FileText className="w-4 h-4 mr-2" /> },
  { id: "vault", name: "Document Vault", icon: <Folder className="w-4 h-4 mr-2" /> },
  { id: "csr-intelligence", name: "CSR Intelligence", icon: <FlaskConical className="w-4 h-4 mr-2" /> },
  { id: "timeline", name: "Timeline Planner", icon: <Calendar className="w-4 h-4 mr-2" /> },
];

// Routes and breadcrumb mappings
const routeConfig = {
  "/client-portal": { label: "Home", parent: null },
  "/client-portal/regulatory-intel": { label: "Regulatory Intelligence Hub", parent: "/client-portal" },
  "/client-portal/regulatory-intel/risk-heatmap": { label: "Risk Heatmap", parent: "/client-portal/regulatory-intel" },
  "/client-portal/regulatory-intel/timeline": { label: "Timeline Simulator", parent: "/client-portal/regulatory-intel" },
  "/client-portal/ind-wizard": { label: "IND Wizard", parent: "/client-portal" },
  "/client-portal/ind-wizard/sponsor": { label: "Sponsor Information", parent: "/client-portal/ind-wizard" },
  "/client-portal/ind-wizard/investigator": { label: "Investigator Information", parent: "/client-portal/ind-wizard" },
  "/client-portal/ind-wizard/protocol": { label: "Protocol Synopsis", parent: "/client-portal/ind-wizard" },
  "/client-portal/vault": { label: "Document Vault", parent: "/client-portal" },
  "/client-portal/csr-intelligence": { label: "CSR Intelligence", parent: "/client-portal" },
  "/client-portal/timeline": { label: "Timeline Planner", parent: "/client-portal" },
};

export default function UnifiedTopNavV3({ currentModule = "", currentPage = "" }) {
  const [location, navigate] = useLocation();
  const [selectedModule, setSelectedModule] = useState(currentModule || "regulatory-intel");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // History management for back/forward navigation
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // When location changes, update history
  useEffect(() => {
    if (location !== history[historyIndex]) {
      // If we navigated using back/forward, don't add to history
      if (history[historyIndex + 1] !== location) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(location);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      
      // Determine selected module based on current location
      const modulePath = location.split('/').slice(0, 3).join('/');
      for (const module of moduleConfig) {
        if (modulePath.includes(module.id)) {
          setSelectedModule(module.id);
          break;
        }
      }
      
      // Update breadcrumbs when location changes
      generateBreadcrumbs(location);
    }
  }, [location]);
  
  // Update breadcrumbs when currentModule or currentPage props change
  useEffect(() => {
    generateBreadcrumbs(location);
  }, [currentModule, currentPage]);
  
  // Generate breadcrumbs based on current location
  const generateBreadcrumbs = (path) => {
    // Use default path-based breadcrumbs
    if (!currentModule || !currentPage) {
      const pathSegments = [];
      let currentPath = path;
      
      while (currentPath && routeConfig[currentPath]) {
        pathSegments.unshift({
          path: currentPath,
          label: routeConfig[currentPath].label,
        });
        currentPath = routeConfig[currentPath].parent;
      }
      
      setBreadcrumbs(pathSegments);
      return;
    }
    
    // Use props-based breadcrumbs for specialized pages
    const moduleName = moduleConfig.find(m => m.id === currentModule)?.name || "Regulatory Intelligence";
    
    // Create breadcrumb trail based on current module and page
    const customBreadcrumbs = [
      {
        path: "/client-portal",
        label: "Home"
      },
      {
        path: `/client-portal/${currentModule}`,
        label: moduleName
      }
    ];
    
    // Add current page if provided and different from module
    if (currentPage && currentPage !== moduleName) {
      customBreadcrumbs.push({
        path: `#${currentPage.toLowerCase().replace(/\s+/g, '-')}`,
        label: currentPage
      });
    }
    
    setBreadcrumbs(customBreadcrumbs);
  };
  
  // Navigate to a module
  const handleModuleChange = (moduleId) => {
    setSelectedModule(moduleId);
    navigate(`/client-portal/${moduleId}`);
  };
  
  // Navigate back in history
  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigate(history[newIndex]);
    }
  };
  
  // Navigate forward in history
  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigate(history[newIndex]);
    }
  };
  
  // Navigate home
  const handleHome = () => {
    navigate("/client-portal");
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Navigation and Module Switcher Row */}
      <div className="px-4 py-2 flex items-center justify-between border-b transition-all duration-300 ease-in-out">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <div className="mx-2 h-4 border-l border-gray-300"></div>
          
          <div className="hidden md:flex items-center">
            <LayoutDashboard className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="font-semibold text-lg text-indigo-900">TrialSage™ Elite</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Module Tabs Row */}
      <div className="px-4 flex items-center justify-between border-b transition-all duration-300 ease-in-out">
        <Tabs 
          value={selectedModule} 
          onValueChange={handleModuleChange}
          className="w-full transition-all duration-300 ease-in-out"
        >
          <TabsList className="h-10 bg-transparent justify-start w-full overflow-x-auto">
            {moduleConfig.map((module) => (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="transition-all duration-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4"
              >
                <div className="flex items-center">
                  {module.icon}
                  <span>{module.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Breadcrumb Row */}
      <div className="px-4 py-2 flex items-center justify-between text-xs bg-gray-50 border-b transition-all duration-300 ease-in-out">
        <div className="flex-1 animate-fadeIn">
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center flex-wrap">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                  {index > 0 && <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />}
                  <Link 
                    href={breadcrumb.path}
                    className={`text-gray-600 hover:text-indigo-600 hover:underline transition-all duration-200 ${index === breadcrumbs.length - 1 ? 'font-medium text-indigo-700' : ''}`}
                  >
                    {index === 0 ? (
                      <div className="flex items-center">
                        <Home className="h-3 w-3 mr-1" />
                        {breadcrumb.label}
                      </div>
                    ) : breadcrumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex items-center text-gray-600">
              <Home className="h-3 w-3 mr-1" />
              <span>Home</span>
            </div>
          )}
        </div>
        
        {/* Ask Lumen AI Button */}
        <div className="ml-2">
          <Button
            variant="ghost"
            size="xs"
            className="text-xs flex items-center text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Ask Lumen AI</span>
          </Button>
        </div>
      </div>
    </div>
  );
}