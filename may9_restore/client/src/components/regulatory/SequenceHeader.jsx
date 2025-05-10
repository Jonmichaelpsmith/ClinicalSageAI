import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * Sequence Header Component
 * 
 * Displays information about a submission sequence including metadata
 * and validation status, with actions for submission.
 */
const SequenceHeader = ({ 
  sequence, 
  project, 
  validationStatus = { errors: 0, warnings: 0 }, 
  onSubmit 
}) => {
  const getStatusBadge = () => {
    switch (sequence.status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case 'review':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            In Review
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {sequence.status || 'Draft'}
          </Badge>
        );
    }
  };
  
  const formattedDate = (dateString) => {
    try {
      return dateString 
        ? format(new Date(dateString), 'MMM d, yyyy') 
        : 'Not yet submitted';
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <span className="text-gray-500">•</span>
            <span className="text-lg">Sequence {sequence.sequenceNumber}</span>
            {getStatusBadge()}
          </div>
          <p className="text-gray-500 mt-1">{sequence.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {sequence.status !== 'submitted' && (
            <Button onClick={onSubmit} disabled={validationStatus.errors > 0}>
              <Send className="h-4 w-4 mr-2" />
              Submit to Agency
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="font-medium">{formattedDate(sequence.updatedAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Submission Date</p>
          <p className="font-medium">{sequence.submissionDate ? formattedDate(sequence.submissionDate) : 'Not yet submitted'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Validation Status</p>
          <div className="flex items-center gap-2">
            {validationStatus.errors > 0 ? (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {validationStatus.errors} Errors
              </Badge>
            ) : validationStatus.warnings > 0 ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {validationStatus.warnings} Warnings
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceHeader;