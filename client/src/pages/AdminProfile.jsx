import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Shield, 
  Users, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Database, 
  BarChart3, 
  Microscope,
  LogOut,
  User,
  Building2,
  FileCheck,
  Sparkles,
  ChevronDown,
  Home,
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminProfile() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('admin');
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'client', 'regulator'

  const handleRoleSwitch = (role) => {
    setUserRole(role);
  };
  
  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      {/* Top Navigation Bar - Apple inspired */}
      <header className="bg-white border-b border-[#e5e5e7] sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded p-1.5 mr-2">
                    <div className="text-white font-bold text-xs tracking-wide">C2C.AI</div>
                  </div>
                  <span className="text-lg font-semibold text-[#1d1d1f] tracking-tight">CONCEPT2CURE.AI</span>
                </div>
                <span className="ml-7 text-sm text-[#86868b] mt-0.5">TrialSage™ Platform</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative" size="icon">
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto space-y-2 p-2">
                  <div className="flex items-start space-x-3 p-2 bg-slate-50 rounded-md">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">IND Submission Update</div>
                      <div className="text-xs text-slate-500">FDA has acknowledged receipt of your IND submission</div>
                      <div className="text-xs text-slate-400 mt-1">10 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-2 bg-slate-50 rounded-md">
                    <div className="bg-yellow-100 rounded-full p-2 text-yellow-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Team Collaboration</div>
                      <div className="text-xs text-slate-500">Dr. Sarah Johnson shared a document with you</div>
                      <div className="text-xs text-slate-400 mt-1">1 hour ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-2 bg-slate-50 rounded-md">
                    <div className="bg-green-100 rounded-full p-2 text-green-600">
                      <Microscope className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Regulatory Alert</div>
                      <div className="text-xs text-slate-500">New FDA guidance published for your therapeutic area</div>
                      <div className="text-xs text-slate-400 mt-1">Yesterday</div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="outline" size="sm" className="w-full">View All Notifications</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/assets/avatars/admin-avatar.jpg" alt="Admin" />
                    <AvatarFallback className="bg-[#0071e3] text-white">SA</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Sam Adams</span>
                    <div className="flex items-center">
                      <Badge variant="outline" className="h-5 px-1 text-xs bg-[#0071e3] text-white border-0">
                        {userRole === 'admin' && 'Admin'}
                        {userRole === 'client' && 'Client View'}
                        {userRole === 'regulator' && 'Regulator View'}
                      </Badge>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => setLocation('/settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleRoleSwitch('admin')}>
                  <Shield className="h-4 w-4" />
                  <span>Administrator</span>
                  {userRole === 'admin' && <Badge className="ml-auto h-5 px-1 text-xs">Active</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleRoleSwitch('client')}>
                  <Building2 className="h-4 w-4" />
                  <span>Client View</span>
                  {userRole === 'client' && <Badge className="ml-auto h-5 px-1 text-xs">Active</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleRoleSwitch('regulator')}>
                  <FileText className="h-4 w-4" />
                  <span>Regulator View</span>
                  {userRole === 'regulator' && <Badge className="ml-auto h-5 px-1 text-xs">Active</Badge>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={() => setLocation('/auth')}>
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar with profile info and navigation */}
          <div className="md:w-1/4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src="/assets/avatars/admin-avatar.jpg" alt="Admin" />
                    <AvatarFallback className="bg-[#0071e3] text-white text-xl">SA</AvatarFallback>
                  </Avatar>
                  <CardTitle>Sam Adams</CardTitle>
                  <CardDescription>Administrator</CardDescription>
                  <Badge variant="outline" className="mt-2 bg-[#0071e3] text-white border-0">
                    {userRole === 'admin' && 'Admin Mode'}
                    {userRole === 'client' && 'Client Mode'}
                    {userRole === 'regulator' && 'Regulator Mode'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-6">
                  <div className="text-sm text-slate-500">sam.adams@concept2cure.ai</div>
                  <div className="text-sm text-slate-500">VP, Regulatory Operations</div>
                  <div className="text-sm text-slate-500">Concept2Cure.AI</div>
                </div>
                
                <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="admin" className="flex-1">Admin</TabsTrigger>
                    <TabsTrigger value="client" className="flex-1">Client</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
              
              <div className="px-6 py-2">
                {activeTab === 'admin' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-slate-500">Admin Navigation</h3>
                      <ul className="space-y-1">
                        <li>
                          <Link href="/admin">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Shield className="h-4 w-4 text-[#0071e3]" />
                              <span>Admin Dashboard</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/users">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Users className="h-4 w-4 text-[#0071e3]" />
                              <span>User Management</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/analytics">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <BarChart3 className="h-4 w-4 text-[#0071e3]" />
                              <span>Analytics</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/database">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Database className="h-4 w-4 text-[#0071e3]" />
                              <span>Database Management</span>
                            </a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-slate-500">System Settings</h3>
                      <ul className="space-y-1">
                        <li>
                          <Link href="/admin/settings/system">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Settings className="h-4 w-4 text-[#0071e3]" />
                              <span>System Settings</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/settings/api">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Database className="h-4 w-4 text-[#0071e3]" />
                              <span>API Configuration</span>
                            </a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'client' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-slate-500">Client Navigation</h3>
                      <ul className="space-y-1">
                        <li>
                          <Link href="/">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Home className="h-4 w-4 text-[#0071e3]" />
                              <span>Home Dashboard</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/ind/wizard">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <FileCheck className="h-4 w-4 text-[#0071e3]" />
                              <span>IND Wizard</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/enterprise-csr-intelligence">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <LayoutDashboard className="h-4 w-4 text-[#0071e3]" />
                              <span>CSR Intelligence</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/versions">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Database className="h-4 w-4 text-[#0071e3]" />
                              <span>Document Vault</span>
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/ask-lumen">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <Sparkles className="h-4 w-4 text-[#0071e3]" />
                              <span>Ask Lumen</span>
                            </a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-slate-500">User Settings</h3>
                      <ul className="space-y-1">
                        <li>
                          <Link href="/settings">
                            <a className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 text-sm font-medium">
                              <User className="h-4 w-4 text-[#0071e3]" />
                              <span>Profile Settings</span>
                            </a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <CardFooter className="flex justify-center pt-2 pb-6">
                <Button variant="outline" size="sm" onClick={() => setLocation('/auth')}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="md:w-3/4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Admin Profile</CardTitle>
                    <CardDescription>
                      Manage your profile and system preferences
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">System Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Database Connection</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                Connected
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">OpenAI API</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                Connected
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Document Storage</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                Online
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Analytics Pipeline</span>
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0">
                                Processing
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="justify-start">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Add User</span>
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start">
                              <Database className="h-4 w-4 mr-2" />
                              <span>Backup DB</span>
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>System Log</span>
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start">
                              <Settings className="h-4 w-4 mr-2" />
                              <span>Config</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">User Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 p-4 rounded-md">
                            <div className="text-sm text-slate-500">Total Users</div>
                            <div className="text-2xl font-semibold">156</div>
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>+12% this month</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-md">
                            <div className="text-sm text-slate-500">Active Projects</div>
                            <div className="text-2xl font-semibold">24</div>
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>+3 this week</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-md">
                            <div className="text-sm text-slate-500">INDs Generated</div>
                            <div className="text-2xl font-semibold">43</div>
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>+5 this month</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-md">
                            <div className="text-sm text-slate-500">API Requests</div>
                            <div className="text-2xl font-semibold">8.2k</div>
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>+18% this week</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="activity">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity Log</CardTitle>
                        <CardDescription>System events and user actions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">New user registered</div>
                              <div className="text-xs text-slate-500">Dr. Michael Chen (michael.chen@pharma.com)</div>
                              <div className="text-xs text-slate-400 mt-1">Today, 9:32 AM</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <FileCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">IND Submission Completed</div>
                              <div className="text-xs text-slate-500">Project CARD-01: Cardiomyopathy Gene Therapy</div>
                              <div className="text-xs text-slate-400 mt-1">Yesterday, 4:15 PM</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <Settings className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">System Update Completed</div>
                              <div className="text-xs text-slate-500">TrialSage Platform v2.4.1 deployed</div>
                              <div className="text-xs text-slate-400 mt-1">Yesterday, 2:00 AM</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-2 rounded-full">
                              <Database className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Database Backup Completed</div>
                              <div className="text-xs text-slate-500">Automated weekly backup (size: 4.2GB)</div>
                              <div className="text-xs text-slate-400 mt-1">Apr 22, 2025, 1:00 AM</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 p-2 rounded-full">
                              <Shield className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Security Alert</div>
                              <div className="text-xs text-slate-500">Failed login attempts detected (IP: 203.0.113.45)</div>
                              <div className="text-xs text-slate-400 mt-1">Apr 21, 2025, 8:14 PM</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          View All Activity
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="permissions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Roles and Permissions</CardTitle>
                        <CardDescription>Manage access controls for user roles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Admin Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">Full System Access</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">User Management</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">Database Management</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Settings className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">System Configuration</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Client View Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <FileCheck className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">IND Wizard Access</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">CSR Intelligence</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">Document Vault</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm">Ask Lumen</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                  Enabled
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage account security and authentication</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md mb-4">
                              <div>
                                <div className="font-medium">Two-Factor Authentication</div>
                                <div className="text-sm text-slate-500">Add an extra layer of security to your account</div>
                              </div>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                Enabled
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">Manage 2FA Settings</Button>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200">
                            <h3 className="text-lg font-medium mb-4">Password</h3>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500">Last password change</div>
                                <div className="text-sm font-medium">30 days ago</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500">Password strength</div>
                                <div className="text-sm font-medium text-green-600">Strong</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Change Password</Button>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200">
                            <h3 className="text-lg font-medium mb-4">API Keys</h3>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div>
                                  <div className="font-medium text-sm">Production API Key</div>
                                  <div className="text-xs text-slate-500">Created on Apr 1, 2025</div>
                                </div>
                                <Button variant="ghost" size="sm">Manage</Button>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div>
                                  <div className="font-medium text-sm">Development API Key</div>
                                  <div className="text-xs text-slate-500">Created on Mar 15, 2025</div>
                                </div>
                                <Button variant="ghost" size="sm">Manage</Button>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Generate New API Key</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}