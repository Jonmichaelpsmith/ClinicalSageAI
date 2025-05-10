import React from 'react';
import { Database, FileText, FileCheck, Clock, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// VaultQuickAccess component for providing quick access to vault documents
const VaultQuickAccess = ({ orgId, clientId }) => {
  // Mock data for demonstration - in a real app this would come from an API
  const recentDocuments = [
    {
      id: 'doc-1',
      name: 'Protocol v2.1 Final.pdf',
      status: 'approved',
      updatedAt: '2025-04-24T15:30:00Z',
      type: 'protocol'
    },
    {
      id: 'doc-2',
      name: 'Investigator Brochure.docx',
      status: 'in_review',
      updatedAt: '2025-04-22T11:20:00Z',
      type: 'brochure'
    },
    {
      id: 'doc-3',
      name: 'Statistical Analysis Plan.pdf',
      status: 'approved',
      updatedAt: '2025-04-20T09:45:00Z',
      type: 'stats'
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

  // Get status badge based on document status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">In Review</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Draft</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Vault Quick Access
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recentDocuments.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-700">No documents yet</h3>
            <p className="text-sm text-gray-500 mt-1">Add documents to your vault</p>
            <Button size="sm" className="mt-3">
              <Plus size={14} className="mr-1" />
              Add Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocuments.map(doc => (
              <div 
                key={doc.id}
                className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileCheck size={16} className="text-primary" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{doc.name}</h4>
                    <div className="ml-2">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <Clock size={12} className="mr-1" />
                    <span>{formatTimestamp(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VaultQuickAccess;