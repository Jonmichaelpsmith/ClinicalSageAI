import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Upload, Search, FilePlus, Shield, File, Folder, FolderOpen,
  FileCheck, CheckCircle2, AlertTriangle, CheckCircle, ChevronRight,
  FileText, Plus, Database, AlertCircle, Settings, Users, Cog,
  Calendar, Mail, Clock, ChevronDown, Trash2, Star, PenTool, 
  FolderPlus, FilePlus2, Inbox, SendHorizontal, Archive, Book, ClipboardList,
  Bookmark, BookOpen, CheckSquare, Download, PlusCircle, Filter, Layers,
  Paperclip, Share2, HelpCircle, Menu, LogOut, Info, Grid, LayoutDashboard,
  Circle, ArrowRight, Edit, Play
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function KAutomationPanel() {
  const [selectedModule, setSelectedModule] = useState('510k');
  const [workflowSubTab, setWorkflowSubTab] = useState('device-profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [currentDeviceProfile, setCurrentDeviceProfile] = useState(null);
  const [showDeviceProfileDialog, setShowDeviceProfileDialog] = useState(false);
  const [showDeviceSetupDialog, setShowDeviceSetupDialog] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    devices: true,
    templates: false,
    reports: false,
    submissions: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fetch device profiles
    const mockProfiles = [
      { id: '1', deviceName: 'Cardiac Monitor', deviceClass: 'Class II', manufacturer: 'MedTech Industries', deviceType: 'Monitoring Device' },
      { id: '2', deviceName: 'Glucose Monitor', deviceClass: 'Class II', manufacturer: 'DiaTech', deviceType: 'Diagnostic Device' }
    ];
    
    setDeviceProfiles(mockProfiles);
  }, []);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleSelectDeviceProfile = (profile) => {
    setCurrentDeviceProfile(profile);
    
    // Auto-navigate to device profile tab
    setWorkflowSubTab('device-profile');
    
    toast({
      title: "Device Profile Selected",
      description: `You've selected the ${profile.deviceName} profile.`,
      duration: 3000
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden border rounded-lg bg-white shadow-md w-full max-w-none mx-0">
      <div className={`bg-[#f3f2f1] border-r flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-16 md:w-60'} transition-all duration-300`}>
        {/* Top app navigation */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            {!sidebarCollapsed && <span className="font-semibold text-gray-800 ml-2">TrialSage</span>}
            {sidebarCollapsed && <LayoutDashboard className="h-5 w-5 text-blue-700" />}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Main app navigation */}
        <div className="flex flex-col py-2">
          <Button
            variant={selectedModule === '510k' ? "subtle" : "ghost"}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1 ${selectedModule === '510k' ? 'bg-blue-100 text-blue-800' : ''}`}
            onClick={() => setSelectedModule('510k')}
          >
            <FileCheck className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">510(k) Workflow</span>}
          </Button>
          
          <Button
            variant={selectedModule === 'cer' ? "subtle" : "ghost"}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1 ${selectedModule === 'cer' ? 'bg-blue-100 text-blue-800' : ''}`}
            onClick={() => setSelectedModule('cer')}
          >
            <ClipboardList className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">CER Generator</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1`}
          >
            <BookOpen className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Knowledge Base</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1`}
          >
            <Archive className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Archives</span>}
          </Button>
        </div>
        
        {/* Bottom options */}
        <div className="mt-auto border-t border-gray-200 pt-2 pb-4">
          <Button
            variant="ghost"
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1 w-full`}
            size="sm"
          >
            <Cog className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Settings</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} mb-1 w-full`}
            size="sm"
          >
            <HelpCircle className="h-5 w-5 min-w-5" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Help</span>}
          </Button>
        </div>
      </div>
      
      {/* File tree sidebar - Similar to Microsoft 365 Outlook folders */}
      <div className={`${selectedModule === '510k' ? 'block' : 'hidden'} w-60 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
            510(k) Workflow
          </h2>
        </div>
        
        <div className="p-2">
          <Input
            type="search"
            placeholder="Search files..."
            className="mb-2 bg-gray-50"
          />
        </div>
        
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2">
            {/* Devices folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('devices')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.devices ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Device Profiles</span>
                <Badge className="ml-auto text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {deviceProfiles?.length || 0}
                </Badge>
              </button>
              
              {expandedFolders.devices && deviceProfiles && (
                <div className="ml-7 mt-1">
                  {deviceProfiles.map(profile => (
                    <button
                      key={profile.id}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center mb-1 ${
                        currentDeviceProfile?.id === profile.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectDeviceProfile(profile)}
                    >
                      <File className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="truncate">{profile.deviceName}</span>
                    </button>
                  ))}
                  
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center text-blue-600"
                    onClick={() => {
                      // Open the device profile dialog
                      document.getElementById('create-profile-button')?.click();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add New Profile</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Templates folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('templates')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.templates ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Templates</span>
              </button>
              
              {expandedFolders.templates && (
                <div className="ml-7 mt-1">
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">510(k) Template</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">eSTAR Template</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Predicate Comparison</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Reports folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('reports')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.reports ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Reports</span>
              </button>
              
              {expandedFolders.reports && (
                <div className="ml-7 mt-1">
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Compliance Report</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Validation Report</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Submissions folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('submissions')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.submissions ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Submissions</span>
              </button>
              
              {expandedFolders.submissions && (
                <div className="ml-7 mt-1">
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Draft Submissions</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Completed Submissions</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* CER file tree sidebar - Only visible when CER is selected */}
      <div className={`${selectedModule === 'cer' ? 'block' : 'hidden'} w-60 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
            CER Generator
          </h2>
        </div>
        
        <div className="p-2">
          <Input
            type="search"
            placeholder="Search files..."
            className="mb-2 bg-gray-50"
          />
        </div>
        
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2">
            {/* CER Documents folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('devices')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.devices ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Clinical Documents</span>
              </button>
              
              {expandedFolders.devices && (
                <div className="ml-7 mt-1">
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Clinical Documentation</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Literature Search</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">Risk Analysis</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* CER Templates folder */}
            <div className="mb-1">
              <button 
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center"
                onClick={() => toggleFolder('templates')}
              >
                <ChevronRight className={`h-4 w-4 mr-1 transition-transform ${expandedFolders.templates ? 'rotate-90' : ''}`} />
                <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">CER Templates</span>
              </button>
              
              {expandedFolders.templates && (
                <div className="ml-7 mt-1">
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">MDR Template</span>
                  </button>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm flex items-center mb-1"
                  >
                    <File className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">MEDDEV Template</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-[#f5f5f5]">
        {/* Top header bar */}
        <div className="bg-white border-b flex items-center justify-between p-3">
          <div className="flex items-center">
            <h1 className="font-semibold text-xl text-gray-800 mr-8">
              {selectedModule === '510k' ? '510(k) Submission Workflow' : 'CER Generator'}
            </h1>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">New</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-sm">Export</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4 mr-1" />
                <span className="text-sm">Save</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-blue-600 text-white">TR</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Main workflow panel */}
        <div className="flex-1 overflow-auto p-4">
          {selectedModule === '510k' && workflowSubTab === 'device-profile' && (
            <div className="grid gap-4">
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Device Profile</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Step 1 of 4</Badge>
                </div>
                
                <div className="space-y-4">
                  {/* Device profile creation or selection UI */}
                  {!currentDeviceProfile ? (
                    <div className="border rounded-lg p-6 bg-blue-50 border-blue-100 text-center">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Device Profile Selected</h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        Create or select a device profile to begin the 510(k) submission process. 
                        This will be the basis for your regulatory submission.
                      </p>
                      <Button 
                        id="create-profile-button" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowDeviceProfileDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Device Profile
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                            <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                            Device Information
                          </h3>
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <dt className="text-gray-500">Device Name:</dt>
                            <dd className="font-medium">{currentDeviceProfile.deviceName}</dd>
                            
                            <dt className="text-gray-500">Device Class:</dt>
                            <dd className="font-medium">{currentDeviceProfile.deviceClass || 'Class II'}</dd>
                            
                            <dt className="text-gray-500">Manufacturer:</dt>
                            <dd className="font-medium">{currentDeviceProfile.manufacturer}</dd>
                            
                            <dt className="text-gray-500">Device Type:</dt>
                            <dd className="font-medium">{currentDeviceProfile.deviceType || 'Medical Device'}</dd>
                          </dl>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                            <ClipboardList className="h-4 w-4 mr-2 text-blue-600" />
                            Submission Information
                          </h3>
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <dt className="text-gray-500">Submission Type:</dt>
                            <dd className="font-medium">Traditional 510(k)</dd>
                            
                            <dt className="text-gray-500">eCopy ID:</dt>
                            <dd className="font-medium">{`K${Math.floor(Math.random() * 900000) + 100000}`}</dd>
                            
                            <dt className="text-gray-500">Status:</dt>
                            <dd>
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                In Progress
                              </Badge>
                            </dd>
                            
                            <dt className="text-gray-500">Created:</dt>
                            <dd className="font-medium">May 15, 2025</dd>
                          </dl>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setWorkflowSubTab('device-setup');
                            setShowDeviceSetupDialog(true);
                          }}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue to Device Setup
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Device Setup Dialog */}
      <Dialog open={showDeviceSetupDialog} onOpenChange={setShowDeviceSetupDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Device Configuration</DialogTitle>
            <DialogDescription>
              Configure system parameters for your device submission workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Validation Mode
              </Label>
              <Select defaultValue="standard">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                eSTAR Template
              </Label>
              <Select defaultValue="standard">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Template</SelectItem>
                  <SelectItem value="abbreviated">Abbreviated 510(k)</SelectItem>
                  <SelectItem value="special">Special 510(k)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                AI Assistance
              </Label>
              <div className="flex items-center space-x-4 col-span-3">
                <Switch id="aiassist" />
                <Label htmlFor="aiassist">Enable AI-powered features</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Auto-Validation
              </Label>
              <div className="flex items-center space-x-4 col-span-3">
                <Switch id="autovalidate" />
                <Label htmlFor="autovalidate">Enable automatic validation checks</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceSetupDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Configuration Saved",
                  description: "Your device setup has been configured successfully"
                });
                
                setShowDeviceSetupDialog(false);
                
                // Move to compliance tab
                setWorkflowSubTab('compliance');
              }}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}