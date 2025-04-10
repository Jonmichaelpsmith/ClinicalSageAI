
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ChevronRight, Code, Database, FileJson, Braces, Key, Server, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocumentation() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string, language: string, id: string }) => (
    <div className="relative">
      <pre className={`language-${language} rounded-md bg-slate-900 p-4 overflow-x-auto text-sm text-slate-50`}>
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 h-8 w-8 p-0 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
        onClick={() => copyToClipboard(code, id)}
      >
        {copied === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          name: "Generate API Key",
          method: "POST",
          endpoint: "/api/v1/auth/keys",
          description: "Create a new API key for programmatic access to TrialSage",
          parameters: [
            { name: "name", type: "string", required: true, description: "Descriptive name for the API key" },
            { name: "expires_in", type: "number", required: false, description: "Expiration time in days (default: 365)" }
          ],
          response: {
            code: `{
  "key_id": "ts_key_123456789",
  "key": "ts_secret_abcdefghijklmnopqrstuvwxyz",
  "created_at": "2025-04-10T15:30:00Z",
  "expires_at": "2026-04-10T15:30:00Z"
}`,
            language: "json"
          },
          codeExamples: {
            curl: `curl -X POST https://api.trialsage.com/v1/auth/keys \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Development API Key",
    "expires_in": 30
  }'`,
            node: `const axios = require('axios');

const createApiKey = async () => {
  const response = await axios.post(
    'https://api.trialsage.com/v1/auth/keys',
    {
      name: 'Development API Key',
      expires_in: 30
    },
    {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log(response.data);
};

createApiKey();`
          }
        }
      ]
    },
    {
      category: "Reports",
      items: [
        {
          name: "List Reports",
          method: "GET",
          endpoint: "/api/v1/reports",
          description: "Retrieve a paginated list of available clinical study reports",
          parameters: [
            { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
            { name: "limit", type: "number", required: false, description: "Results per page (default: 20, max: 100)" },
            { name: "sponsor", type: "string", required: false, description: "Filter by sponsor name" },
            { name: "indication", type: "string", required: false, description: "Filter by indication" },
            { name: "phase", type: "string", required: false, description: "Filter by trial phase" }
          ],
          response: {
            code: `{
  "total": 342,
  "page": 1,
  "limit": 20,
  "reports": [
    {
      "id": "rep_12345",
      "title": "A Phase 3 Study of Drug X in Advanced Cancer",
      "sponsor": "Acme Pharma",
      "indication": "Oncology",
      "phase": "Phase 3",
      "status": "Completed",
      "date": "2024-01-15",
      "nctrial_id": "NCT01234567"
    },
    // Additional reports...
  ]
}`,
            language: "json"
          },
          codeExamples: {
            curl: `curl -X GET "https://api.trialsage.com/v1/reports?page=1&limit=20&indication=Oncology" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            node: `const axios = require('axios');

const getReports = async () => {
  const response = await axios.get(
    'https://api.trialsage.com/v1/reports',
    {
      params: {
        page: 1,
        limit: 20,
        indication: 'Oncology'
      },
      headers: {
        Authorization: 'Bearer YOUR_API_KEY'
      }
    }
  );
  
  console.log(response.data);
};

getReports();`
          }
        },
        {
          name: "Get Report Details",
          method: "GET",
          endpoint: "/api/v1/reports/:id",
          description: "Retrieve detailed information about a specific clinical study report",
          parameters: [
            { name: "id", type: "string", required: true, description: "The unique identifier for the report" }
          ],
          response: {
            code: `{
  "id": "rep_12345",
  "title": "A Phase 3 Study of Drug X in Advanced Cancer",
  "sponsor": "Acme Pharma",
  "indication": "Oncology",
  "phase": "Phase 3",
  "status": "Completed",
  "date": "2024-01-15",
  "nctrial_id": "NCT01234567",
  "summary": "This study evaluated the efficacy and safety of Drug X...",
  "endpoints": [
    {
      "type": "primary",
      "name": "Overall Survival",
      "description": "Time from randomization to death from any cause",
      "result": "Median OS: 18.4 months vs 12.1 months (HR=0.72, p=0.001)"
    },
    // Additional endpoints...
  ],
  "population": {
    "total_enrolled": 432,
    "demographics": {
      "median_age": 65,
      "gender_ratio": "58% male, 42% female",
      // Additional demographic data...
    },
    "inclusion_criteria": [
      "Adults aged ≥18 years",
      "ECOG performance status 0-1",
      // Additional criteria...
    ],
    "exclusion_criteria": [
      // Exclusion criteria...
    ]
  },
  "safety_profile": {
    "serious_adverse_events": 24,
    "treatment_discontinuations": 15,
    "common_adverse_events": [
      {"name": "Fatigue", "incidence": "32%"},
      // Additional adverse events...
    ]
  }
}`,
            language: "json"
          },
          codeExamples: {
            curl: `curl -X GET https://api.trialsage.com/v1/reports/rep_12345 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            node: `const axios = require('axios');

const getReportDetails = async (reportId) => {
  const response = await axios.get(
    \`https://api.trialsage.com/v1/reports/\${reportId}\`,
    {
      headers: {
        Authorization: 'Bearer YOUR_API_KEY'
      }
    }
  );
  
  console.log(response.data);
};

getReportDetails('rep_12345');`
          }
        }
      ]
    },
    {
      category: "Analytics",
      items: [
        {
          name: "Generate Trial Design Recommendations",
          method: "POST",
          endpoint: "/api/v1/analytics/trial-design",
          description: "Generate trial design recommendations based on your parameters and historical data",
          parameters: [
            { name: "indication", type: "string", required: true, description: "Target indication for the trial" },
            { name: "phase", type: "string", required: true, description: "Planned trial phase" },
            { name: "mechanism", type: "string", required: false, description: "Drug mechanism of action" },
            { name: "population", type: "object", required: false, description: "Target patient population details" }
          ],
          response: {
            code: `{
  "recommendations": {
    "design_patterns": [
      {
        "design": "Randomized, Double-Blind, Placebo-Controlled",
        "frequency": "28/42",
        "recommendation": "Consider a Randomized, Double-Blind, Placebo-Controlled design, which was used in 28 similar trials."
      },
      // Additional design patterns...
    ],
    "endpoints": [
      {
        "name": "Progression-Free Survival",
        "type": "primary",
        "frequency": "76%",
        "description": "Time from randomization to disease progression or death"
      },
      // Additional endpoints...
    ],
    "sample_size": {
      "recommended": 320,
      "range": [280, 360],
      "confidence": "high",
      "rationale": "Based on effect sizes observed in similar trials"
    },
    "duration": {
      "recommended": 18,
      "unit": "months",
      "range": [16, 24],
      "enrollment_rate": "20 patients/month"
    },
    "inclusion_criteria": [
      // Recommended inclusion criteria...
    ],
    "exclusion_criteria": [
      // Recommended exclusion criteria...
    ]
  }
}`,
            language: "json"
          },
          codeExamples: {
            curl: `curl -X POST https://api.trialsage.com/v1/analytics/trial-design \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "indication": "Non-Small Cell Lung Cancer",
    "phase": "Phase 2",
    "mechanism": "PD-1 Inhibitor",
    "population": {
      "min_age": 18,
      "ecog_status": "0-1",
      "prior_therapy": true
    }
  }'`,
            node: `const axios = require('axios');

const generateTrialDesign = async () => {
  const response = await axios.post(
    'https://api.trialsage.com/v1/analytics/trial-design',
    {
      indication: 'Non-Small Cell Lung Cancer',
      phase: 'Phase 2',
      mechanism: 'PD-1 Inhibitor',
      population: {
        min_age: 18,
        ecog_status: '0-1',
        prior_therapy: true
      }
    },
    {
      headers: {
        Authorization: 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log(response.data);
};

generateTrialDesign();`
          }
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-8 rounded-lg border border-slate-200">
        <h1 className="text-3xl font-bold mb-4">TrialSage API</h1>
        <p className="text-slate-600 max-w-3xl text-lg mb-6">
          Our comprehensive REST API allows you to programmatically access TrialSage's clinical trial intelligence platform.
          Integrate CSR data and analysis capabilities directly into your applications and workflows.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="gap-2">
            <Key className="h-4 w-4" /> Get API Key
          </Button>
          <Button variant="outline" className="gap-2">
            <FileJson className="h-4 w-4" /> API Reference
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-20">
            <h3 className="text-lg font-semibold mb-4">API Resources</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Server className="h-4 w-4 mr-2" /> Getting Started
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Key className="h-4 w-4 mr-2" /> Authentication
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Database className="h-4 w-4 mr-2" /> Reports
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Code className="h-4 w-4 mr-2" /> Analytics
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Braces className="h-4 w-4 mr-2" /> Protocols
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <Puzzle className="h-4 w-4 mr-2" /> Integrations
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <ChevronRight className="h-4 w-4 mr-2" /> Rate Limits
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-slate-800">
                  <ChevronRight className="h-4 w-4 mr-2" /> Error Handling
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
          <section id="getting-started" className="space-y-6">
            <h2 className="text-2xl font-bold">Getting Started</h2>
            <p className="text-slate-600">
              The TrialSage API provides programmatic access to clinical study report data and analytics. 
              To use the API, you'll need to sign up for a TrialSage account and generate an API key.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
                <CardDescription>All API requests should be made to the following base URL:</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock 
                  code="https://api.trialsage.com/v1/" 
                  language="bash" 
                  id="base-url" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  TrialSage uses API keys to authenticate requests. Include your API key in the Authorization header of each request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock 
                  code='Authorization: Bearer YOUR_API_KEY' 
                  language="bash" 
                  id="auth-header" 
                />
              </CardContent>
            </Card>
          </section>

          {endpoints.map((category, categoryIndex) => (
            <section key={categoryIndex} id={category.category.toLowerCase()} className="space-y-6">
              <h2 className="text-2xl font-bold">{category.category}</h2>
              
              {category.items.map((endpoint, endpointIndex) => (
                <Card key={endpointIndex} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded font-mono
                            ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' : 
                              endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'}`
                          }>
                            {endpoint.method}
                          </span>
                          <span className="text-lg">{endpoint.name}</span>
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-2">{endpoint.endpoint}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 mb-6">{endpoint.description}</p>
                    
                    {endpoint.parameters.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50">
                                <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold">Name</th>
                                <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold">Type</th>
                                <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold">Required</th>
                                <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex} className={paramIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                  <td className="border border-slate-200 px-4 py-2 text-sm font-mono">{param.name}</td>
                                  <td className="border border-slate-200 px-4 py-2 text-sm">{param.type}</td>
                                  <td className="border border-slate-200 px-4 py-2 text-sm">
                                    {param.required ? (
                                      <span className="text-red-500">Yes</span>
                                    ) : (
                                      <span className="text-slate-500">No</span>
                                    )}
                                  </td>
                                  <td className="border border-slate-200 px-4 py-2 text-sm">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Response</h4>
                      <CodeBlock 
                        code={endpoint.response.code} 
                        language={endpoint.response.language} 
                        id={`response-${categoryIndex}-${endpointIndex}`} 
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Code Examples</h4>
                      <Tabs defaultValue="curl">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="node">Node.js</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                          <CodeBlock 
                            code={endpoint.codeExamples.curl} 
                            language="bash" 
                            id={`curl-${categoryIndex}-${endpointIndex}`} 
                          />
                        </TabsContent>
                        <TabsContent value="node">
                          <CodeBlock 
                            code={endpoint.codeExamples.node} 
                            language="javascript" 
                            id={`node-${categoryIndex}-${endpointIndex}`} 
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          ))}

          <section id="rate-limits" className="space-y-6">
            <h2 className="text-2xl font-bold">Rate Limits</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  To ensure fair usage, the TrialSage API implements rate limiting. Limits vary by plan:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Free Plan:</strong> 60 requests per hour</li>
                  <li><strong>Pro Plan:</strong> 600 requests per hour</li>
                  <li><strong>Enterprise Plan:</strong> Custom limits based on needs</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Rate limit information is included in the response headers:
                </p>
                <CodeBlock 
                  code={`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 598
X-RateLimit-Reset: 1617974400`} 
                  language="text" 
                  id="rate-limit-headers" 
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Need help with integration?</h2>
          <p className="text-slate-600 mb-6">
            Our developer support team is ready to help you implement TrialSage into your workflow.
            Enterprise customers receive priority integration support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="gap-2">
              <Code className="h-4 w-4" /> Get API Key
            </Button>
            <Button variant="outline" className="gap-2">
              Contact Developer Support
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from "react";
import { Server, Key, Database, Code, Braces, Copy, ExternalLink, FileJson, Check } from "lucide-react";

import { PageContainer, HeaderSection, ContentSection } from "@/components/layout";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocumentation() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied to your clipboard",
    });
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Navbar />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4 py-8 md:py-12">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary px-3 py-1">
              Developer Resources
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              TrialSage API Documentation
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Integrate TrialSage data and insights directly into your applications
            </p>
          </div>
        </div>
      </HeaderSection>
      
      <ContentSection>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="sticky top-20">
                <h3 className="text-lg font-semibold mb-4">API Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      <Server className="h-4 w-4 mr-2" /> Getting Started
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      <Key className="h-4 w-4 mr-2" /> Authentication
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      <Database className="h-4 w-4 mr-2" /> Reports
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      <Code className="h-4 w-4 mr-2" /> Analytics
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      <Braces className="h-4 w-4 mr-2" /> Protocols
                    </Button>
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-8 mb-4">SDKs & Libraries</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      JavaScript
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      Python
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-slate-800 dark:text-slate-200">
                      R
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Getting Started</h2>
                <p>
                  The TrialSage API provides programmatic access to clinical study report data, analytics, and insights. 
                  This guide will help you get started with integrating TrialSage into your applications.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-sm flex justify-between items-center">
                    <code>https://api.trialsage.com/v1</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("https://api.trialsage.com/v1")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Authentication</h2>
                <p>
                  All API requests must be authenticated using an API key. You can generate an API key in your 
                  TrialSage dashboard under Account Settings > API Keys.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">API Key Authentication</h3>
                  <p className="mb-3">
                    Include your API key in the Authorization header of all requests:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-sm flex justify-between items-center">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg">
                  <h4 className="font-semibold">Security Note</h4>
                  <p className="text-sm mt-1">
                    Keep your API key secure and never expose it in client-side code. Use server-side code to make API requests.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Example Requests</h2>
                
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript" className="mt-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md font-mono text-sm">
                      <pre>{`const fetchReports = async () => {
  const response = await fetch('https://api.trialsage.com/v1/reports?indication=oncology&phase=2', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};`}</pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => copyToClipboard(`const fetchReports = async () => {
  const response = await fetch('https://api.trialsage.com/v1/reports?indication=oncology&phase=2', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};`)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </TabsContent>
                  <TabsContent value="python" className="mt-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md font-mono text-sm">
                      <pre>{`import requests

def fetch_reports():
    headers = {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://api.trialsage.com/v1/reports',
        params={'indication': 'oncology', 'phase': '2'},
        headers=headers
    )
    
    return response.json()`}</pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => copyToClipboard(`import requests

def fetch_reports():
    headers = {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://api.trialsage.com/v1/reports',
        params={'indication': 'oncology', 'phase': '2'},
        headers=headers
    )
    
    return response.json()`)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </TabsContent>
                  <TabsContent value="curl" className="mt-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md font-mono text-sm">
                      <pre>{`curl -X GET \\
  'https://api.trialsage.com/v1/reports?indication=oncology&phase=2' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`}</pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => copyToClipboard(`curl -X GET \\
  'https://api.trialsage.com/v1/reports?indication=oncology&phase=2' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">API Endpoints</h2>
                
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>Access clinical study reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> GET /reports
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        List available clinical study reports with filtering options
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>GET /reports?indication=diabetes&phase=3&limit=10</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> GET /reports/{"{id}"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Get detailed information about a specific report
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>GET /reports/12345</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> GET /reports/search
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Search for reports by keyword across all fields
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>GET /reports/search?q=biomarker%20response</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Generate insights and statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> GET /analytics/endpoints
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Get endpoint usage statistics by indication
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>GET /analytics/endpoints?indication=oncology</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> GET /analytics/statistics
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Get statistical parameters for similar trials
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>GET /analytics/statistics?indication=alzheimer&phase=2</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle>Protocols</CardTitle>
                    <CardDescription>Protocol generation and optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> POST /protocols/generate
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Generate a protocol template based on study parameters
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>POST /protocols/generate
{
  "indication": "type 2 diabetes",
  "phase": "2",
  "population": "adults",
  "primaryEndpoint": "HbA1c reduction"
}</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center text-primary">
                        <FileJson className="h-4 w-4 mr-2" /> POST /protocols/optimize
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Optimize an existing protocol with recommendations
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <code>POST /protocols/optimize
{
  "protocolSummary": "Phase 2 study of Drug X in adult patients with type 2 diabetes...",
  "optimizationTargets": ["statistical_power", "inclusion_criteria", "endpoints"]
}</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Rate Limits</h2>
                <p>
                  The TrialSage API has the following rate limits:
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Free tier: 100 requests per day</li>
                  <li>Pro tier: 10,000 requests per day</li>
                  <li>Enterprise tier: Custom limits based on your needs</li>
                </ul>
                
                <p className="text-sm text-muted-foreground">
                  Rate limit information is included in the response headers:
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-xs">
                  <code>X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9990
X-RateLimit-Reset: 1619712000</code>
                </div>
              </div>
              
              <div className="mt-8">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle>Need help with integration?</CardTitle>
                    <CardDescription>Our developer team is available to assist with your implementation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Schedule a call with our API specialists to get personalized help with your integration
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button>Contact Developer Support</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </PageContainer>
  );
}
