import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/**
 * Validation Results List Component
 * 
 * Displays a list of validation issues found in a submission.
 */
const ValidationResultsList = ({ results = [] }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-red-500 border-red-200 bg-red-50';
      case 'warning':
        return 'text-amber-500 border-amber-200 bg-amber-50';
      case 'info':
        return 'text-blue-500 border-blue-200 bg-blue-50';
      case 'success':
        return 'text-green-500 border-green-200 bg-green-50';
      default:
        return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  // If no results, show empty state
  if (!results || results.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <CheckCircle className="h-10 w-10 mx-auto text-green-500" />
        <h3 className="mt-2 text-lg font-medium">No validation issues found</h3>
        <p className="text-gray-500">The submission has passed all validation checks.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableCaption>Validation results for this submission</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Severity</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead className="w-[250px]">Location</TableHead>
            <TableHead className="w-[180px]">Rule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index} className={cn("hover:bg-gray-50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
              <TableCell>
                <div className="flex items-center">
                  {getSeverityIcon(result.severity)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{result.message}</TableCell>
              <TableCell>{result.location}</TableCell>
              <TableCell>
                <div className={cn("text-xs px-2 py-1 rounded-full inline-flex items-center", getSeverityClass(result.severity))}>
                  {result.rule}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ValidationResultsList;