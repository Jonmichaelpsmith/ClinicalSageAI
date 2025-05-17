// Toast notification system upgraded to SecureToast

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FileDown, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../App";

const IQOQDownload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    try {
      setLoading(true);
      setDownloadStatus('idle');
      
      // Use the Express server's proxy to the FastAPI endpoint
      // This routes through the Express server which handles forwarding to FastAPI
      window.location.href = '/api/validation/iqoq';
      
      // Set success after a short delay (since we can't directly track download completion)
      setTimeout(() => {
        setDownloadStatus('success');
        useToast().showToast('IQ/OQ/PQ validation document download initiated.', "success");
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      useToast().showToast('Failed to download validation document. Please try again.', "error");
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl font-bold">Validation Documentation</CardTitle>
          <CardDescription className="text-muted-foreground">
            Download Installation Qualification (IQ), Operational Qualification (OQ),
            and Performance Qualification (PQ) documentation for system validation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Documentation Details</h3>
            <p className="text-muted-foreground mb-4">
              These documents provide comprehensive validation information for
              TrialSage, including system specifications, validation test results,
              and regulatory compliance evidence.
            </p>
            <ul className="list-disc pl-4 mb-4">
              <li>Installation Qualification (IQ): System components and environment verification</li>
              <li>Operational Qualification (OQ): Core workflow testing and verification</li>
              <li>Performance Qualification (PQ): End-to-end performance validation</li>
              <li>Audit trail and compliance documentation</li>
            </ul>
          </div>

          {downloadStatus === 'success' && (
            <Alert variant="success" className="flex items-center">
              <CheckCircle className="mr-2" size={20} />
              <span>Document download initiated successfully.</span>
            </Alert>
          )}

          {downloadStatus === 'error' && (
            <Alert variant="destructive" className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>Failed to download document. Please try again or contact support.</span>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-3">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Preparing Document...
              </>
            ) : (
              <>
                <FileDown size={16} className="mr-2" />
                Download IQ/OQ/PQ Documentation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IQOQDownload;