import React from 'react';
import { Layout } from '@/components/ui/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnterpriseDocuShareVault from '@/components/enterprise/EnterpriseDocuShareVault';
import { 
  Library, 
  ShieldCheck, 
  Calendar,
  FileCheck,
  BookOpen,
  Network,
  ArrowRight,
  Lock,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

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
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>21 CFR Part 11 Compliant</span>
              </div>
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              <div className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                <span>GxP Validated</span>
              </div>
            </Badge>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Library className="h-6 w-6 text-indigo-600" />
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
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Document Repository</h3>
                    <p className="text-sm text-gray-600">Unified secure storage</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-medium">Automated Workflows</h3>
                    <p className="text-sm text-gray-600">Configurable approval chains</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-medium">Regulatory Compliance</h3>
                    <p className="text-sm text-gray-600">FDA, EMA, PMDA ready</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-indigo-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Network className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="font-medium">Module Integration</h3>
                    <p className="text-sm text-gray-600">Seamless cross-module access</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="about" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>About DocuShare</span>
                </TabsTrigger>
                <TabsTrigger value="certifications" className="flex items-center gap-1">
                  <FileCheck className="h-4 w-4" />
                  <span>Certifications & Compliance</span>
                </TabsTrigger>
                <TabsTrigger value="lifesciences" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Life Sciences Applications</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    DocuShare Enterprise is a comprehensive document management system designed specifically for 
                    life sciences organizations. It provides a centralized repository for all regulatory, 
                    clinical, and quality documents with robust security, compliance, and workflow capabilities.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Key Features</h3>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          <div>
                            <span className="font-medium">Secure Document Repository</span> with AES-256 encryption and multi-factor authentication
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          <div>
                            <span className="font-medium">21 CFR Part 11 Compliant</span> electronic signatures and audit trails
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          <div>
                            <span className="font-medium">Configurable Workflows</span> for document review, approval, and publishing
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          <div>
                            <span className="font-medium">Version Control</span> with complete document history and comparison
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          <div>
                            <span className="font-medium">Automatic Metadata Extraction</span> for advanced search and classification
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Enterprise Benefits</h3>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">→</div>
                          <div>
                            <span className="font-medium">Reduce Regulatory Risk</span> with validated systems and compliant processes
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">→</div>
                          <div>
                            <span className="font-medium">Accelerate Submission Timelines</span> with automated document preparation
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">→</div>
                          <div>
                            <span className="font-medium">Enhance Collaboration</span> across departments and external partners
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">→</div>
                          <div>
                            <span className="font-medium">Improve Document Quality</span> with standardized templates and validation
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">→</div>
                          <div>
                            <span className="font-medium">Ensure Global Compliance</span> with region-specific document controls
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="certifications">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    DocuShare Enterprise maintains the highest level of regulatory compliance and security 
                    certifications to meet the strict requirements of life sciences and biotechnology industries.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-indigo-600" />
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
                          <li className="flex items-start gap-3">
                            <Badge className="mt-0.5 bg-teal-100 text-teal-800">GxP</Badge>
                            <div className="text-sm">
                              Good Practice guidelines for manufacturing, laboratory, and clinical processes
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Badge className="mt-0.5 bg-orange-100 text-orange-800">HIPAA</Badge>
                            <div className="text-sm">
                              Health Insurance Portability and Accountability Act compliance
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lock className="h-5 w-5 text-indigo-600" />
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
                              Service Organization Control reporting for security, availability, and confidentiality
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Badge className="mt-0.5 bg-green-100 text-green-800">GDPR</Badge>
                            <div className="text-sm">
                              General Data Protection Regulation compliance for EU data privacy
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Badge className="mt-0.5 bg-indigo-100 text-indigo-800">NIST 800-53</Badge>
                            <div className="text-sm">
                              National Institute of Standards and Technology security controls
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Badge className="mt-0.5 bg-yellow-100 text-yellow-800">CSA STAR</Badge>
                            <div className="text-sm">
                              Cloud Security Alliance Security, Trust & Assurance Registry
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
                      support regulatory compliance and audit readiness:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Validation Master Plan (VMP)</h4>
                        <p className="text-xs text-gray-600">
                          Complete documentation of validation strategy, scope, and approach
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Installation Qualification (IQ)</h4>
                        <p className="text-xs text-gray-600">
                          Verification of proper installation in the target environment
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Operational Qualification (OQ)</h4>
                        <p className="text-xs text-gray-600">
                          Validation of system functionality against requirements
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Performance Qualification (PQ)</h4>
                        <p className="text-xs text-gray-600">
                          Verification of system performance in production environment
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Traceability Matrix</h4>
                        <p className="text-xs text-gray-600">
                          Mapping of requirements to test cases and validation evidence
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <h4 className="font-medium mb-1">Validation Summary Report</h4>
                        <p className="text-xs text-gray-600">
                          Comprehensive summary of validation activities and results
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="lifesciences">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    DocuShare Enterprise is specifically designed to address the unique document management 
                    challenges faced by life sciences and biotechnology organizations throughout the entire 
                    product lifecycle.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Pharmaceutical Applications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Regulatory Submissions</h4>
                          <p className="text-sm text-gray-600">
                            Streamlined IND, NDA, ANDA, and global regulatory submission document preparation, 
                            review, and publishing with eCTD integration.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Clinical Trial Management</h4>
                          <p className="text-sm text-gray-600">
                            Centralized management of protocols, investigator brochures, case report forms, 
                            and clinical study reports with site-specific access controls.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Quality Management</h4>
                          <p className="text-sm text-gray-600">
                            Comprehensive document control for SOPs, batch records, validation protocols, 
                            and quality management system documentation.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Manufacturing Documentation</h4>
                          <p className="text-sm text-gray-600">
                            Secure management of master batch records, specifications, analytical methods, 
                            and process validation documentation.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Biotech Applications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Research & Development</h4>
                          <p className="text-sm text-gray-600">
                            Comprehensive management of research protocols, lab notebooks, experimental data, 
                            and intellectual property documentation.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Pre-clinical Studies</h4>
                          <p className="text-sm text-gray-600">
                            Secure storage and management of toxicology reports, pharmacokinetic studies, 
                            and animal study documentation with audit trails.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Technology Transfer</h4>
                          <p className="text-sm text-gray-600">
                            Controlled sharing of manufacturing processes, analytical methods, and critical 
                            quality attributes with partners and contract manufacturers.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-1">Regulatory Strategy</h4>
                          <p className="text-sm text-gray-600">
                            Management of regulatory correspondence, meeting minutes, and strategic documentation 
                            for accelerated approval pathways.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium mb-3">Industry Success Stories</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Global Pharmaceutical Company</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Implemented DocuShare Enterprise to manage 250,000+ regulatory documents across 30 markets, 
                          reducing submission preparation time by 40% and achieving 100% compliance in FDA and EMA audits.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Emerging Biotechnology Startup</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Deployed DocuShare Enterprise to support their first IND submission with limited regulatory 
                          resources, enabling successful submission preparation in 30% less time than industry average.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Contract Research Organization (CRO)</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Leveraged DocuShare Enterprise to standardize document management across 100+ sponsor companies, 
                          reducing document-related queries by 65% and improving audit readiness.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* The main component with all the detailed demos */}
        <EnterpriseDocuShareVault />
      </div>
    </Layout>
  );
}