import React from 'react';
import { Layout } from '@/components/ui/layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Enterprise Document Vault Page
 * 
 * Showcase of DocuShare Enterprise document management system with
 * detailed use cases for Life Sciences and Biotech industries.
 */
export default function EnterpriseDocumentVault() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Enterprise Document Management Vault</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive 21 CFR Part 11 compliant document management for Life Sciences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              21 CFR Part 11 Compliant
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              GxP Validated
            </Badge>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">D</div>
                  DocuShare Enterprise
                </CardTitle>
                <CardDescription className="text-base">
                  Unified document management across all TrialSage modules
                </CardDescription>
              </div>
              <div>
                <Badge className="bg-purple-100 text-purple-800 px-3 py-1">Version 7.5</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">D</div>
                  <div>
                    <h3 className="font-medium">Document Repository</h3>
                    <p className="text-sm text-gray-600">Unified secure storage</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold text-xs">W</div>
                  <div>
                    <h3 className="font-medium">Automated Workflows</h3>
                    <p className="text-sm text-gray-600">Configurable approval chains</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-orange-600 rounded-md flex items-center justify-center text-white font-bold text-xs">R</div>
                  <div>
                    <h3 className="font-medium">Regulatory Compliance</h3>
                    <p className="text-sm text-gray-600">FDA, EMA, PMDA ready</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-indigo-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">M</div>
                  <div>
                    <h3 className="font-medium">Module Integration</h3>
                    <p className="text-sm text-gray-600">Seamless cross-module access</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-4">
              <h2 className="text-xl font-semibold mb-4">DocuShare Enterprise Features</h2>
              <div className="prose max-w-none">
                <p>
                  DocuShare Enterprise is a comprehensive document management system designed specifically for 
                  life sciences organizations. It provides a centralized repository for all regulatory, 
                  clinical, and quality documents with robust security, compliance, and workflow capabilities.
                </p>
                <h3 className="mt-4">Key Benefits</h3>
                <ul>
                  <li>Secure Document Repository with AES-256 encryption</li>
                  <li>21 CFR Part 11 Compliant electronic signatures</li>
                  <li>Configurable Workflows for document approval</li>
                  <li>Version Control with complete document history</li>
                  <li>Automatic Metadata Extraction for advanced search</li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-5 w-5 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">R</div>
                    Regulatory Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-green-100 text-green-800">FDA 21 CFR Part 11</Badge>
                      <div className="text-sm">
                        Electronic records and signatures compliance for FDA submissions
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-blue-100 text-blue-800">EMA Annex 11</Badge>
                      <div className="text-sm">
                        European Medicines Agency computerized system validation
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-purple-100 text-purple-800">ICH GCP</Badge>
                      <div className="text-sm">
                        Good Clinical Practice for clinical trial document management
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-5 w-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">S</div>
                    Security Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-blue-100 text-blue-800">ISO 27001</Badge>
                      <div className="text-sm">
                        Information security management system certification
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-red-100 text-red-800">SOC 2 Type II</Badge>
                      <div className="text-sm">
                        Service Organization Control reporting for security
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge className="mt-0.5 bg-green-100 text-green-800">GDPR</Badge>
                      <div className="text-sm">
                        General Data Protection Regulation compliance for EU data privacy
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border mt-6">
              <h3 className="text-lg font-medium mb-2">Validation Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">
                All DocuShare Enterprise deployments include comprehensive validation documentation to 
                support regulatory compliance and audit readiness.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="font-medium mb-1">Validation Master Plan (VMP)</h4>
                  <p className="text-xs text-gray-600">
                    Complete documentation of validation strategy
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="font-medium mb-1">Installation Qualification (IQ)</h4>
                  <p className="text-xs text-gray-600">
                    Verification of proper installation
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="font-medium mb-1">Operational Qualification (OQ)</h4>
                  <p className="text-xs text-gray-600">
                    Validation of system functionality
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}