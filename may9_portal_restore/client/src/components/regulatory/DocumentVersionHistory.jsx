import React from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, CornerUpLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Document Version History Component
 * 
 * Displays the version history of a document with options to view,
 * download, or revert to a previous version.
 */
const DocumentVersionHistory = ({ 
  versions, 
  currentVersionId,
  onView, 
  onDownload, 
  onRevert,
  allowRevert = true
}) => {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50">
        No version history available
      </div>
    );
  }

  // Sort versions by version number in descending order (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const renderStatus = (status) => {
    let color;
    switch (status) {
      case 'draft':
        color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        break;
      case 'final':
        color = 'bg-green-100 text-green-800 border-green-300';
        break;
      case 'uploaded':
        color = 'bg-blue-100 text-blue-800 border-blue-300';
        break;
      case 'locked':
        color = 'bg-red-100 text-red-800 border-red-300';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-300';
    }
    
    return (
      <Badge variant="outline" className={cn('py-0 h-5 text-xs', color)}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="version-history border rounded-md">
      <Table>
        <TableCaption>Version history for this document</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVersions.map((version) => (
            <TableRow 
              key={version.id}
              className={currentVersionId === version.id ? 'bg-gray-50' : ''}
            >
              <TableCell className="font-medium">
                v{version.versionNumber}
                {currentVersionId === version.id && (
                  <Badge variant="outline" className="ml-2 bg-blue-50">
                    Current
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(version.createdAt), 'MMM dd, yyyy h:mm a')}
              </TableCell>
              <TableCell>
                {version.createdBy?.name || '—'}
              </TableCell>
              <TableCell>
                {renderStatus(version.status)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {version.comment || '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onView?.(version)}
                    title="View this version"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDownload?.(version)}
                    title="Download this version"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {allowRevert && currentVersionId !== version.id && version.status !== 'locked' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRevert?.(version)}
                      title="Revert to this version"
                    >
                      <CornerUpLeft className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentVersionHistory;