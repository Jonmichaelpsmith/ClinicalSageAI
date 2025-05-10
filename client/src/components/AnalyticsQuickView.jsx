import React from 'react';
import { BarChart2, LineChart, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// AnalyticsQuickView component for providing a quick overview of analytics
const AnalyticsQuickView = ({ orgId, clientId }) => {
  // Mock data for demonstration - in a real app this would come from an API
  const analyticsData = {
    enrollment: {
      current: 65,
      target: 100,
      change: '+12%',
      period: 'Last 30 days'
    },
    aes: {
      current: 8,
      previous: 12,
      change: '-33%',
      period: 'vs. previous period'
    },
    completedTrials: {
      current: 3,
      total: 7,
      change: '+1',
      period: 'This quarter'
    },
    documentThroughput: {
      current: 24,
      previous: 18,
      change: '+33%',
      period: 'vs. previous month'
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
            Analytics Snapshot
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8">
            Full Analytics
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 grid grid-cols-2 gap-4">
        {/* Enrollment KPI */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Patient Enrollment</h4>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{analyticsData.enrollment.current}</span>
            <span className="text-xs text-gray-500 ml-1">/ {analyticsData.enrollment.target}</span>
          </div>
          <Progress 
            value={(analyticsData.enrollment.current / analyticsData.enrollment.target) * 100} 
            className="h-2 mt-2" 
          />
          <div className="mt-1 flex items-center text-xs">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{analyticsData.enrollment.change}</span>
            <span className="text-gray-500 ml-1">{analyticsData.enrollment.period}</span>
          </div>
        </div>
        
        {/* Adverse Events KPI */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Adverse Events</h4>
            <LineChart className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{analyticsData.aes.current}</span>
            <span className="text-xs text-gray-500 ml-1">reported</span>
          </div>
          <div className="h-2 mt-2 bg-gray-100 rounded-full" />
          <div className="mt-1 flex items-center text-xs">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{analyticsData.aes.change}</span>
            <span className="text-gray-500 ml-1">{analyticsData.aes.period}</span>
          </div>
        </div>
        
        {/* Completed Trials KPI */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Completed Trials</h4>
            <PieChart className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{analyticsData.completedTrials.current}</span>
            <span className="text-xs text-gray-500 ml-1">/ {analyticsData.completedTrials.total}</span>
          </div>
          <Progress 
            value={(analyticsData.completedTrials.current / analyticsData.completedTrials.total) * 100} 
            className="h-2 mt-2" 
          />
          <div className="mt-1 flex items-center text-xs">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{analyticsData.completedTrials.change}</span>
            <span className="text-gray-500 ml-1">{analyticsData.completedTrials.period}</span>
          </div>
        </div>
        
        {/* Document Throughput KPI */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Document Throughput</h4>
            <BarChart2 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{analyticsData.documentThroughput.current}</span>
            <span className="text-xs text-gray-500 ml-1">documents</span>
          </div>
          <div className="h-2 mt-2 bg-gray-100 rounded-full" />
          <div className="mt-1 flex items-center text-xs">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{analyticsData.documentThroughput.change}</span>
            <span className="text-gray-500 ml-1">{analyticsData.documentThroughput.period}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <Button variant="outline" size="sm" className="w-full">
          Create Custom Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalyticsQuickView;