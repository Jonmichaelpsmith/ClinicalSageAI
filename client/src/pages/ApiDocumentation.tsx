
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ChevronRight, Code, Database, FileJson, Braces, Key, Server, Plugin } from "lucide-react";
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
                  <Plugin className="h-4 w-4 mr-2" /> Integrations
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
