import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ScrollArea,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Separator
} from '@/components/ui';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Clock, 
  Download, 
  FileText, 
  GitBranch, 
  History, 
  Lock, 
  Tag, 
  Unlock, 
  Upload, 
  CheckCircle2, 
  XCircle,
  MessageSquareDiff,
  AlertCircle,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const versionStatusColors = {
  'DRAFT': 'bg-blue-100 text-blue-800',
  'IN_REVIEW': 'bg-yellow-100 text-yellow-800',
  'APPROVED': 'bg-green-100 text-green-800',
  'REJECTED': 'bg-red-100 text-red-800',
  'SUPERSEDED': 'bg-gray-100 text-gray-800',
};

const changeTypeColors = {
  'MINOR': 'bg-gray-100 text-gray-800',
  'MAJOR': 'bg-blue-100 text-blue-800',
  'REVISION': 'bg-purple-100 text-purple-800',
};

export function DocumentVersionHistory({ documentId, onClose, currentUser }) {
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch version history
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: [`/api/versions/${documentId}`],
    refetchInterval: 60000 // Refresh every minute
  });

  // Upload new version mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiRequest(
        'POST', 
        `/api/versions/${documentId}`, 
        formData, 
        {}, 
        true
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'New version uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/versions/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload new version',
        variant: 'destructive',
      });
    }
  });

  // Lock document mutation
  const lockMutation = useMutation({
    mutationFn: async (lockData) => {
      const response = await apiRequest(
        'POST',
        `/api/versions/${documentId}/lock`,
        lockData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document Locked',
        description: 'You now have exclusive editing rights',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/versions/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Lock Failed',
        description: error.message || 'Failed to lock document',
        variant: 'destructive',
      });
    }
  });

  // Unlock document mutation
  const unlockMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'DELETE',
        `/api/versions/${documentId}/lock`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document Unlocked',
        description: 'Document is now available for others to edit',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/versions/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Unlock Failed',
        description: error.message || 'Failed to unlock document',
        variant: 'destructive',
      });
    }
  });

  // Submit version for review mutation
  const submitMutation = useMutation({
    mutationFn: async (versionId) => {
      const response = await apiRequest(
        'POST',
        `/api/versions/${versionId}/submit`,
        { approvers: [] } // Could be populated with selected approvers
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Submitted for Review',
        description: 'Version has been submitted for review',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/versions/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit version for review',
        variant: 'destructive',
      });
    }
  });

  // Approve/reject version mutation
  const approveMutation = useMutation({
    mutationFn: async ({ versionId, approved, comments }) => {
      const response = await apiRequest(
        'POST',
        `/api/versions/${versionId}/approve`,
        { approved, comments }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.status === 'APPROVED' ? 'Version Approved' : 'Version Rejected',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/versions/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to approve/reject version',
        variant: 'destructive',
      });
    }
  });

  // Fetch comparison data if comparing
  const compareQuery = useQuery({
    queryKey: [`/api/versions/compare`, { baseVersionId: selectedVersionId, compareVersionId }],
    enabled: isComparing && !!selectedVersionId && !!compareVersionId,
  });

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('comments', `Uploaded ${file.name}`);
    formData.append('changeSummary', 'Document update');
    formData.append('changeType', 'MINOR');

    uploadMutation.mutate(formData);
  };

  // Handle lock document
  const handleLockDocument = () => {
    lockMutation.mutate({
      reason: 'Editing document',
      durationMinutes: 30
    });
  };

  // Handle unlock document
  const handleUnlockDocument = () => {
    unlockMutation.mutate();
  };

  // Handle submit for review
  const handleSubmitForReview = (versionId) => {
    submitMutation.mutate(versionId);
  };

  // Handle approve/reject
  const handleApproveVersion = (versionId, approved) => {
    approveMutation.mutate({
      versionId,
      approved,
      comments: approved ? 'Approved after review' : 'Rejected due to issues'
    });
  };

  // Handle version selection for comparison
  const handleVersionSelect = (versionId) => {
    if (isComparing) {
      if (selectedVersionId === versionId) {
        // Deselect if already selected
        setSelectedVersionId(null);
      } else if (!selectedVersionId) {
        // Set as base version
        setSelectedVersionId(versionId);
      } else {
        // Set as compare version
        setCompareVersionId(versionId);
      }
    } else {
      setSelectedVersionId(versionId);
    }
  };

  // Toggle comparison mode
  const toggleCompareMode = () => {
    setIsComparing(!isComparing);
    setSelectedVersionId(null);
    setCompareVersionId(null);
  };

  // Download a version
  const handleDownloadVersion = (versionId) => {
    window.open(`/api/versions/${versionId}/download`, '_blank');
  };

  // Check if a version can be submitted for review
  const canSubmitForReview = (version) => {
    return version.status === 'DRAFT';
  };

  // Check if a version can be approved/rejected
  const canApproveReject = (version) => {
    return version.status === 'IN_REVIEW';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-hotpink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          Error Loading Versions
        </h3>
        <p className="mt-2">{error.message || 'Failed to load document versions'}</p>
      </div>
    );
  }

  const { document, versions = [] } = data || {};
  const hasLock = document?.locked_by === currentUser?.id;

  return (
    <div className="version-history p-4">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Document Version History</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleCompareMode}
            className={isComparing ? 'bg-blue-50' : ''}
          >
            <MessageSquareDiff size={16} className="mr-2" />
            {isComparing ? 'Cancel Compare' : 'Compare Versions'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={hasLock ? handleUnlockDocument : handleLockDocument}
          >
            {hasLock ? (
              <>
                <Unlock size={16} className="mr-2" />
                Release Lock
              </>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                Lock for Editing
              </>
            )}
          </Button>
          <Button onClick={() => document.getElementById('version-file-upload').click()}>
            <Upload size={16} className="mr-2" />
            Upload New Version
          </Button>
          <input
            type="file"
            id="version-file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </header>

      {isComparing && (
        <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Comparison Mode</p>
            <p className="text-sm text-gray-600">
              {!selectedVersionId 
                ? 'Select a base version to compare from'
                : !compareVersionId
                  ? 'Now select a version to compare with'
                  : 'Viewing comparison between versions'}
            </p>
          </div>
          {selectedVersionId && compareVersionId && (
            <div className="flex gap-2">
              <Badge className="bg-blue-200 text-blue-800">
                Base: v{versions.find(v => v.id === selectedVersionId)?.version_number}
              </Badge>
              <Badge className="bg-green-200 text-green-800">
                Compare: v{versions.find(v => v.id === compareVersionId)?.version_number}
              </Badge>
            </div>
          )}
        </div>
      )}

      {selectedVersionId && compareVersionId && isComparing && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Version Comparison</CardTitle>
            <CardDescription>
              Comparing version {versions.find(v => v.id === selectedVersionId)?.version_number} to version {versions.find(v => v.id === compareVersionId)?.version_number}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {compareQuery.isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-hotpink-500"></div>
              </div>
            ) : compareQuery.error ? (
              <div className="p-3 border border-red-200 rounded-md bg-red-50 text-red-800">
                <p>Error loading comparison: {compareQuery.error.message}</p>
              </div>
            ) : compareQuery.data ? (
              <div className="comparison-results">
                <div className="stats flex gap-4 mb-4">
                  <div className="stat p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Changes</p>
                    <p className="text-xl font-semibold">{compareQuery.data.diff.stats.percentChanged}%</p>
                  </div>
                  <div className="stat p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Insertions</p>
                    <p className="text-xl font-semibold text-green-600">+{compareQuery.data.diff.stats.insertions}</p>
                  </div>
                  <div className="stat p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Deletions</p>
                    <p className="text-xl font-semibold text-red-600">-{compareQuery.data.diff.stats.deletions}</p>
                  </div>
                </div>

                <Tabs defaultValue="inline">
                  <TabsList>
                    <TabsTrigger value="inline">Inline View</TabsTrigger>
                    <TabsTrigger value="sideBySide">Side by Side</TabsTrigger>
                  </TabsList>
                  <TabsContent value="inline">
                    <ScrollArea className="h-[400px] border rounded-md p-2">
                      {compareQuery.data.diff.diffs.map((diff, index) => (
                        <div 
                          key={index} 
                          className={`diff-block p-1 mb-1 ${
                            diff.type === 'delete' 
                              ? 'bg-red-50 text-red-800 border-l-2 border-red-400' 
                              : diff.type === 'insert' 
                                ? 'bg-green-50 text-green-800 border-l-2 border-green-400' 
                                : ''
                          }`}
                        >
                          {diff.text}
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="sideBySide">
                    <div className="grid grid-cols-2 gap-4">
                      <ScrollArea className="h-[400px] border rounded-md p-2">
                        <h3 className="font-medium mb-2">Base Version</h3>
                        <pre className="text-sm whitespace-pre-wrap">
                          {compareQuery.data.diff.rawText.base}
                        </pre>
                      </ScrollArea>
                      <ScrollArea className="h-[400px] border rounded-md p-2">
                        <h3 className="font-medium mb-2">Compare Version</h3>
                        <pre className="text-sm whitespace-pre-wrap">
                          {compareQuery.data.diff.rawText.compare}
                        </pre>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="versions-table">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                {isComparing && <TableHead className="w-10"></TableHead>}
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Change Type</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id} className={selectedVersionId === version.id ? 'bg-blue-50' : ''}>
                  {isComparing && (
                    <TableCell>
                      <input 
                        type="radio" 
                        checked={selectedVersionId === version.id || compareVersionId === version.id}
                        onChange={() => handleVersionSelect(version.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">v{version.version_number}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <User size={12} className="mr-1" />
                        {version.profiles?.name || 'Unknown User'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(version.created_at), 'MMM d, yyyy')}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={versionStatusColors[version.status] || 'bg-gray-100'}>
                      {version.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {version.change_type && (
                      <Badge className={changeTypeColors[version.change_type] || 'bg-gray-100'}>
                        {version.change_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={version.comments}>
                      {version.comments || version.change_summary || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {version.file_size ? (
                      <span>{Math.round(version.file_size / 1024)} KB</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={() => handleDownloadVersion(version.id)}
                        title="Download"
                      >
                        <Download size={16} />
                      </Button>
                      
                      {canSubmitForReview(version) && (
                        <Button 
                          variant="ghost"
                          size="xs"
                          onClick={() => handleSubmitForReview(version.id)}
                          title="Submit for Review"
                        >
                          <GitBranch size={16} />
                        </Button>
                      )}
                      
                      {canApproveReject(version) && (
                        <>
                          <Button 
                            variant="ghost"
                            size="xs"
                            className="text-green-600"
                            onClick={() => handleApproveVersion(version.id, true)}
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="xs"
                            className="text-red-600"
                            onClick={() => handleApproveVersion(version.id, false)}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

export default DocumentVersionHistory;