/**
 * Google Docs Editor Integration Component
 * 
 * This component provides a direct interface for editing 
 * regulatory documents using Google Docs with eCTD validation.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Save, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowRight,
  FileCheck,
  Edit2,
  Copy,
  Loader2,
  Settings,
  LayoutTemplate,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as googleDocsService from '../services/googleDocsService';
import * as googleAuthService from '../services/googleAuthService';
import * as aiService from '../services/aiService';

// Google icon component for branding
const GoogleDocsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 87.3 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50.8,9.9h27.5c2.6,0,4.8,0.8,6.5,2.4c1.7,1.6,2.6,3.6,2.6,6.1v83.3c0,2.5-0.9,4.5-2.6,6.1c-1.7,1.6-3.9,2.4-6.5,2.4 H8.9c-2.6,0-4.8-0.8-6.5-2.4c-1.7-1.6-2.6-3.7-2.6-6.1v-83.3c0-2.5,0.9-4.5,2.6-6.1c1.7-1.6,3.9-2.4,6.5-2.4h27.5" fill="#4285F4"/>
    <path d="M43.7,0c1.6,0,2.9,0.6,4,1.7l8.5,8.2H43.7c-1.9,0-3.5,0.6-4.9,1.9c-1.4,1.3-2,2.8-2,4.7v15c0,1.9,0.7,3.4,2,4.7 c1.4,1.3,3,1.9,4.9,1.9h26.3v49.3H17.1v-78h22.8L43.7,0z" fill="#F1F1F1"/>
    <path d="M51.2,19.3v12.3c0,0.4,0.2,0.6,0.5,0.6h18.1c0.1,0,0.3-0.1,0.4-0.2c0.1-0.1,0.1-0.3,0-0.4l-3.4-5.9v-0.1 c0,0,0-0.1,0-0.1l-15.2-6.3C51.4,19.1,51.2,19.2,51.2,19.3z" fill="#4285F4"/>
    <path d="M17.1,49.4h52.9V68H17.1V49.4z" fill="#4285F4"/>
  </svg>
);

export default function GoogleDocsEditor() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [docTitle, setDocTitle] = useState("Module 2.5 Clinical Overview");
  const [validationProgress, setValidationProgress] = useState(48);
  const [validationMessages, setValidationMessages] = useState([
    { id: 1, type: "info", message: "Note: Ensure that the patient demographics include ethnicity for all pivotal trials." }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Check Google authentication status
    const checkAuth = async () => {
      try {
        const authStatus = await googleAuthService.checkAuthStatus();
        setIsAuthenticated(authStatus.isAuthenticated);
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await googleAuthService.authenticate();
      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: "You are now logged in to Google.",
        variant: "default",
      });
    } catch (error) {
      console.error("Authentication failed:", error);
      toast({
        title: "Authentication Failed",
        description: "Could not authenticate with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = () => {
    setIsSaving(true);
    // Simulate saving to Google Docs and VAULT
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Document Saved",
        description: "Your document has been saved to Google Docs and VAULT.",
        variant: "default",
      });
    }, 1500);
  };

  const handleGenerateContent = () => {
    setIsGeneratingContent(true);
    // Simulate AI content generation
    setTimeout(() => {
      setIsGeneratingContent(false);
      toast({
        title: "Content Generated",
        description: "AI has generated content for your document.",
        variant: "default",
      });
    }, 2000);
  };

  const handleExportToPDF = () => {
    toast({
      title: "Exporting Document",
      description: "Your document is being exported as PDF/A for eCTD submission.",
      variant: "default",
    });
  };

  // Message type styling
  const getMessageStyles = (type) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <GoogleDocsIcon />
          <h1 className="text-xl font-semibold">AI-Powered Document Editor</h1>
          <Badge className="ml-2 bg-blue-600">Enterprise</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {!isAuthenticated ? (
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Google Docs
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportToPDF}
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF/A
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save to VAULT
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r bg-slate-50 p-4 flex flex-col">
          <div className="text-sm font-medium text-slate-500 mb-2">Document Info</div>
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Title</p>
                  <p className="text-sm font-medium">{docTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800">In Progress</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Modified</p>
                  <p className="text-xs">A moment ago</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">eCTD Completion</p>
                  <div className="flex items-center mt-1">
                    <Progress value={validationProgress} className="h-1.5 flex-1" />
                    <span className="text-xs ml-2">{validationProgress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm font-medium text-slate-500 mb-2">Workflow Actions</div>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Edit2 className="h-3.5 w-3.5 mr-2" />
              Edit Metadata
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <FileCheck className="h-3.5 w-3.5 mr-2" />
              Validate Document
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Copy className="h-3.5 w-3.5 mr-2" />
              Create Copy
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <LayoutTemplate className="h-3.5 w-3.5 mr-2" />
              Apply Template
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs mt-4" 
              onClick={handleGenerateContent}
              disabled={isGeneratingContent}
            >
              {isGeneratingContent ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  AI Generate
                </>
              )}
            </Button>
          </div>

          <div className="mt-auto pt-4">
            <div className="text-sm font-medium text-slate-500 mb-2">Validation Message</div>
            {validationMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`text-xs p-2 rounded border ${getMessageStyles(msg.type)} mb-2 flex items-start`}
              >
                <div className="mt-0.5 mr-1.5">{getMessageIcon(msg.type)}</div>
                <div>{msg.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {isAuthenticated ? (
            <div className="flex-1 bg-white p-6 flex flex-col">
              <div className="flex items-center mb-4 border-b pb-4">
                <div className="flex-1">
                  <div className="flex space-x-2 text-xs text-slate-500">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Insert</span>
                    <span>Format</span>
                    <span>Tools</span>
                    <span>Extensions</span>
                    <span>Help</span>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                </div>
              </div>

              <div className="flex-1 border rounded-md flex flex-col">
                <div className="bg-gray-50 px-4 py-2 flex items-center border-b">
                  <div className="flex-1 space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path><path d="M13 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path><line x1="8" y1="12" x2="13" y2="12"></line></svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>
                    </Button>
                    <span className="inline-block text-xs p-1">100%</span>
                    <select className="text-xs p-1 border rounded">
                      <option>Normal text</option>
                    </select>
                    <select className="text-xs p-1 border rounded">
                      <option>Arial</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  <h1 className="text-2xl font-bold mb-6">Module 2.5 Clinical Overview</h1>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In velit mauris, pharetra sociales eget. Eu facilisis eu sed varius integer. Pellentesque suspense se me. lentiae nec age crito sen. qui conuo matus odlapor so. vel posuer.
                  </p>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, lucios auue veguloque posuere sapien. Maglier onec vel labellen ami, lobortis torgue vel linus.
                  </p>
                  <p className="mb-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  AI Generate
                </Button>
                <Button variant="outline" size="sm">
                  AI Refine
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center max-w-md p-8">
                <GoogleDocsIcon className="mx-auto mb-4 h-16 w-16" />
                <h2 className="text-xl font-semibold mb-2">Connect to Google Docs</h2>
                <p className="text-slate-600 mb-6">
                  Integrate Google Docs to edit and collaborate on regulatory documents with real-time eCTD validation.
                </p>
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Google Docs
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}