import React, { useState, useEffect } from 'react';
import { Clipboard, ClipboardCheck, Calendar, User, Clock, AlertCircle, Activity, ChevronRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * ClinicalStudyTracker Component
 * 
 * Provides a real-time tracking interface for clinical studies with timeline visualization,
 * milestone tracking, and status updates. This component integrates with the Study Architect module.
 */
const ClinicalStudyTracker = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  // Mock studies data - would come from API in a real implementation
  const studiesData = {
    active: [
      {
        id: 'study-001',
        title: 'Enzymax Forte Efficacy Trial',
        phase: 'Phase II',
        status: 'enrolling',
        progress: 38,
        startDate: '2025-01-15',
        targetCompletionDate: '2025-12-30',
        enrolledParticipants: 42,
        targetParticipants: 120,
        sites: 8,
        lastUpdated: '2025-05-09T08:30:00Z',
        hasCriticalIssues: false,
        principalInvestigator: 'Dr. Helena Moreau'
      },
      {
        id: 'study-002',
        title: 'Cardiozen Comparative Analysis',
        phase: 'Phase III',
        status: 'active',
        progress: 65,
        startDate: '2024-09-10',
        targetCompletionDate: '2025-08-15',
        enrolledParticipants: 208,
        targetParticipants: 350,
        sites: 12,
        lastUpdated: '2025-05-10T14:15:00Z',
        hasCriticalIssues: true,
        principalInvestigator: 'Dr. Robert Chen'
      }
    ],
    planned: [
      {
        id: 'study-003',
        title: 'Neuroclear Safety Assessment',
        phase: 'Phase I',
        status: 'planning',
        progress: 0,
        plannedStartDate: '2025-07-01',
        targetParticipants: 80,
        plannedSites: 5,
        lastUpdated: '2025-05-07T11:20:00Z',
        readiness: 68,
        principalInvestigator: 'Dr. Sarah Williams'
      }
    ],
    completed: [
      {
        id: 'study-004',
        title: 'Pulmofix Pilot Study',
        phase: 'Phase I',
        status: 'completed',
        progress: 100,
        startDate: '2024-05-20',
        completionDate: '2024-11-15',
        enrolledParticipants: 45,
        targetParticipants: 45,
        sites: 3,
        lastUpdated: '2024-11-18T09:45:00Z',
        principalInvestigator: 'Dr. James Rodriguez'
      }
    ]
  };

  // Simulate refreshing data
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate days remaining for a study
  const getDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine status badge color and text
  const getStatusDetails = (status) => {
    switch (status) {
      case 'enrolling':
        return { color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', text: 'Enrolling' };
      case 'active':
        return { color: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Active' };
      case 'onhold':
        return { color: 'bg-amber-100 text-amber-800 hover:bg-amber-200', text: 'On Hold' };
      case 'completed':
        return { color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', text: 'Completed' };
      case 'planning':
        return { color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200', text: 'Planning' };
      default:
        return { color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', text: status };
    }
  };

  return (
    <Card className="border-teal-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clipboard className="h-5 w-5 mr-2 text-teal-600" />
            <CardTitle className="text-lg font-medium">Clinical Study Tracker</CardTitle>
          </div>
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">Study Architect™</Badge>
        </div>
        <CardDescription className="text-gray-600">
          Track enrollment, milestones and site performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabs for study status */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-teal-50 p-1">
                <TabsTrigger value="active" className="px-3 py-1.5 data-[state=active]:bg-white">
                  Active ({studiesData.active.length})
                </TabsTrigger>
                <TabsTrigger value="planned" className="px-3 py-1.5 data-[state=active]:bg-white">
                  Planned ({studiesData.planned.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="px-3 py-1.5 data-[state=active]:bg-white">
                  Completed ({studiesData.completed.length})
                </TabsTrigger>
              </TabsList>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-1 text-teal-700 border-teal-200 hover:bg-teal-50"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-xs">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>

            {/* Active Studies */}
            <TabsContent value="active" className="mt-0">
              <div className="space-y-3">
                {studiesData.active.map(study => (
                  <div 
                    key={study.id} 
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:border-teal-300 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{study.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal py-0 px-2 h-5 border-gray-200">
                            {study.phase}
                          </Badge>
                          <Badge className={`text-xs font-normal py-0 px-2 h-5 ${getStatusDetails(study.status).color}`}>
                            {getStatusDetails(study.status).text}
                          </Badge>
                          {study.hasCriticalIssues && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-xs font-normal py-0 px-2 h-5">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Issues
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-right text-gray-500">
                        <div className="flex items-center justify-end">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Updated {new Date(study.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress visualization */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{study.progress}%</span>
                      </div>
                      <Progress value={study.progress} className="h-2 bg-gray-100" indicatorClassName="bg-teal-500" />
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Started: </span>
                        <span className="font-medium">{formatDate(study.startDate)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Target completion: </span>
                        <span className="font-medium">{formatDate(study.targetCompletionDate)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Enrollment: </span>
                        <span className="font-medium">
                          {study.enrolledParticipants}/{study.targetParticipants} participants
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Sites: </span>
                        <span className="font-medium">{study.sites} active</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded flex items-center mb-2">
                      <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      <span>PI: {study.principalInvestigator}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-teal-600" />
                        <span className="text-xs font-medium">
                          {getDaysRemaining(study.targetCompletionDate)} days remaining
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 px-2 py-1">
                        View Details <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Planned Studies */}
            <TabsContent value="planned" className="mt-0">
              <div className="space-y-3">
                {studiesData.planned.map(study => (
                  <div 
                    key={study.id} 
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:border-teal-300 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{study.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal py-0 px-2 h-5 border-gray-200">
                            {study.phase}
                          </Badge>
                          <Badge className={`text-xs font-normal py-0 px-2 h-5 ${getStatusDetails(study.status).color}`}>
                            {getStatusDetails(study.status).text}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-right text-gray-500">
                        <div className="flex items-center justify-end">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Updated {new Date(study.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Readiness visualization */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Readiness</span>
                        <span>{study.readiness}%</span>
                      </div>
                      <Progress value={study.readiness} className="h-2 bg-gray-100" indicatorClassName="bg-indigo-500" />
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Planned start: </span>
                        <span className="font-medium">{formatDate(study.plannedStartDate)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Target participants: </span>
                        <span className="font-medium">{study.targetParticipants}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Planned sites: </span>
                        <span className="font-medium">{study.plannedSites}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">PI: </span>
                        <span className="font-medium">{study.principalInvestigator}</span>
                      </div>
                    </div>

                    <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1">
                        View Study Plan <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Completed Studies */}
            <TabsContent value="completed" className="mt-0">
              <div className="space-y-3">
                {studiesData.completed.map(study => (
                  <div 
                    key={study.id} 
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:border-teal-300 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{study.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal py-0 px-2 h-5 border-gray-200">
                            {study.phase}
                          </Badge>
                          <Badge className={`text-xs font-normal py-0 px-2 h-5 ${getStatusDetails(study.status).color}`}>
                            {getStatusDetails(study.status).text}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Start date: </span>
                        <span className="font-medium">{formatDate(study.startDate)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Completion date: </span>
                        <span className="font-medium">{formatDate(study.completionDate)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Enrollment: </span>
                        <span className="font-medium">
                          {study.enrolledParticipants}/{study.targetParticipants} participants
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Sites: </span>
                        <span className="font-medium">{study.sites}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded flex items-center mb-2">
                      <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      <span>PI: {study.principalInvestigator}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                      <Badge className="bg-green-100 text-green-800 px-2 py-0.5 flex items-center text-xs">
                        <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Study Completed
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50 px-2 py-1">
                        View Results <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full mt-2 border-teal-200 text-teal-700 hover:bg-teal-50" 
          size="sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Open Study Architect Module
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicalStudyTracker;