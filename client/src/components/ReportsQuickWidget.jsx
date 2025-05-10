import React from 'react';
import { BarChart2, FileText, Download, ArrowUpRight, PieChart, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ReportsQuickWidget component for providing quick access to reports
const ReportsQuickWidget = ({ orgId, clientId }) => {
  // Mock data for demonstration - in a real app this would come from an API
  const recentReports = [
    {
      id: 'report-1',
      name: 'Clinical Trial Progress Report',
      type: 'progress',
      created: '2025-05-01T14:30:00Z',
      createdBy: 'Sarah Johnson',
      downloads: 12
    },
    {
      id: 'report-2',
      name: 'Safety Monitoring Dashboard',
      type: 'safety',
      created: '2025-04-28T09:15:00Z',
      createdBy: 'Michael Chen',
      downloads: 24
    },
    {
      id: 'report-3',
      name: 'Regulatory Submission Metrics',
      type: 'regulatory',
      created: '2025-04-25T11:45:00Z',
      createdBy: 'Emily Rodriguez',
      downloads: 8
    }
  ];

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHr < 24) {
      return `${diffHr}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get report type badge
  const getReportBadge = (type) => {
    switch (type) {
      case 'progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Progress</Badge>;
      case 'safety':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Safety</Badge>;
      case 'regulatory':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Regulatory</Badge>;
      case 'financial':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Financial</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{type}</Badge>;
    }
  };

  // Get report icon
  const getReportIcon = (type) => {
    switch (type) {
      case 'progress':
        return <BarChart2 size={16} className="text-blue-500" />;
      case 'safety':
        return <PieChart size={16} className="text-red-500" />;
      case 'regulatory':
        return <FileText size={16} className="text-purple-500" />;
      case 'financial':
        return <BarChart2 size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
            Reports & Analytics
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8">
            All Reports
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recentReports.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-700">No reports yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first report</p>
            <Button size="sm" className="mt-3">
              Create Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map(report => (
              <div 
                key={report.id}
                className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  {getReportIcon(report.type)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{report.name}</h4>
                    <div className="ml-2">
                      {getReportBadge(report.type)}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span>{formatTimestamp(report.created)}</span>
                    <span className="mx-1">•</span>
                    <span>{report.createdBy}</span>
                    <span className="mx-1">•</span>
                    <Download size={10} className="mr-1" />
                    <span>{report.downloads}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <Download size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <Button variant="outline" className="w-full">
          <ArrowUpRight size={14} className="mr-1" />
          Create Custom Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportsQuickWidget;