
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Loader2 } from 'lucide-react';

/**
 * CER Report Export Panel - Allows batch exporting of multiple CER reports
 * with optimized memory usage and performance
 */
export default function CerReportExportPanel({ reports = [], onExportComplete }) {
  const { toast } = useToast();
  const [selectedReports, setSelectedReports] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState('');

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report.id));
    }
  };

  const exportReports = async () => {
    if (selectedReports.length === 0) {
      toast({
        title: "No reports selected",
        description: "Please select at least one report to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      // Export reports one at a time to avoid memory issues
      for (let i = 0; i < selectedReports.length; i++) {
        const reportId = selectedReports[i];
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
          setCurrentReport(report.title || 'Unnamed Report');
          
          // Call the API to export a single report
          const response = await fetch(`/api/cer/export-pdf/${reportId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to export report: ${response.statusText}`);
          }
          
          // Create download blob
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `CER_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / selectedReports.length) * 100));
      }
      
      toast({
        title: "Export complete",
        description: `Successfully exported ${selectedReports.length} reports.`,
      });
      
      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "There was an error exporting the reports.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setCurrentReport('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Report Export</CardTitle>
        <CardDescription>
          Export multiple CER reports as PDF documents
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="select-all" 
              checked={selectedReports.length === reports.length && reports.length > 0} 
              onCheckedChange={handleSelectAll}
              disabled={isExporting}
            />
            <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select All Reports
            </label>
          </div>
          
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="flex items-center space-x-2 py-2 border-b last:border-b-0">
                  <Checkbox 
                    id={`report-${report.id}`} 
                    checked={selectedReports.includes(report.id)} 
                    onCheckedChange={() => handleSelectReport(report.id)}
                    disabled={isExporting}
                  />
                  <label htmlFor={`report-${report.id}`} className="text-sm leading-none flex-1 truncate peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {report.title || `Report ${report.id}`}
                  </label>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">No reports available</p>
            )}
          </div>
        </div>
        
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Exporting: {currentReport}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={exportReports} 
          disabled={isExporting || selectedReports.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Export Selected Reports
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
