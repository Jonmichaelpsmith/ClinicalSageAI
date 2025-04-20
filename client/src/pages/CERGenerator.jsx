import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Beaker, 
  FileText, 
  Upload, 
  CheckCircle, 
  Globe, 
  ArrowRight, 
  MessageSquare, 
  AlignLeft, 
  ArrowUpRight, 
  Bot,
  AlertCircle,
  ExternalLink,
  Database,
  BarChart,
  LineChart,
  FileDown,
  Activity,
  ServerCrash,
  Zap,
  Timer
} from 'lucide-react';

// CER Report Type Card Component
const ReportTypeCard = ({ title, description, icon, link, popular }) => (
  <Link to={link}>
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
      {popular && (
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs px-2 py-1 rounded-bl-md font-medium">
          POPULAR
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button className="text-rose-600 hover:text-rose-800 text-sm font-medium inline-flex items-center">
          Start Report Generation
          <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  </Link>
);

// AI Co-pilot Message Component
const CopilotMessage = ({ message, isUser = false }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2 max-w-[75%]`}>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

export default function CERGenerator() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showCopilot, setShowCopilot] = useState(false);

  // Sample report types for demonstration
  const reportTypes = [
    {
      id: 1,
      title: "FDA Clinical Evaluation Report",
      description: "Standardized CER template optimized for FDA submissions with integrated clinical data presentation.",
      icon: <FileText size={20} className="text-rose-500" />,
      link: "/cer-generator/fda",
      popular: true
    },
    {
      id: 2,
      title: "EMA Clinical Evaluation Report",
      description: "EU MDR compliant clinical evaluation report template with MEDDEV guidance integration.",
      icon: <Globe size={20} className="text-rose-500" />,
      link: "/cer-generator/ema",
      popular: false
    },
    {
      id: 3,
      title: "PMDA Clinical Evaluation Report",
      description: "Japanese regulatory authority compliant CER format with region-specific requirements.",
      icon: <FileText size={20} className="text-rose-500" />,
      link: "/cer-generator/pmda",
      popular: false
    },
    {
      id: 4,
      title: "Health Canada Clinical Report",
      description: "Clinical evaluation reporting tailored for Health Canada submissions and regulatory requirements.",
      icon: <FileText size={20} className="text-rose-500" />,
      link: "/cer-generator/health-canada",
      popular: false
    },
    {
      id: 5,
      title: "Custom CER Template",
      description: "Create a customized clinical evaluation report with your specific requirements and structure.",
      icon: <AlignLeft size={20} className="text-rose-500" />,
      link: "/cer-generator/custom",
      popular: false
    }
  ];
  
  // Sample recent reports for demonstration
  const recentReports = [
    {
      id: 1,
      title: "Oncology Drug X Safety Report",
      type: "FDA CER",
      date: "April 18, 2024",
      status: "Complete",
      link: "/cer-generator/report/1"
    },
    {
      id: 2,
      title: "Antibody Therapy Clinical Evaluation",
      type: "EMA CER",
      date: "April 15, 2024",
      status: "In Progress",
      link: "/cer-generator/report/2"
    },
    {
      id: 3,
      title: "Rare Disease Treatment Assessment",
      type: "FDA CER",
      date: "April 10, 2024",
      status: "Complete",
      link: "/cer-generator/report/3"
    }
  ];
  
  // Sample chat history with AI Copilot
  const copilotHistory = [
    { message: "Hello, I'm your TrialSage AI Industry Co-pilot. I can guide you through creating regulatory submissions and clinical evaluation reports. How can I assist you today?", isUser: false },
    { message: "I need to create a clinical evaluation report for an oncology drug.", isUser: true },
    { message: "Great! I'll help you with that. For an oncology drug CER, we should include comprehensive safety data analysis and efficacy outcomes. Would you like to start with FDA or EMA format?", isUser: false },
    { message: "FDA format, please.", isUser: true },
    { message: "Perfect choice. For FDA CERs, you'll need to include: 1) Executive Summary, 2) Clinical Background, 3) Safety Data Analysis, 4) Efficacy Results, 5) Benefit-Risk Assessment. Would you like me to help you set up the initial structure or do you have specific questions about any section?", isUser: false }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-rose-800 to-rose-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-rose-700 text-white mr-4">
              <Beaker size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">Clinical Evaluation Report (CER) Generator</h1>
          </div>
          <p className="text-rose-100 max-w-3xl">
            Generate comprehensive, regulation-compliant clinical evaluation reports with AI-powered 
            assistance and multi-region formatting to streamline your submission process.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CER Module Overview Section */}
        <div className="mb-10 bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="mr-2 text-rose-600" size={24} />
            How the CER Module Works
          </h2>
          <p className="text-gray-700 mb-6">
            The CER module turns raw post-market safety data into a regulator-ready Clinical Evaluation Report in minutes, with continuous analytics and PDF output. It is delivered as a micro-service inside the Concepts2Cures "TrialSage" platform and integrates seamlessly with IND automation, KPI dashboards, and user SSO.
          </p>
          
          {/* End-to-End Process Steps */}
          <div className="space-y-8 mb-8">
            {/* Step 1: Data Ingestion */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Ingestion & Normalization</h3>
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-700">Source</div>
                    <div className="font-medium text-gray-700">What we pull</div>
                    <div className="font-medium text-gray-700">Access layer</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                    <div>FDA FAERS</div>
                    <div>Drug adverse-event counts, patient demographics, outcomes</div>
                    <div className="text-gray-500 font-mono text-xs">/utils/faers_client.py (REST)</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                    <div>FDA MAUDE</div>
                    <div>Device complaints, device IDs, problem codes</div>
                    <div className="text-gray-500 font-mono text-xs">/utils/maude_client.py (batch XML)</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                    <div>EU EUDAMED</div>
                    <div>EU device vigilance</div>
                    <div className="text-gray-500 font-mono text-xs">/utils/eudamed_scraper.py</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div>PubMed / ClinicalTrials.gov</div>
                    <div>Literature abstracts, study outcomes for context</div>
                    <div className="text-gray-500 font-mono text-xs">/utils/pubmed_client.py</div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">Each client writes raw JSON into an ingest queue, then an ETL worker (Celery) normalizes fields to a common schema (DocEvent model): <span className="font-mono text-xs bg-gray-100 p-1 rounded">event_type | product_id | date | seriousness | age | sex | narrative</span></p>
              <p className="text-gray-600 mt-2">All data land in PostgreSQL + pgvector so the AI engine can embed and search narrative fields.</p>
            </div>
            
            {/* Step 2: Analytics & ML Layer */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Machine-Learning Layer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex">
                  <div className="mr-3 mt-1">
                    <LineChart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">Time-series Forecaster</div>
                    <div className="text-sm text-gray-600">ARIMA/Prophet forecasts for each event code (default 12 months)</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">predictive_analytics.py</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex">
                  <div className="mr-3 mt-1">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">Anomaly Detector</div>
                    <div className="text-sm text-gray-600">Rolling mean + 3σ flag for sudden spikes</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">detect_anomalies.py</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex">
                  <div className="mr-3 mt-1">
                    <BarChart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">Demographic Heat-map Generator</div>
                    <div className="text-sm text-gray-600">Aggregates counts by age-band × sex</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex">
                  <div className="mr-3 mt-1">
                    <Database className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">Embedding Index</div>
                    <div className="text-sm text-gray-600">Splits historical CERs & guidance docs into chunks → OpenAI text-embedding-3-small → pgvector</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">embed_documents.py</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3: Narrative Generation Service */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Narrative Generation Service</h3>
              <p className="text-gray-600 mb-3">FastAPI micro-service (cer_narrative.py) exposes three main endpoints:</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-700 pb-2">Endpoint</th>
                      <th className="text-left text-sm font-medium text-gray-700 pb-2">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 font-mono text-xs">GET /api/narrative/faers/{'{ndc}'}</td>
                      <td className="py-2 text-sm">Drug-only CER (FAERS + literature)</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">GET /api/narrative/device/{'{gmdn}'}</td>
                      <td className="py-2 text-sm">Device-only CER (MAUDE + EUDAMED)</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">POST /api/narrative/multi</td>
                      <td className="py-2 text-sm">Cross-product CER (multiple NDCs / device codes)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Prompt strategy</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-2">
                <li>System seed summarises ISO 14155 & MDCG guidance ("Write in third-person, include benefit-risk ratio …").</li>
                <li>Retrieval pulls the top-5 relevant chunks from the embedding index.</li>
                <li>Structured user-message passes:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Executive summary bullet points (from analytics)</li>
                    <li>Tables of top 5 events + counts</li>
                    <li>Forecast graph data (base-64 line chart)</li>
                  </ul>
                </li>
                <li>GPT-4-Turbo 128K returns 3-section draft:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Safety Trends & Signal Detection</li>
                    <li>Benefit-Risk Assessment (ISO 14971 language)</li>
                    <li>Corrective / Preventive Action recommendations</li>
                  </ul>
                </li>
              </ol>
            </div>
            
            {/* Step 4: PDF & DOCX Renderer */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">4</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF & DOCX Renderer</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start">
                <div className="mr-4 mt-1">
                  <FileDown className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-500 mb-2">/utils/pdf_renderer.py</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Uses ReportLab to lay out the GPT text, analytics charts, and boiler-plate headings</li>
                    <li>Stamps footer with date + auto-generated control number</li>
                    <li>Saves to <span className="font-mono text-xs">/mnt/data/cer_reports/{'{hash}'}.pdf</span></li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Step 5: Caching & Performance */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">5</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Caching & Performance</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Layer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">TTL</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Redis</td>
                      <td className="px-4 py-3 text-sm">1 hour</td>
                      <td className="px-4 py-3 text-sm">Stores narrative JSON & rendered PDF so repeated calls return &lt; 500 ms</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">In-memory fallback</td>
                      <td className="px-4 py-3 text-sm">15 min</td>
                      <td className="px-4 py-3 text-sm">Keeps dev environments running without Redis</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Step 6: API Surface */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">6</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">REST / GraphQL API Surface</h3>
              <div className="font-mono text-xs space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex">
                  <span className="w-20 text-rose-700">GET</span>
                  <span className="flex-1">/api/cer/metrics/{'{code}'}?since=2023-01-01   → JSON analytics blobs</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-rose-700">GET</span>
                  <span className="flex-1">/api/narrative/...                         → Markdown narrative</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-rose-700">GET</span>
                  <span className="flex-1">/api/narrative/.../pdf                     → Binary PDF</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-rose-700">POST</span>
                  <span className="flex-1">/api/cer/compare                           → Multi-product analytics + forecasts</span>
                </div>
              </div>
              <p className="text-gray-600 mt-3">All endpoints inherit JWT auth & RBAC scopes (cer:read, cer:write).</p>
            </div>
            
            {/* Step 7: React Front-End */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">7</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">React Front-End</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-rose-500" />
                    AdvancedDashboard.jsx
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Ten interactive charts (bar, line, heat-map, gauge) rendered with Plotly</li>
                    <li>Drill-down side panel shows raw case narratives</li>
                    <li>NLP query bar calls /api/cer/nlp-query (OpenAI function-calling) for "Show trends in patients &gt; 60"</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-rose-500" />
                    CERGenerator.jsx
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Tabbed UI for Drug / Device / Multi-source</li>
                    <li>"Generate PDF" button streams /pdf endpoint and auto-downloads</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-rose-500" />
                    Compliance Insights Dashboard
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Weekly push-to-Teams / email of new anomalies</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Step 8: Validation & QC */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">8</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Validation & QC</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-2">
                <li>PDF QC (pdf_qc.py) ensures every narrative PDF is searchable, PDF/A-1b, &lt; 10 MB, and bookmarked.</li>
                <li>Regulatory checklist stored in cer_checklist.json — gates "Release to client" until all ISO-/TR 20416 fields are present.</li>
                <li>Audit trail (DocEventHistory) logs every generation with user, model-version, and analytics snapshot (GxP compliant).</li>
              </ol>
            </div>
            
            {/* Step 9: User Flow Summary */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">9</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User Flow Summary</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mr-2">1</div>
                    <span>Select product(s) → Choose Drug NDC / Device code(s)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mr-2">2</div>
                    <span>(Optional) Set date window & demographic filter</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mr-2">3</div>
                    <span>Click "Generate CER"</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mr-2">4</div>
                    <span>&lt; 20 s later UI shows draft narrative + all analytics; user can download PDF or edit in Word</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mr-2">5</div>
                    <span>Sign-off → CER locked and revision stored; can be attached to IND module 5 or PMA supplement</span>
                  </li>
                </ol>
              </div>
            </div>
            
            {/* Step 10: Deployment & Ops */}
            <div className="relative pl-8 border-l-2 border-rose-200">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">10</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deployment & Ops</h3>
              <ul className="list-disc space-y-2 text-gray-600 ml-6">
                <li>Micro-service container (cer-service) behind API-gateway</li>
                <li>Horizontal scalable via Kubernetes HPA (CPU + queue length)</li>
                <li>Celery + Redis worker pool for long-running forecasts</li>
                <li>All PII is stripped; only de-identified FDA data stored</li>
                <li>SOC2 audit logs routed to ELK</li>
              </ul>
            </div>
          </div>
          
          {/* Key Value */}
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg p-6 mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="mr-2 text-rose-500" />
              Key Value to Clients
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center mr-3">
                  <Timer size={12} />
                </div>
                <span className="text-gray-700">Days → Minutes to produce regulator-grade CERs</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center mr-3">
                  <CheckCircle size={12} />
                </div>
                <span className="text-gray-700">Eliminates manual Excel pivot-tables and Word templating</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center mr-3">
                  <Activity size={12} />
                </div>
                <span className="text-gray-700">Continuous safety surveillance with ML-based anomaly alerts</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center mr-3">
                  <Globe size={12} />
                </div>
                <span className="text-gray-700">Harmonised output that matches FDA, EU MDR Annex II, and ISO 14155 expectations</span>
              </li>
            </ul>
            <div className="mt-6 text-gray-700">
              <p className="font-medium">The module is GA-ready, validated, and already plumbed into the broader IND/eCTD workflow so clients can drop a CER PDF straight into Module 5 of their next sequence.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="inline-flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow transition-colors">
              Try CER Generator Now
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
        
        {/* AI Industry Co-pilot Button - Fixed in bottom corner */}
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => setShowCopilot(!showCopilot)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Bot size={24} />
          </button>
        </div>
        
        {/* AI Industry Co-pilot Panel */}
        {showCopilot && (
          <div className="fixed bottom-24 right-6 w-96 h-[70vh] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bot size={20} className="text-white mr-2" />
                <h3 className="text-white font-medium">AI Industry Co-pilot</h3>
              </div>
              <button onClick={() => setShowCopilot(false)} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {copilotHistory.map((msg, index) => (
                <CopilotMessage key={index} message={msg.message} isUser={msg.isUser} />
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask about CER requirements or IND submissions..." 
                  className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white rounded-r-md px-4 py-2 hover:bg-blue-700">
                  <MessageSquare size={16} />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                AI co-pilot can guide you through regulatory submissions, CER creation, and compliance requirements
              </div>
            </div>
          </div>
        )}
        
        {/* Key features section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">AI Industry Co-pilot</h3>
              </div>
              <p className="text-gray-600">Get intelligent guidance through IND submissions and CER report building with contextual recommendations.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                  <Globe className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Multi-Region Compliance</h3>
              </div>
              <p className="text-gray-600">Generate reports that meet FDA, EMA, PMDA, and Health Canada regulatory requirements with region-specific validation.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                  <ArrowUpRight className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Real-time Intelligence</h3>
              </div>
              <p className="text-gray-600">Access insights from thousands of clinical study reports to optimize your approach and anticipate reviewer questions.</p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('templates')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } mr-8`}
            >
              <FileText size={16} className="mr-2" />
              CER Templates
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } mr-8`}
            >
              <CheckCircle size={16} className="mr-2" />
              Recent Reports
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload size={16} className="mr-2" />
              Upload Data
            </button>
          </nav>
        </div>
        
        {/* Content Section */}
        <div className="mb-12">
          {activeTab === 'templates' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Available CER Templates</h2>
                <div className="text-sm text-gray-500">Showing {reportTypes.length} templates</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportTypes.map(report => (
                  <ReportTypeCard key={report.id} {...report} />
                ))}
              </div>
            </>
          )}
          
          {activeTab === 'recent' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Recently Generated Reports</h2>
                <div className="text-sm text-gray-500">Showing {recentReports.length} reports</div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'Complete' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link to={report.link}>
                              <button className="text-rose-600 hover:text-rose-900 mr-3">View</button>
                            </Link>
                            <button className="text-blue-600 hover:text-blue-900">Download</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'upload' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Upload Clinical Data for Report Generation</h2>
                <p className="text-gray-600 mb-4">
                  Upload your clinical data files to generate a comprehensive clinical evaluation report. Our AI-powered system will analyze your data and create a structured report based on regulatory requirements.
                </p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
                    <p className="text-gray-500 text-sm mb-4">Supported formats: CSV, XLSX, JSON, XML</p>
                    <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md">
                      Browse Files
                    </button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <AlertCircle className="text-yellow-500 mr-2" size={16} />
                    <p className="text-sm text-yellow-700">
                      Uploaded data is processed securely and in compliance with privacy regulations. See our 
                      <a href="/privacy" className="text-yellow-800 underline ml-1">privacy policy</a> for details.
                    </p>
                  </div>
                  
                  <h3 className="text-md font-medium text-gray-900 mb-3">Additional Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input 
                        id="auto-analyze" 
                        type="checkbox" 
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded" 
                      />
                      <label htmlFor="auto-analyze" className="ml-2 block text-sm text-gray-700">
                        Automatically analyze data and suggest report structure
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        id="detect-outliers" 
                        type="checkbox" 
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded" 
                      />
                      <label htmlFor="detect-outliers" className="ml-2 block text-sm text-gray-700">
                        Detect statistical outliers and anomalies
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        id="compare-standards" 
                        type="checkbox" 
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded" 
                      />
                      <label htmlFor="compare-standards" className="ml-2 block text-sm text-gray-700">
                        Compare against industry standards and benchmarks
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Integration notice */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Looking for a Broader Solution?</h3>
              <p className="text-gray-600">
                CER Generator seamlessly integrates with our complete IND Full Solution and Submission Builder for end-to-end regulatory management.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link to="/ind-full-solution">
                <button className="inline-flex items-center px-4 py-2 border border-rose-600 text-rose-600 bg-white hover:bg-rose-50 rounded text-sm whitespace-nowrap">
                  IND Full Solution
                  <ExternalLink size={14} className="ml-1" />
                </button>
              </Link>
              <Link to="/builder">
                <button className="inline-flex items-center px-4 py-2 border border-rose-600 text-rose-600 bg-white hover:bg-rose-50 rounded text-sm whitespace-nowrap">
                  Submission Builder
                  <ExternalLink size={14} className="ml-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}