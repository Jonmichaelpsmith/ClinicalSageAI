import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Info, Maximize2, Clock } from 'lucide-react';

export default function TimelineSimulator() {
  const [expanded, setExpanded] = useState(false);
  
  // These would come from an API in a real implementation
  const timelineData = {
    startDate: '2025-06-15',
    endDate: '2026-01-30',
    currentDate: '2025-10-01',
    milestones: [
      { id: 'm1', name: 'Initial Draft', date: '2025-06-30', completed: true },
      { id: 'm2', name: 'Quality Review', date: '2025-07-30', completed: true },
      { id: 'm3', name: 'SME Review', date: '2025-08-30', completed: true },
      { id: 'm4', name: 'Executive Approval', date: '2025-10-15', completed: false },
      { id: 'm5', name: 'Regulatory Submission', date: '2025-11-30', completed: false },
      { id: 'm6', name: 'Response to Questions', date: '2025-12-31', completed: false },
      { id: 'm7', name: 'Final Approval', date: '2026-01-15', completed: false }
    ]
  };
  
  // Format date string for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate timeline progress percentage
  const calculateProgress = () => {
    const start = new Date(timelineData.startDate).getTime();
    const end = new Date(timelineData.endDate).getTime();
    const current = new Date(timelineData.currentDate).getTime();
    
    const totalDuration = end - start;
    const elapsed = current - start;
    
    return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
  };
  
  const progressPercent = calculateProgress();
  
  // Current active milestone
  const activeMilestone = timelineData.milestones.find(m => !m.completed) || timelineData.milestones[timelineData.milestones.length - 1];
  
  // Days remaining calculation
  const daysRemaining = () => {
    const end = new Date(timelineData.endDate);
    const current = new Date(timelineData.currentDate);
    const diffTime = Math.abs(end - current);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Submission Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Collapse' : 'Expand'} <ChevronDown className={`h-4 w-4 ml-1 transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" title="Maximize view">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Timeline Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Project Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Key Timeline Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-md border">
            <div className="text-xs text-gray-500">Start Date</div>
            <div className="font-medium">{formatDate(timelineData.startDate)}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="text-xs text-blue-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Current Milestone
            </div>
            <div className="font-medium">{activeMilestone.name}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md border">
            <div className="text-xs text-gray-500">End Date</div>
            <div className="font-medium">{formatDate(timelineData.endDate)}</div>
          </div>
        </div>
        
        {/* Timeline Gantt Chart (simplified) */}
        {expanded && (
          <div className="mt-5">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Timeline Details</h4>
              <div className="text-sm text-gray-600 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {daysRemaining()} days remaining
              </div>
            </div>
            
            <div className="space-y-3 mt-3">
              {timelineData.milestones.map((milestone, index) => {
                const isActive = !milestone.completed && !timelineData.milestones.slice(0, index).some(m => !m.completed);
                
                return (
                  <div 
                    key={milestone.id}
                    className={`
                      p-3 rounded-md border flex items-center justify-between
                      ${milestone.completed ? 'bg-green-50 border-green-100' : 
                        isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`
                          w-5 h-5 rounded-full mr-3 flex items-center justify-center
                          ${milestone.completed ? 'bg-green-500' : 
                            isActive ? 'bg-blue-500' : 'bg-gray-300'}
                        `}
                      >
                        {milestone.completed ? 
                          <Check className="h-3 w-3 text-white" /> : 
                          <span className="text-xs text-white">{index + 1}</span>
                        }
                      </div>
                      <div>
                        <div className="font-medium text-sm">{milestone.name}</div>
                        <div className="text-xs text-gray-500">{formatDate(milestone.date)}</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`
                        text-xs px-2 py-1 rounded-full
                        ${milestone.completed ? 'bg-green-100 text-green-800' : 
                          isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      `}
                    >
                      {milestone.completed ? 'Completed' : isActive ? 'Active' : 'Pending'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Check component to render inside timeline
function Check({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}