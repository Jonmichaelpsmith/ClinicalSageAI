/**
 * Templates Dashboard Component for eCTD Module
 * 
 * This component provides a dashboard view of template usage statistics,
 * recently updated templates, and template analytics.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  FileText, 
  Calendar, 
  Clock, 
  Edit,
  CheckCircle2,
  PieChart, 
  LayoutTemplate,
  ArrowUpRight
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export default function TemplatesDashboard({ onViewTemplates }) {
  const [templateStats, setTemplateStats] = useState(null);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();
  
  useEffect(() => {
    if (!currentClientWorkspace?.id) return;
    
    async function fetchTemplateStats() {
      try {
        setLoading(true);
        
        // In a real implementation, call an API
        // For demo purposes, use mock data
        setTimeout(() => {
          setTemplateStats({
            totalTemplates: 18,
            templatesByModule: {
              m1: 4,
              m2: 5,
              m3: 6,
              m4: 2,
              m5: 1
            },
            usageCount: 42,
            lastModified: '2025-05-15T10:30:00Z',
            complianceScore: 87,
            pendingReviews: 3
          });
          
          setRecentTemplates([
            { 
              id: 't1', 
              name: 'Module 1 Cover Letter', 
              category: 'm1',
              lastModified: '2025-05-15T10:30:00Z',
              author: 'John Smith'
            },
            { 
              id: 't2', 
              name: 'Quality Overall Summary', 
              category: 'm2',
              lastModified: '2025-05-12T14:22:00Z',
              author: 'Maria Johnson'
            },
            { 
              id: 't3', 
              name: 'Drug Substance Specifications', 
              category: 'm3',
              lastModified: '2025-05-10T09:15:00Z',
              author: 'Robert Chen'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching template statistics:', error);
        toast({
          title: "Failed to load template statistics",
          description: "Please try again later",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    fetchTemplateStats();
  }, [currentClientWorkspace?.id, toast]);
  
  // Helper function to get color for module
  const getModuleColor = (module) => {
    switch(module) {
      case 'm1': return 'bg-blue-500';
      case 'm2': return 'bg-green-500';
      case 'm3': return 'bg-orange-500';
      case 'm4': return 'bg-purple-500';
      case 'm5': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Helper function to get badge color variant based on module
  const getModuleBadgeVariant = (category) => {
    switch(category) {
      case 'm1': return 'blue';
      case 'm2': return 'green';
      case 'm3': return 'orange';
      case 'm4': return 'purple';
      case 'm5': return 'red';
      default: return 'default';
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Helper function to get module name
  const getModuleName = (moduleCode) => {
    switch(moduleCode) {
      case 'm1': return 'Module 1';
      case 'm2': return 'Module 2';
      case 'm3': return 'Module 3';
      case 'm4': return 'Module 4';
      case 'm5': return 'Module 5';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <Card className="w-full h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading template statistics...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Templates</p>
                    <h3 className="text-2xl font-bold mt-1">{templateStats?.totalTemplates || 0}</h3>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-md">
                    <LayoutTemplate className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Last updated: {formatDate(templateStats?.lastModified || new Date())}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Template Usage</p>
                    <h3 className="text-2xl font-bold mt-1">{templateStats?.usageCount || 0}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">Past 30 days</span>
                    <span className="font-medium">+18%</span>
                  </div>
                  <Progress value={72} className="h-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compliance Score</p>
                    <h3 className="text-2xl font-bold mt-1">{templateStats?.complianceScore || 0}%</h3>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-md">
                    <BarChart className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">Regulatory Standards</span>
                    <span className="font-medium text-orange-600">Review Needed</span>
                  </div>
                  <Progress value={templateStats?.complianceScore || 0} className="h-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                    <h3 className="text-2xl font-bold mt-1">{templateStats?.pendingReviews || 0}</h3>
                  </div>
                  <div className="bg-red-100 p-2 rounded-md">
                    <Edit className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Due in 5 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Templates Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Templates by Module</CardTitle>
                <CardDescription>Distribution of templates across eCTD modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templateStats && Object.entries(templateStats.templatesByModule).map(([module, count]) => (
                    <div key={module}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Badge variant={getModuleBadgeVariant(module)} className="mr-2">
                            {module.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{getModuleName(module)}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                          <div
                            className={`${getModuleColor(module)} h-full rounded`}
                            style={{ width: `${(count / templateStats.totalTemplates) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewTemplates && onViewTemplates()}
                  className="w-full"
                >
                  View All Templates
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recently Updated</CardTitle>
                <CardDescription>Latest template modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTemplates.map(template => (
                    <div key={template.id} className="flex items-start">
                      <div className={`p-2 rounded ${getModuleColor(template.category)} bg-opacity-20 mr-3`}>
                        <FileText className={`h-4 w-4 ${getModuleColor(template.category).replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <Badge variant={getModuleBadgeVariant(template.category)}>
                            {template.category.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            Updated by {template.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(template.lastModified)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewTemplates && onViewTemplates()}
                  className="w-full"
                >
                  View Recent Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Template Actions</CardTitle>
              <CardDescription>Quick access to template management features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewTemplates && onViewTemplates('create')}
                >
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-md mr-3">
                      <LayoutTemplate className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create New Template</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a new reusable document template
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewTemplates && onViewTemplates('import')}
                >
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Import from Submissions</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Convert existing documents to templates
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewTemplates && onViewTemplates('analyze')}
                >
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-md mr-3">
                      <PieChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Analyze Quality</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Check templates against regulatory standards
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}