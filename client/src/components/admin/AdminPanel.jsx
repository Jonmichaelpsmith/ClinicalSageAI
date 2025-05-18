import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, RefreshCcw, Database, Server, Upload, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function AdminPanel() {
  const queryClient = useQueryClient();

  // Export CSRs to JSON mutation
  const exportCsrMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/csr/export-to-json');
      return response.json();
    },
    onSuccess: (data) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Export Successful",
        description: `Exported ${data.results.exported} new CSR files. Total available: ${data.results.filesInDir}`,
        variant: "default"
      });
    },
    onError: (error) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Export Failed",
        description: "Failed to export CSR data. Please try again.",
        variant: "destructive"
      });
      console.error('Export error:', error);
    }
  });

  // Import CSRs from JSON mutation
  const importCsrMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/csr/import-from-json');
      return response.json();
    },
    onSuccess: (data) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Import Successful",
        description: `Imported ${data.results.imported} new CSR files.`,
        variant: "default"
      });
      console.log('Import results:', data);
    },
    onError: (error) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Import Failed",
        description: "Failed to import CSR data. Please check the logs.",
        variant: "destructive"
      });
      console.error('Import error:', error);
    }
  });

  // Rebuild database mutation
  const rebuildDbMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/rebuild-database');
      return response.json();
    },
    onSuccess: (data) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Database Rebuilt",
        description: `Database successfully rebuilt. ${data.tables} tables affected.`,
        variant: "default"
      });
      console.log('Rebuild results:', data);
    },
    onError: (error) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Database Rebuild Failed",
        description: "Failed to rebuild database. Check server logs.",
        variant: "destructive"
      });
      console.error('Rebuild error:', error);
    }
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/clear-cache');
      return response.json();
    },
    onSuccess: (data) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Cache Cleared",
        description: `Successfully cleared ${data.entries} cache entries.`
      });
      console.log('Clear cache results:', data);
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      // toast call replaced
      console.log('Toast would show:', {
        title: "Cache Clear Failed",
        description: "Failed to clear application cache."
      });
      console.error('Clear cache error:', error);
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>CSR Export</CardTitle>
          <CardDescription>Export Clinical Study Reports to JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Export all Clinical Study Reports to JSON format for backup or transfer.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => exportCsrMutation.mutate()} 
            disabled={exportCsrMutation.isPending}
            className="w-full"
          >
            {exportCsrMutation.isPending ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSRs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSR Import</CardTitle>
          <CardDescription>Import Clinical Study Reports from JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Import Clinical Study Reports from JSON files into the database.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => importCsrMutation.mutate()} 
            disabled={importCsrMutation.isPending}
            className="w-full"
          >
            {importCsrMutation.isPending ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import CSRs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rebuild Database</CardTitle>
          <CardDescription>Rebuild database tables and indexes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Rebuild database tables and indexes to improve performance.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => rebuildDbMutation.mutate()} 
            disabled={rebuildDbMutation.isPending}
            className="w-full"
            variant="secondary"
          >
            {rebuildDbMutation.isPending ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Rebuild Database
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clear Cache</CardTitle>
          <CardDescription>Clear application cache</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Clear all cached data to ensure the latest information is displayed.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => clearCacheMutation.mutate()} 
            disabled={clearCacheMutation.isPending}
            className="w-full"
            variant="secondary"
          >
            {clearCacheMutation.isPending ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Clear Cache
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Generator</CardTitle>
          <CardDescription>Generate regulatory documents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Generate standardized regulatory documents from templates.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Documents
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}