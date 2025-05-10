import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FileText, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

/**
 * Submission Tree View Component
 * 
 * A hierarchical tree view for displaying eCTD/IND submissions structure
 * with collapsible folders and validation status indicators.
 */
const SubmissionTreeView = ({ 
  data, 
  onNodeSelect, 
  selectedNodeId = null,
  expandedNodes = {},
  onNodeToggle
}) => {
  // If no external control of expanded state, manage it internally
  const [internalExpandedNodes, setInternalExpandedNodes] = useState({});
  
  const isExpanded = (nodeId) => {
    if (onNodeToggle) {
      return expandedNodes[nodeId];
    }
    return internalExpandedNodes[nodeId];
  };
  
  const handleToggle = (nodeId) => {
    if (onNodeToggle) {
      onNodeToggle(nodeId);
    } else {
      setInternalExpandedNodes(prev => ({
        ...prev,
        [nodeId]: !prev[nodeId]
      }));
    }
  };

  const renderIcon = (node) => {
    switch (node.type) {
      case 'project':
        return <Package className="h-4 w-4 mr-2" />;
      case 'sequence':
        return <Folder className="h-4 w-4 mr-2" />;
      case 'module':
        return <Folder className="h-4 w-4 mr-2" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'granule':
        return <File className="h-4 w-4 mr-2" />;
      default:
        return <File className="h-4 w-4 mr-2" />;
    }
  };

  const renderStatusBadge = (node) => {
    if (!node.status) return null;
    
    let color;
    switch (node.status) {
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
      case 'incomplete':
        color = 'bg-gray-100 text-gray-800 border-gray-300';
        break;
      case 'inProgress':
        color = 'bg-blue-100 text-blue-800 border-blue-300';
        break;
      case 'complete':
        color = 'bg-green-100 text-green-800 border-green-300';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-300';
    }
    
    return (
      <Badge variant="outline" className={cn('ml-2 py-0 h-5 text-xs', color)}>
        {node.status}
      </Badge>
    );
  };

  const renderValidationIndicator = (node) => {
    if (!node.validationIssues) return null;
    
    const errorCount = node.validationIssues.filter(issue => issue.severity === 'error').length;
    const warningCount = node.validationIssues.filter(issue => issue.severity === 'warning').length;
    
    if (errorCount === 0 && warningCount === 0) return null;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <AlertTriangle className={cn(
              'h-4 w-4 ml-2',
              errorCount > 0 ? 'text-red-500' : 'text-amber-500'
            )} />
            {errorCount > 0 && (
              <span className="text-xs text-red-500 ml-1">{errorCount}</span>
            )}
            {warningCount > 0 && !errorCount && (
              <span className="text-xs text-amber-500 ml-1">{warningCount}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            {errorCount > 0 && <div className="text-red-500">{errorCount} error{errorCount !== 1 ? 's' : ''}</div>}
            {warningCount > 0 && <div className="text-amber-500">{warningCount} warning{warningCount !== 1 ? 's' : ''}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderTreeNodes = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul className={cn('pl-4', level === 0 ? 'pl-0' : '')}>
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const expanded = hasChildren && isExpanded(node.id);
          
          return (
            <li key={node.id} className="py-1">
              <div
                className={cn(
                  "flex items-center rounded-md p-2 hover:bg-gray-100 cursor-pointer",
                  selectedNodeId === node.id ? "bg-gray-100" : ""
                )}
                onClick={() => onNodeSelect?.(node)}
              >
                {hasChildren ? (
                  <span
                    className="mr-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(node.id);
                    }}
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                ) : (
                  <span className="mr-5" />
                )}
                
                {renderIcon(node)}
                
                <span className="truncate">{node.name || node.displayName}</span>
                
                {renderStatusBadge(node)}
                {renderValidationIndicator(node)}
              </div>
              
              {hasChildren && expanded && renderTreeNodes(node.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="submission-tree-view border rounded-md p-4 h-full overflow-auto">
      {renderTreeNodes(data)}
    </div>
  );
};

export default SubmissionTreeView;