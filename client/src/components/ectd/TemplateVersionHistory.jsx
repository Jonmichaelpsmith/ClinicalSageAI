/**
 * Template Version History Component for eCTD Module
 * 
 * This component displays the version history of a template and allows
 * for comparing versions, reverting to previous versions, and viewing version details.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArrowDownUp, RotateCcw, Calendar, FileText, Clock, User, FileCheck, Download, FileDiff } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getTemplateVersionHistory, 
  getTemplateVersion, 
  revertToVersion,
  compareTemplateVersions,
  exportTemplateVersion
} from '../../services/templateVersioningService';

export default function TemplateVersionHistory({ templateId, onVersionSelect }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [revertingVersion, setRevertingVersion] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (templateId) {
      setLoading(true);
      getTemplateVersionHistory(templateId)
        .then(result => {
          setVersions(result);
          // By default, select the current version
          const currentVersion = result.find(v => v.status === 'current');
          if (currentVersion) {
            setSelectedVersionId(currentVersion.versionId);
          }
        })
        .catch(error => {
          console.error('Error fetching template versions:', error);
          toast({
            title: "Failed to load versions",
            description: "Could not retrieve template version history.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [templateId, toast]);

  const handleViewVersion = (versionId) => {
    setSelectedVersionId(versionId);
    if (onVersionSelect) {
      getTemplateVersion(templateId, versionId)
        .then(templateVersion => {
          onVersionSelect(templateVersion);
        })
        .catch(error => {
          console.error('Error loading template version:', error);
          toast({
            title: "Failed to load version",
            description: `Could not retrieve version ${versionId}.`,
            variant: "destructive"
          });
        });
    }
  };

  const handleCompareVersions = async () => {
    if (!selectedVersionId || !compareVersionId || selectedVersionId === compareVersionId) {
      toast({
        title: "Invalid comparison",
        description: "Please select two different versions to compare.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await compareTemplateVersions(templateId, selectedVersionId, compareVersionId);
      setComparisonResult(result);
      setShowCompareDialog(true);
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast({
        title: "Comparison failed",
        description: "Could not compare the selected versions.",
        variant: "destructive"
      });
    }
  };

  const handleRevert = async () => {
    try {
      await revertToVersion(templateId, revertingVersion.versionId);
      
      toast({
        title: "Template reverted",
        description: `Successfully reverted to version ${revertingVersion.versionId}.`
      });
      
      // Refresh version history after revert
      const updatedHistory = await getTemplateVersionHistory(templateId);
      setVersions(updatedHistory);
      
      // Select the new current version
      const currentVersion = updatedHistory.find(v => v.status === 'current');
      if (currentVersion) {
        setSelectedVersionId(currentVersion.versionId);
        if (onVersionSelect) {
          const templateVersion = await getTemplateVersion(templateId, currentVersion.versionId);
          onVersionSelect(templateVersion);
        }
      }
      
      setShowRevertDialog(false);
    } catch (error) {
      console.error('Error reverting to version:', error);
      toast({
        title: "Revert failed",
        description: "Could not revert to the selected version.",
        variant: "destructive"
      });
    }
  };
  
  const handleExport = async (versionId, format) => {
    try {
      const result = await exportTemplateVersion(templateId, versionId, format);
      
      toast({
        title: "Export successful",
        description: `Template exported as ${format.toUpperCase()}.`
      });
      
      // In a real app, this would likely trigger a download
      console.log('Export result:', result);
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: "Export failed",
        description: `Could not export template as ${format.toUpperCase()}.`,
        variant: "destructive"
      });
    }
  };
  
  const openRevertDialog = (version) => {
    setRevertingVersion(version);
    setShowRevertDialog(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-600">Current</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-500">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading version history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-medium text-gray-800">Version History</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!selectedVersionId || !compareVersionId || selectedVersionId === compareVersionId}
            onClick={handleCompareVersions}
            className="flex items-center"
          >
            <FileDiff className="mr-1 h-4 w-4" />
            Compare
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport(selectedVersionId, 'pdf')}
            disabled={!selectedVersionId}
            className="flex items-center"
          >
            <Download className="mr-1 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <ScrollArea className="border rounded-md h-72">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow 
                key={version.versionId}
                className={selectedVersionId === version.versionId ? "bg-muted/50" : ""}
              >
                <TableCell className="font-medium">{version.versionId}</TableCell>
                <TableCell>{format(new Date(version.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>{version.createdBy}</TableCell>
                <TableCell className="max-w-xs truncate" title={version.changeDescription}>
                  {version.changeDescription}
                </TableCell>
                <TableCell>{getStatusBadge(version.status)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleViewVersion(version.versionId)}
                    title="View this version"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    title="Select for comparison"
                    onClick={() => setCompareVersionId(version.versionId)}
                    className={compareVersionId === version.versionId ? "bg-muted" : ""}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                  {version.status !== 'current' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Revert to this version" 
                      onClick={() => openRevertDialog(version)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {versions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No version history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Version Comparison
            </DialogTitle>
            <DialogDescription>
              Comparing version {selectedVersionId} with {compareVersionId}
            </DialogDescription>
          </DialogHeader>
          
          {comparisonResult && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Changes Summary</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded w-14 text-center mr-2">+{comparisonResult.addedSections.length}</span>
                      <span>New sections added</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded w-14 text-center mr-2">-{comparisonResult.removedSections.length}</span>
                      <span>Sections removed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded w-14 text-center mr-2">{comparisonResult.modifiedSections.length}</span>
                      <span>Sections modified</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Word Count Changes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded w-14 text-center mr-2">+{comparisonResult.wordCount.added}</span>
                      <span>Words added</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded w-14 text-center mr-2">-{comparisonResult.wordCount.removed}</span>
                      <span>Words removed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded w-14 text-center mr-2 ${comparisonResult.wordCount.net >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {comparisonResult.wordCount.net >= 0 ? '+' : ''}{comparisonResult.wordCount.net}
                      </span>
                      <span>Net change</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-gray-800">Regulatory Impact</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border">
                  {comparisonResult.regulatoryImpact}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-gray-800">Added Sections</h4>
                  <ul className="text-xs space-y-1">
                    {comparisonResult.addedSections.map(section => (
                      <li key={section} className="bg-green-50 text-green-800 px-2 py-1 rounded">
                        {section}
                      </li>
                    ))}
                    {comparisonResult.addedSections.length === 0 && (
                      <li className="text-gray-500 italic">None</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm text-gray-800">Removed Sections</h4>
                  <ul className="text-xs space-y-1">
                    {comparisonResult.removedSections.map(section => (
                      <li key={section} className="bg-red-50 text-red-800 px-2 py-1 rounded">
                        {section}
                      </li>
                    ))}
                    {comparisonResult.removedSections.length === 0 && (
                      <li className="text-gray-500 italic">None</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm text-gray-800">Modified Sections</h4>
                  <ul className="text-xs space-y-1">
                    {comparisonResult.modifiedSections.map(section => (
                      <li key={section} className="bg-amber-50 text-amber-800 px-2 py-1 rounded">
                        {section}
                      </li>
                    ))}
                    {comparisonResult.modifiedSections.length === 0 && (
                      <li className="text-gray-500 italic">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => handleExport(selectedVersionId, 'docx')}
              className="flex items-center"
            >
              <Download className="mr-1 h-4 w-4" />
              Export as DOCX
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Revert Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert to Previous Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to revert to version {revertingVersion?.versionId}? 
              This will create a new version based on the selected one.
            </DialogDescription>
          </DialogHeader>
          
          {revertingVersion && (
            <div className="space-y-4 my-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <h4 className="text-amber-800 font-medium flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" /> Version Info
                </h4>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span>
                      Created on {format(new Date(revertingVersion.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <User className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span>
                      Author: {revertingVersion.createdBy}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FileCheck className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span>
                      Change summary: {revertingVersion.changeDescription}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevertDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleRevert}
              className="flex items-center"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Revert to This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}