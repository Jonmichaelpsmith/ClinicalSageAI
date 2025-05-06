import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, Zap } from 'lucide-react';

/**
 * Data Retrieval Status Component
 * 
 * This component displays the status of autonomous data retrieval for a CER report
 * and provides a button to trigger the data retrieval process.
 */
const DataRetrievalStatus = ({ 
  reportId, 
  status, 
  isLoading, 
  onTriggerRetrieval 
}) => {
  // No status to display yet
  if (!reportId) return null;
  
  return (
    <div className="space-y-4">
      {/* Data Retrieval Status */}
      {status && (
        <Card className="bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Autonomous Data Retrieval Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>FAERS Data</span>
                <Badge variant={status.faersStatus === 'completed' ? 'success' : (status.faersStatus === 'failed' ? 'destructive' : 'secondary')}>
                  {status.faersStatus === 'completed' ? 'Completed' : 
                    status.faersStatus === 'in_progress' ? 'In Progress' : 
                    status.faersStatus === 'failed' ? 'Failed' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Literature Data</span>
                <Badge variant={status.literatureStatus === 'completed' ? 'success' : (status.literatureStatus === 'failed' ? 'destructive' : 'secondary')}>
                  {status.literatureStatus === 'completed' ? 'Completed' : 
                    status.literatureStatus === 'in_progress' ? 'In Progress' : 
                    status.literatureStatus === 'failed' ? 'Failed' : 'Pending'}
                </Badge>
              </div>
              <Progress value={status.progress || 0} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Autonomous Data Retrieval Button */}
      <Card className="border-dashed border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enhanced Data Retrieval</CardTitle>
          <CardDescription>
            Automatically retrieve and analyze FAERS and literature data for this report
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Report ID: <span className="font-mono text-xs">{reportId}</span></p>
            </div>
            <Button 
              onClick={onTriggerRetrieval}
              disabled={isLoading || (status?.status === 'in_progress')}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isLoading ? 'Processing' : 'Start Enhanced Retrieval'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRetrievalStatus;