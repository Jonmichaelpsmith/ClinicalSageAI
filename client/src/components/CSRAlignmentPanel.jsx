import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

/**
 * CSRAlignmentPanel - Displays semantic alignment between protocol fields and CSR evidence
 * 
 * @param {Object} props
 * @param {string} props.sessionId - Session ID to fetch alignment data
 */
const CSRAlignmentPanel = ({ sessionId }) => {
  const [alignmentData, setAlignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlignmentData = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/sessions/${sessionId}/alignment`);
        setAlignmentData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching alignment data:', err);
        setError('Failed to load alignment data. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load protocol alignment data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlignmentData();
  }, [sessionId, toast]);

  const exportToCsv = () => {
    if (!alignmentData || !alignmentData.matches) return;

    // Create CSV header
    let csvContent = "Field,Protocol Value,CSR Value,Similarity,Match\n";

    // Add data rows
    alignmentData.matches.forEach(row => {
      const escapedProtocolValue = `"${String(row.protocol_value).replace(/"/g, '""')}"`;
      const escapedCsrValue = `"${String(row.csr_value).replace(/"/g, '""')}"`;
      
      csvContent += `${row.field},${escapedProtocolValue},${escapedCsrValue},${row.similarity},${row.match}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `protocol_alignment_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Alignment data has been exported to CSV.",
    });
  };

  const getStatusBadge = (similarity) => {
    if (similarity >= 0.7) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" /> Match
        </Badge>
      );
    } else if (similarity < 0.5) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <AlertTriangle className="h-3 w-3 mr-1" /> Warning
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <FileText className="h-3 w-3 mr-1" /> Review
        </Badge>
      );
    }
  };

  const getProgressColor = (similarity) => {
    if (similarity >= 0.7) return "bg-green-500";
    if (similarity < 0.5) return "bg-red-500";
    return "bg-yellow-500";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Protocol-CSR Alignment</CardTitle>
          <CardDescription>Loading semantic alignment data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Protocol-CSR Alignment</CardTitle>
          <CardDescription>Unable to load semantic alignment data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alignmentData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Protocol-CSR Alignment</CardTitle>
          <CardDescription>No alignment data available for this session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-md text-blue-800">
            <p>Please run a protocol analysis to generate semantic alignment data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallScore = Math.round(alignmentData.alignment_score * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Protocol-CSR Alignment</CardTitle>
            <CardDescription>
              Semantic field-level comparison with historical CSR evidence
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium mr-2">Overall Alignment:</span>
                  <span className="text-lg font-bold">{overallScore}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average semantic similarity across all protocol fields</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Protocol Value</TableHead>
              <TableHead>CSR Evidence</TableHead>
              <TableHead className="text-center">Similarity</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alignmentData.matches && alignmentData.matches.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.field}</TableCell>
                <TableCell className="max-w-[250px] break-words">
                  {String(row.protocol_value)}
                </TableCell>
                <TableCell className="max-w-[250px] break-words">
                  {String(row.csr_value)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">{Math.round(row.similarity * 100)}%</span>
                    <Progress 
                      value={row.similarity * 100} 
                      className={`h-2 w-20 ${getProgressColor(row.similarity)}`} 
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(row.similarity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="inline-flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div> Match (&gt;70%)
          </span>
          <span className="inline-flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div> Review (50-70%)
          </span>
          <span className="inline-flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div> Warning (&lt;50%)
          </span>
        </div>
        <Button onClick={exportToCsv} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CSRAlignmentPanel;