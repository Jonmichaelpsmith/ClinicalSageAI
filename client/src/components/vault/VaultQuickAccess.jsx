/**
 * Vault Quick Access Component
 * 
 * This component provides a compact card for quick access to the Vault module,
 * displaying summary information and recent document uploads.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  File, 
  FileText, 
  FolderOpen, 
  Shield, 
  UploadCloud 
} from 'lucide-react';

/**
 * Vault Quick Access Component
 * 
 * @param {Object} props Component props
 * @param {string} props.userId Current user ID
 * @param {string} props.orgId Current organization ID
 * @param {number} props.recentDocsCount Number of recent documents to display (default: 3)
 */
const VaultQuickAccess = ({ userId, orgId, recentDocsCount = 3 }) => {
  const [vaultStats, setVaultStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vault stats and recent documents from API
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch('/api/vault/recent-docs');
        const data = await response.json();
        setRecentDocs(data.data);
        
        // Set default vault stats until we have a dedicated endpoint
        setVaultStats({
          totalDocuments: data.data.length,
          totalSize: "2.4 GB",
          securityLevel: "Enhanced",
          lastBackup: "Today"
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Vault documents:', error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Helper to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Helper to get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'protocol':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'regulatory':
        return <File className="h-4 w-4 text-amber-500" />;
      case 'safety':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="min-h-[220px] flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Vault Quick Access
        </CardTitle>
        <CardDescription>
          Document storage and versioning
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="text-sm font-medium">{vaultStats.totalDocuments}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Storage Used</p>
            <p className="text-sm font-medium">{vaultStats.totalSize}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Uploads</h4>
          <ScrollArea className="h-[120px]">
            {recentDocs.map(doc => (
              <div key={doc.id} className="flex items-start py-2">
                <div className="mr-2 mt-0.5">
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">{doc.size}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/vault">
            Go to Vault
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
        
        <Button asChild variant="secondary" size="sm">
          <Link to="/vault/upload">
            <UploadCloud className="h-3.5 w-3.5 mr-1" />
            Upload
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VaultQuickAccess;