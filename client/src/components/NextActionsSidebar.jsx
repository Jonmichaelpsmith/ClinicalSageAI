import React from 'react';
import { Clock, CheckCircle, AlertCircle, ArrowUpRight, Calendar, FileText, User, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// NextActionsSidebar component for displaying next actions and pending tasks
const NextActionsSidebar = ({ orgId, clientId }) => {
  // Mock data for demonstration - in a real app this would come from an API
  const nextActions = [
    {
      id: 'action-1',
      title: 'Review IND submission draft',
      dueDate: '2025-05-15T00:00:00Z',
      priority: 'high',
      status: 'pending',
      type: 'review'
    },
    {
      id: 'action-2',
      title: 'Schedule FDA meeting preparation',
      dueDate: '2025-05-18T00:00:00Z',
      priority: 'medium',
      status: 'pending',
      type: 'meeting'
    },
    {
      id: 'action-3',
      title: 'Approve DSMB report',
      dueDate: '2025-05-12T00:00:00Z',
      priority: 'high',
      status: 'pending',
      type: 'approval'
    },
    {
      id: 'action-4',
      title: 'Update clinical study protocol',
      dueDate: '2025-05-20T00:00:00Z',
      priority: 'medium',
      status: 'in_progress',
      type: 'document'
    },
    {
      id: 'action-5',
      title: 'Assign site monitor responsibilities',
      dueDate: '2025-05-22T00:00:00Z',
      priority: 'low',
      status: 'pending',
      type: 'assignment'
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get days remaining until due date
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-700">Normal</Badge>;
    }
  };

  // Get action icon
  const getActionIcon = (type) => {
    switch (type) {
      case 'review':
        return <FileText size={16} className="text-primary" />;
      case 'meeting':
        return <Calendar size={16} className="text-indigo-500" />;
      case 'approval':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'document':
        return <FileText size={16} className="text-blue-500" />;
      case 'assignment':
        return <User size={16} className="text-purple-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Next Actions
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {nextActions.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <CheckCircle className="h-10 w-10 mx-auto text-green-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-700">All caught up!</h3>
            <p className="text-sm text-gray-500 mt-1">No pending actions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextActions.slice(0, 4).map(action => (
              <div 
                key={action.id}
                className={`flex items-start p-3 rounded-md border ${
                  getDaysRemaining(action.dueDate) <= 3 ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer`}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getActionIcon(action.type)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                    {getPriorityBadge(action.priority)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar size={12} className="mr-1" />
                    <span>Due: {formatDate(action.dueDate)}</span>
                    {getDaysRemaining(action.dueDate) <= 3 ? (
                      <Badge variant="outline" className="ml-2 bg-red-100 border-red-200 text-red-700">
                        {getDaysRemaining(action.dueDate)} days left
                      </Badge>
                    ) : (
                      <span className="ml-2 text-gray-500">
                        ({getDaysRemaining(action.dueDate)} days left)
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                  <ArrowRight size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
        {nextActions.length > 4 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowUpRight size={14} className="mr-1" />
              See {nextActions.length - 4} more actions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextActionsSidebar;