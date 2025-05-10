import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, 
  Package, 
  FileSymlink, 
  MoreVertical, 
  Archive, 
  Clock, 
  Copy, 
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Sequence Header Component
 * 
 * Displays sequence metadata and actions in a header bar.
 */
const SequenceHeader = ({ 
  sequence, 
  project,
  validationStatus = { errors: 0, warnings: 0 },
  onSubmit,
  onDuplicate,
  onArchive
}) => {
  if (!sequence || !project) {
    return (
      <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>
    );
  }

  const getStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'draft':
        color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        break;
      case 'review':
        color = 'bg-blue-100 text-blue-800 border-blue-300';
        break;
      case 'approved':
        color = 'bg-green-100 text-green-800 border-green-300';
        break;
      case 'submitted':
        color = 'bg-purple-100 text-purple-800 border-purple-300';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-300';
    }
    
    return (
      <Badge variant="outline" className={cn('py-1', color)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const canSubmit = sequence.status === 'approved' && validationStatus.errors === 0;

  return (
    <div className="sequence-header bg-white border rounded-md p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <FileSymlink className="h-5 w-5 text-blue-600" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              Sequence {sequence.sequenceNumber}
              {sequence.description && (
                <span className="ml-2 font-normal text-gray-600">
                  - {sequence.description}
                </span>
              )}
            </h2>
            
            <div className="text-sm text-gray-500 flex items-center space-x-3 mt-1">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                <span>{project.name}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Updated {format(new Date(sequence.updatedAt), 'MMM dd, yyyy')}</span>
              </div>
              
              {sequence.submissionDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Submitted {format(new Date(sequence.submissionDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {validationStatus && (
            <div className="flex items-center space-x-2">
              {validationStatus.errors > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{validationStatus.errors} error{validationStatus.errors !== 1 ? 's' : ''}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submission has validation errors that must be fixed</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Validation passed</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No validation errors</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {validationStatus.warnings > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{validationStatus.warnings} warning{validationStatus.warnings !== 1 ? 's' : ''}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submission has warnings that should be reviewed</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          
          {getStatusBadge(sequence.status)}
          
          <div className="flex items-center space-x-2">
            {canSubmit && (
              <Button
                variant="default"
                size="sm"
                onClick={onSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Sequence
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sequence Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDuplicate} disabled={!onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Duplicate Sequence</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive} disabled={!onArchive || sequence.status === 'submitted'}>
                  <Archive className="h-4 w-4 mr-2" />
                  <span>Archive Sequence</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceHeader;