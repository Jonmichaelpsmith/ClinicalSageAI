import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText, 
  PieChart, 
  LineChart, 
  BookOpen, 
  FileCheck, 
  Clipboard,
  Users, 
  ExternalLink, 
  Eye, 
  BrainCircuit,
  Lightbulb,
  ChevronRight,
  Beaker,
  Search,
  ArrowRight,
  CheckCircle,
  Rocket,
  Clock,
  BarChart,
  ClipboardCheck,
  Building,
  Database,
  CalendarCheck,
  Filter,
  Target,
  Shield,
  ThumbsUp,
  Download
} from 'lucide-react';

// Calculator icon component (for statistical features)
const Calculator = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="8" x2="8" y1="12" y2="12" />
    <line x1="12" x2="12" y1="12" y2="12" />
    <line x1="16" x2="16" y1="12" y2="12" />
    <line x1="8" x2="8" y1="16" y2="16" />
    <line x1="12" x2="12" y1="16" y2="16" />
    <line x1="16" x2="16" y1="16" y2="16" />
  </svg>
);

/**
 * Platform Showcase Component
 * 
 * A clean, organized showcase of platform features and capabilities
 * with role-based solutions, example reports, and interactive demos.
 */
const PlatformShowcase = () => {
  const [activeTab, setActiveTab] = useState('features');
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Fetch recent reports from the API
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab === 'reports') {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/reports/recent?limit=4');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.status}`);
          }
          
          const data = await response.json();
          setRecentReports(data.reports || []);
        } catch (err) {
          console.error('Error fetching reports:', err);
          setError('Failed to load sample reports. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchReports();
  }, [activeTab]);
  
  // Key platform features organized by category
  const platformFeatures = [
    {
      id: "csr-intelligence",
      title: "CSR Intelligence",
      description: "Extract, search, and analyze data from 3,000+ clinical study reports",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      capabilities: [
        "Structured data extraction from CSRs",
        "Cross-study pattern identification",
        "Protocol design optimization",
        "Eligibility criteria benchmarking"
      ],
      keyTools: [
        {
          name: "CSR Search Engine",
          description: "Search across 3,000+ structured CSR documents",
          icon: <Search />
        },
        {
          name: "Protocol Analyzer",
          description: "Compare your protocol to successful historical trials",
          icon: <FileCheck />
        },
        {
          name: "Endpoint Library",
          description: "Review and select optimal endpoints with historical validation",
          icon: <Target />
        }
      ],
      demoPath: "/csr-insights",
      fullPath: "/csr-insights",
      documentPath: "/assets/docs/CSR_Intelligence_Guide.pdf"
    },
    {
      id: "cer-generator",
      title: "CER Generator",
      description: "Create comprehensive Clinical Evaluation Reports with FDA FAERS data",
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      capabilities: [
        "Automated CER generation from FAERS data",
        "MEDDEV 2.7/1 Rev. 4 compliant narratives",
        "Integration of multiple regulatory sources",
        "Interactive data visualization"
      ],
      keyTools: [
        {
          name: "FAERS Data Integration",
          description: "Connect to FDA Adverse Event Reporting System",
          icon: <Database />
        },
        {
          name: "CER Dashboard",
          description: "Interactive visualizations of safety data",
          icon: <BarChart />
        },
        {
          name: "PDF Generator",
          description: "Create submission-ready documentation",
          icon: <FileText />
        }
      ],
      demoPath: "/cer-dashboard",
      fullPath: "/cer-dashboard",
      documentPath: "/assets/docs/CER_Generator_Guide.pdf"
    },
    {
      id: "protocol-design",
      title: "Protocol Designer",
      description: "AI-powered tools for optimizing clinical trial protocols",
      icon: <Beaker className="h-6 w-6" />,
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      capabilities: [
        "Evidence-based protocol optimization",
        "Enrollment feasibility analysis",
        "Patient journey modeling",
        "Inclusion/exclusion criteria development"
      ],
      keyTools: [
        {
          name: "Study Design Oracle",
          description: "AI assistant for protocol design questions",
          icon: <BrainCircuit />
        },
        {
          name: "Criteria Optimizer",
          description: "Refine eligibility criteria based on historical data",
          icon: <Filter />
        },
        {
          name: "Timeline Planner",
          description: "Realistic study duration and milestone planning",
          icon: <CalendarCheck />
        }
      ],
      demoPath: "/protocol-design",
      fullPath: "/protocol-design",
      documentPath: "/assets/docs/Protocol_Designer_Guide.pdf"
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      description: "Statistical modeling and predictive analytics for trials",
      icon: <LineChart className="h-6 w-6" />,
      color: "bg-amber-600",
      gradient: "from-amber-600 to-orange-700",
      capabilities: [
        "Statistical power calculations",
        "Trial success prediction",
        "Performance benchmarking",
        "Competitive landscape analysis"
      ],
      keyTools: [
        {
          name: "Success Predictor",
          description: "ML-powered trial outcome prediction",
          icon: <ThumbsUp />
        },
        {
          name: "Statistical Power Calculator",
          description: "Evidence-based sample size determination",
          icon: <Calculator />
        },
        {
          name: "Competitor Analysis",
          description: "Compare trial design to competitors",
          icon: <PieChart />
        }
      ],
      demoPath: "/analytics",
      fullPath: "/analytics",
      documentPath: "/assets/docs/Analytics_Guide.pdf"
    }
  ];

  // Sample reports available for download
  const sampleReports = [
    {
      title: "Clinical Evaluation Report",
      description: "Complete CER with FAERS data for cardiac stent device",
      type: "PDF",
      size: "4.2 MB",
      path: "/assets/samples/Cardiac_Stent_CER_Example.pdf",
      icon: <FileCheck className="h-5 w-5" />,
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      category: "Medical Device"
    },
    {
      title: "Oncology Protocol Analysis",
      description: "Phase II trial protocol with optimization recommendations",
      type: "PDF",
      size: "3.8 MB",
      path: "/assets/samples/Oncology_Protocol_Analysis.pdf",
      icon: <Beaker className="h-5 w-5" />,
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      category: "Protocol Design"
    },
    {
      title: "Statistical Analysis Report",
      description: "Comprehensive statistical analysis for diabetes trial",
      type: "PDF",
      size: "2.9 MB",
      path: "/assets/samples/Diabetes_Statistical_Analysis.pdf",
      icon: <LineChart className="h-5 w-5" />,
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      category: "Statistics"
    },
    {
      title: "Regulatory Strategy Document",
      description: "FDA submission strategy with historical precedents",
      type: "PDF",
      size: "3.2 MB",
      path: "/assets/samples/Regulatory_Strategy_Example.pdf",
      icon: <ClipboardCheck className="h-5 w-5" />,
      color: "bg-amber-600",
      gradient: "from-amber-600 to-orange-700",
      category: "Regulatory"
    }
  ];

  // Interactive demos with detailed descriptions
  const interactiveDemos = [
    {
      title: "CER Dashboard",
      description: "Interactive dashboard for exploring adverse events and safety data with filtering options by severity, demographics, and reporting periods.",
      details: "This dashboard presents real-world safety data from FDA's FAERS database, allowing you to identify signals, compare products, and generate custom reports for regulatory submissions.",
      icon: <BarChart className="h-5 w-5" />,
      path: "/cer-dashboard",
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      timeEstimate: "5 min",
      features: [
        "Adverse event visualization by body system",
        "Signal detection with statistical significance",
        "Custom filtering by patient demographics",
        "PDF report generation with visualizations"
      ]
    },
    {
      title: "Protocol Designer",
      description: "AI-powered tool for protocol development with eligibility criteria optimization and enrollment feasibility analysis.",
      details: "Create better protocols faster by leveraging data from 3,000+ completed clinical trials. Get specific recommendations on inclusion/exclusion criteria to maximize enrollment while maintaining scientific validity.",
      icon: <Beaker className="h-5 w-5" />,
      path: "/protocol-design",
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      timeEstimate: "10 min",
      features: [
        "Eligibility criteria benchmarking",
        "Enrollment rate prediction",
        "Historical trial comparison",
        "Protocol template generation"
      ]
    },
    {
      title: "CSR Search",
      description: "Search through 3,000+ structured clinical study reports to find relevant precedents for your clinical development.",
      details: "Our comprehensive database of CSRs allows you to search by therapeutic area, endpoint, study design, and more. Access insights from previously successful trials to inform your development strategy.",
      icon: <Search className="h-5 w-5" />,
      path: "/csr-insights",
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      timeEstimate: "3 min",
      features: [
        "Advanced semantic search",
        "Structured data extraction",
        "Cross-study comparison",
        "Exportable insights"
      ]
    },
    {
      title: "Statistical Tools",
      description: "Statistical analysis tools for sample size calculation, endpoint selection, and trial success prediction.",
      details: "Evidence-based statistical tools that help you optimize study design, select appropriate endpoints, and calculate required sample sizes based on historical data from similar trials.",
      icon: <Calculator className="h-5 w-5" />,
      path: "/analytics",
      color: "bg-amber-600",
      gradient: "from-amber-600 to-orange-700",
      timeEstimate: "7 min",
      features: [
        "Sample size calculation",
        "Endpoint performance analysis",
        "Success probability modeling",
        "Statistical power optimization"
      ]
    }
  ];

  // Helper function to render features list
  const renderFeaturesList = (features) => {
    return (
      <ul className="mt-3 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1 mr-2" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="py-12 px-4 bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
            Clinical Intelligence Platform
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            LumenTrialGuide.AI
          </h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            The comprehensive platform that transforms clinical study data into actionable intelligence
            for pharmaceutical companies, CROs, and researchers
          </p>
        </div>
        
        {/* Main Navigation Tabs */}
        <Tabs defaultValue="features" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="features" className="text-sm sm:text-base py-3">
              <Lightbulb className="h-4 w-4 mr-2 hidden sm:inline" />
              Platform Features
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-sm sm:text-base py-3">
              <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
              Sample Reports
            </TabsTrigger>
            <TabsTrigger value="demos" className="text-sm sm:text-base py-3">
              <ExternalLink className="h-4 w-4 mr-2 hidden sm:inline" />
              Interactive Demos
            </TabsTrigger>
          </TabsList>
          
          {/* Platform Features Tab */}
          <TabsContent value="features" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformFeatures.map(feature => (
                <Card key={feature.id} className="overflow-hidden border-t-4" style={{borderTopColor: `var(--${feature.color.split('-')[1]})`}}>
                  <CardHeader className={`bg-gradient-to-r ${feature.gradient} text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription className="text-white/80 mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                      Capabilities
                    </h4>
                    {renderFeaturesList(feature.capabilities)}
                    
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-6 mb-3">
                      Key Tools
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {feature.keyTools.map((tool, idx) => (
                        <div key={idx} className="flex items-start border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                          <div className="mr-3 text-blue-600 dark:text-blue-400">
                            {tool.icon}
                          </div>
                          <div>
                            <h5 className="font-medium">{tool.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-gray-50 dark:bg-gray-900">
                    <a href={feature.documentPath} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Documentation
                    </a>
                    <Link href={feature.demoPath}>
                      <Button variant="default" className={`${feature.color} hover:${feature.color.replace('600', '700')} text-white`}>
                        Try {feature.title}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Sample Reports Tab */}
          <TabsContent value="reports" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="sr-only">Loading reports...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sampleReports.map((report, idx) => (
                  <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className={`bg-gradient-to-r ${report.gradient} text-white py-6`}>
                      <div className="flex justify-center">
                        {report.icon}
                      </div>
                      <div className="text-center">
                        <CardTitle className="text-xl mt-3">{report.title}</CardTitle>
                        <Badge variant="outline" className="mt-2 bg-white/10 text-white hover:bg-white/20">
                          {report.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {report.type} · {report.size}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 dark:bg-gray-900">
                      <a 
                        href={report.path}
                        className="w-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Interactive Demos Tab */}
          <TabsContent value="demos" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interactiveDemos.map((demo, idx) => (
                <Card key={idx} className="overflow-hidden border-t-4" style={{borderTopColor: `var(--${demo.color.split('-')[1]})`}}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${demo.color} text-white p-3 rounded-lg`}>
                        {demo.icon}
                      </div>
                      <div>
                        <CardTitle>{demo.title}</CardTitle>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{demo.timeEstimate} demo</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {demo.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                      {demo.details}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Key Features</h4>
                      {renderFeaturesList(demo.features)}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t">
                    <Link href={demo.path}>
                      <Button className={`${demo.color} hover:${demo.color.replace('600', '700')} text-white`}>
                        Try Interactive Demo
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PlatformShowcase;