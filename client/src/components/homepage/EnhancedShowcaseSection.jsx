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
  ThumbsUp
} from 'lucide-react';

// Calculator icon component (not included in lucide-react default set)
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
 * Enhanced Showcase Section for Homepage - Reorganized to better explain
 * platform capabilities, use cases, and value propositions for each persona
 * 
 * Key improvements:
 * - Clearer persona-based organization
 * - Detailed value proposition for each role
 * - Better visual hierarchy and navigation
 * - More accessible examples and demonstrations
 * - Live CSR report integration
 */
const EnhancedShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('personas');
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Fetch recent reports from the API
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab === 'examples') {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/reports/recent?limit=4');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.status}`);
          }
          
          const data = await response.json();
          setRecentReports(data);
        } catch (err) {
          console.error('Error fetching reports:', err);
          setError('Failed to load recent reports. Please try again later.');
          // toast call replaced
  // Original: toast({
            title: "Error loading reports",
            description: "We couldn't fetch the latest reports. Please try again later.",
            variant: "destructive"
          })
  console.log('Toast would show:', {
            title: "Error loading reports",
            description: "We couldn't fetch the latest reports. Please try again later.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchReports();
  }, [activeTab, toast]);
  
  // Detailed role-based personas with specific challenges and solutions
  const personas = [
    {
      id: "clinical",
      title: "Clinical Development",
      role: "Director of Clinical Operations",
      icon: <Beaker className="h-6 w-6" />,
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      challenges: [
        "Protocol designs often have unrealistic eligibility criteria",
        "Enrollment failures due to poor trial design",
        "Limited visibility into comparable study designs",
        "Risk of costly protocol amendments"
      ],
      solutions: [
        "Evidence-based protocol optimization",
        "Real-world enrollment feasibility analysis",
        "Dropout risk mitigation strategies",
        "Intelligent patient journey mapping"
      ],
      keyFeatures: [
        {
          name: "Protocol Optimizer",
          description: "AI-powered enhancement for feasibility and enrollment optimization",
          icon: <Target />
        },
        {
          name: "Study Design Oracle",
          description: "Interactive guidance with regulatory & scientific intelligence",
          icon: <BrainCircuit />
        },
        {
          name: "Dropout Forecaster",
          description: "Predictive modeling of participant retention with mitigation strategies",
          icon: <BarChart />
        }
      ],
      demoPath: "/study-design-agent?demo=true",
      demoCTA: "Try Design Agent Demo",
      fullPath: "/use-cases#clinical",
      exampleReportPath: "/example-reports?type=protocol"
    },
    {
      id: "regulatory",
      title: "Regulatory Affairs",
      role: "Director of Regulatory Strategy",
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      challenges: [
        "Time-consuming IND/NDA documentation preparation",
        "Ensuring comprehensive regulatory compliance",
        "Manual extraction of protocol insights for submissions",
        "Maintaining consistency across regulatory documents"
      ],
      solutions: [
        "Automated IND/NDA-ready summaries",
        "Multi-agency regulatory validation",
        "Evidence-based preparation with citations",
        "Document consistency verification"
      ],
      keyFeatures: [
        {
          name: "Regulatory Package Builder",
          description: "Auto-generate submission-ready documentation with proper citations",
          icon: <Clipboard />
        },
        {
          name: "Compliance Validator",
          description: "Multi-agency validation across FDA, EMA, PMDA and Health Canada",
          icon: <Shield />
        },
        {
          name: "Summary Section Generator",
          description: "Evidence-based documentation with automatic references",
          icon: <FileCheck />
        }
      ],
      demoPath: "/protocol/upload?demo=true",
      demoCTA: "Try Regulatory Analysis",
      fullPath: "/use-cases#regulatory",
      exampleReportPath: "/example-reports?type=regulatory"
    },
    {
      id: "biostat",
      title: "Biostatistics",
      role: "Biostatistician",
      icon: <LineChart className="h-6 w-6" />,
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      challenges: [
        "Difficulty selecting optimal endpoints",
        "Uncertain statistical power calculations",
        "Complex trial success predictions",
        "Limited historical data for statistical planning"
      ],
      solutions: [
        "Data-driven endpoint selection",
        "Precision sample size calculation",
        "ML-powered success prediction",
        "Comparative statistical analysis"
      ],
      keyFeatures: [
        {
          name: "Success Predictor",
          description: "Advanced ML models for trial outcome prediction with 92% accuracy",
          icon: <ThumbsUp />
        },
        {
          name: "Endpoint Optimizer",
          description: "Data-driven selection and validation of primary/secondary endpoints",
          icon: <Target />
        },
        {
          name: "Statistical Power Calculator",
          description: "Evidence-based sample size determination with historical validation",
          icon: <Calculator />
        }
      ],
      demoPath: "/endpoint-designer?demo=true",
      demoCTA: "Try Endpoint Designer",
      fullPath: "/use-cases#biostat",
      exampleReportPath: "/example-reports?type=prediction"
    },
    {
      id: "executive",
      title: "Executive Leadership",
      role: "C-Suite/Senior Management",
      icon: <Building className="h-6 w-6" />,
      color: "bg-amber-600",
      gradient: "from-amber-600 to-orange-700",
      challenges: [
        "Limited visibility into trial portfolio performance",
        "Difficult strategic resource allocation decisions", 
        "Complex ROI assessment for trial investments",
        "Competitive intelligence gaps"
      ],
      solutions: [
        "Strategic portfolio intelligence",
        "Comparative program analysis",
        "Investment prioritization insights",
        "Competitor benchmarking"
      ],
      keyFeatures: [
        {
          name: "Executive Dashboard",
          description: "Comprehensive view of trial performance, risks, and opportunities",
          icon: <PieChart />
        },
        {
          name: "Strategic Intelligence",
          description: "Competitive landscape analysis and market positioning insights",
          icon: <Rocket />
        },
        {
          name: "Portfolio Optimizer",
          description: "Resource allocation recommendations based on success probability",
          icon: <BarChart />
        }
      ],
      demoPath: "/executive-dashboard?demo=true",
      demoCTA: "View Executive Dashboard",
      fullPath: "/use-cases#executive",
      exampleReportPath: "/example-reports?type=strategic"
    }
  ];
  
  // Demo reports that showcase platform capabilities
  const exampleReports = [
    {
      title: "Clinical Evaluation Report",
      description: "AI-generated CER with comprehensive FAERS data analysis and regulatory narratives",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/example-reports?type=cer",
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      badges: ["CER", "FAERS Data", "Regulatory"],
      persona: "Regulatory Affairs",
      features: ["FAERS data integration", "Comprehensive safety analysis", "Ready for submission"],
      mainCTA: "View Example CER"
    },
    {
      title: "Protocol Optimization Report",
      description: "AI-powered enhancement recommendations for Phase II oncology trials",
      icon: <BrainCircuit className="h-5 w-5" />,
      path: "/example-reports?type=protocol",
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      badges: ["Oncology", "Phase II", "35+ CSRs"],
      persona: "Clinical Development",
      features: ["Eligibility optimization", "Enrollment feasibility", "Design improvements"],
      mainCTA: "View Example"
    },
    {
      title: "IND Summary Package",
      description: "Regulatory-ready summary for FDA submission with citations",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/example-reports?type=regulatory",
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      badges: ["Regulatory", "FDA Aligned", "IND Ready"],
      persona: "Regulatory Affairs",
      features: ["Automatic citations", "Regulatory validation", "Cross-reference verification"],
      mainCTA: "View Package"
    },
    {
      title: "Trial Success Prediction",
      description: "Statistical model predicting trial outcomes with 92% confidence",
      icon: <LineChart className="h-5 w-5" />,
      path: "/example-reports?type=prediction",
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      badges: ["ML Powered", "Risk Analysis", "Quantitative"],
      persona: "Biostatistics",
      features: ["Success probability", "Risk factor analysis", "Mitigation recommendations"],
      mainCTA: "View Prediction"
    },
    {
      title: "Strategic Portfolio Analysis",
      description: "Executive intelligence on trial portfolio performance and opportunities",
      icon: <PieChart className="h-5 w-5" />,
      path: "/example-reports?type=strategic",
      color: "bg-amber-600",
      gradient: "from-amber-600 to-orange-700",
      badges: ["Executive", "Strategic", "Competitive"],
      persona: "Executive Leadership",
      features: ["Portfolio assessment", "Competitive benchmarking", "Resource optimization"],
      mainCTA: "View Analysis"
    }
  ];
  
  // Interactive demos that allow users to test platform functionality
  const interactiveDemos = [
    {
      title: "CER Generator",
      description: "AI-powered Clinical Evaluation Report generation from FAERS data",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/cer-generator",
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      timeEstimate: "3 min",
      persona: "Regulatory Affairs",
      capabilities: ["Automated CER generation", "FAERS data integration", "Evidence-based narratives"],
      mainCTA: "Generate CER"
    },
    {
      title: "Study Design Agent",
      description: "Interactive AI assistant for protocol design questions",
      icon: <BrainCircuit className="h-5 w-5" />,
      path: "/study-design-agent?demo=true",
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      timeEstimate: "5 min",
      persona: "Clinical Development",
      capabilities: ["Protocol optimization", "Historical CSR intelligence", "Eligibility criteria recommendations"],
      mainCTA: "Start Demo"
    },
    {
      title: "Protocol Analyzer",
      description: "Analyze protocols with regulatory insights and validation",
      icon: <FileText className="h-5 w-5" />,
      path: "/protocol/upload?demo=true",
      color: "bg-purple-600",
      gradient: "from-purple-600 to-indigo-700",
      timeEstimate: "3 min",
      persona: "Regulatory Affairs",
      capabilities: ["Regulatory validation", "Auto-citation", "Compliance assessment"],
      mainCTA: "Try Analysis"
    },
    {
      title: "Endpoint Designer",
      description: "Evidence-based endpoint selection and optimization tool",
      icon: <Target className="h-5 w-5" />,
      path: "/endpoint-designer?demo=true",
      color: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      timeEstimate: "4 min",
      persona: "Biostatistics",
      capabilities: ["Endpoint validation", "Statistical power analysis", "Benchmark comparison"],
      mainCTA: "Design Endpoints"
    },
    {
      title: "CSR Intelligence Search",
      description: "Search our database of 3,000+ structured CSR trials",
      icon: <Search className="h-5 w-5" />,
      path: "/reports?demo=true",
      color: "bg-indigo-600",
      gradient: "from-indigo-600 to-blue-700",
      timeEstimate: "2 min",
      persona: "All Roles",
      capabilities: ["Full-text search", "Structured data filtering", "Comparative analysis"],
      mainCTA: "Search CSRs"
    }
  ];



  // Helper function to render key features list
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
        {/* Enhanced Section Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
            AI-Powered Clinical Intelligence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">
            LumenTrialGuide.AI Platform
          </h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            The comprehensive AI platform that transforms clinical study reports into actionable intelligence
            for pharmaceutical companies, CROs, and researchers
          </p>
        </div>
        
        {/* Main Navigation Tabs */}
        <Tabs defaultValue="personas" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="personas" className="text-sm sm:text-base py-3">
              <Users className="h-4 w-4 mr-2 hidden sm:inline" />
              Role-Based Solutions
            </TabsTrigger>
            <TabsTrigger value="examples" className="text-sm sm:text-base py-3">
              <Eye className="h-4 w-4 mr-2 hidden sm:inline" />
              Example Reports
            </TabsTrigger>
            <TabsTrigger value="demos" className="text-sm sm:text-base py-3">
              <Rocket className="h-4 w-4 mr-2 hidden sm:inline" />
              Interactive Demos
            </TabsTrigger>
          </TabsList>
          
          {/* Role-Based Personas Tab Content */}
          <TabsContent value="personas" className="w-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {personas.map((persona, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${persona.gradient} text-white p-5`}>
                    <div className="flex justify-between items-start">
                      <Badge className="px-3 py-1.5 bg-white/20 hover:bg-white/30 border-none text-white">
                        {persona.icon}
                        <span className="ml-1.5">{persona.role}</span>
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mt-4 mb-2">
                      {persona.title} Suite
                    </h3>
                    <p className="text-sm opacity-90 mb-1">
                      Specialized intelligence for {persona.title.toLowerCase()} teams and {persona.role.toLowerCase()} roles.
                    </p>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                        Key Challenges Addressed
                      </h4>
                      <ul className="space-y-2">
                        {persona.challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className={`h-5 w-5 rounded-full ${persona.color} bg-opacity-20 flex items-center justify-center shrink-0 mr-3 mt-0.5`}>
                              <span className="text-xs font-bold">{idx+1}</span>
                            </div>
                            <span className="text-sm">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                        Our Solutions
                      </h4>
                      <ul className="space-y-2">
                        {persona.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5 mr-2" />
                            <span className="text-sm">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                        Key Features
                      </h4>
                      <div className="space-y-3">
                        {persona.keyFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <div className={`h-8 w-8 rounded-md ${persona.color} text-white flex items-center justify-center shrink-0 mr-3`}>
                              {feature.icon}
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">{feature.name}</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t flex flex-col sm:flex-row sm:justify-between gap-3">
                    <Link href={persona.demoPath}>
                      <Button className={`bg-gradient-to-r ${persona.gradient} text-white hover:opacity-90 gap-1.5 w-full sm:w-auto`}>
                        <Rocket className="h-4 w-4" />
                        {persona.demoCTA}
                      </Button>
                    </Link>
                    <Link href={persona.exampleReportPath}>
                      <Button variant="outline" className="gap-1.5 w-full sm:w-auto">
                        <Eye className="h-4 w-4" />
                        View Example Report
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/use-cases">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white group">
                  Compare All Intelligence Suites
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          {/* Example Reports Tab Content */}
          <TabsContent value="examples" className="w-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {exampleReports.map((report, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${report.gradient} text-white p-5`}>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                        {report.icon}
                        <span className="ml-1.5">{report.persona}</span>
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mt-3 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm opacity-90">{report.description}</p>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {report.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                        Key Capabilities
                      </h4>
                      {renderFeaturesList(report.features)}
                    </div>
                    
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <Database className="h-4 w-4 mr-2" />
                      <span>Built with real CSR intelligence</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t flex justify-between">
                    <Link href={report.path}>
                      <Button className={`bg-gradient-to-r ${report.gradient} text-white hover:opacity-90 gap-1.5`}>
                        <Eye className="h-3.5 w-3.5" />
                        {report.mainCTA}
                      </Button>
                    </Link>
                    
                    <Link href={`/use-cases#${report.persona.toLowerCase().replace(' ', '-')}`}>
                      <Button variant="ghost" size="sm">
                        Learn More
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/example-reports">
                <Button variant="outline" size="lg" className="group">
                  Browse All Example Reports
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          {/* Interactive Demos Tab Content */}
          <TabsContent value="demos" className="w-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {interactiveDemos.map((demo, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${demo.gradient} text-white p-5`}>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                        {demo.icon}
                        <span className="ml-1.5">Interactive Demo</span>
                      </Badge>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {demo.timeEstimate}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mt-3 mb-1">
                      {demo.title}
                    </h3>
                    <p className="text-sm opacity-90">{demo.description}</p>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="mb-1">
                      <Badge variant="outline" className={`text-xs ${demo.persona === 'All Roles' ? 'border-indigo-500 text-indigo-600' : ''}`}>
                        {demo.persona}
                      </Badge>
                    </div>
                    
                    <div className="mb-4 mt-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                        Demo Capabilities
                      </h4>
                      {renderFeaturesList(demo.capabilities)}
                    </div>
                    
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>No login required - instant access</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t flex justify-between">
                    <Link href={demo.path}>
                      <Button className={`bg-gradient-to-r ${demo.gradient} text-white hover:opacity-90 gap-1.5`}>
                        <Rocket className="h-3.5 w-3.5" />
                        {demo.mainCTA}
                      </Button>
                    </Link>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarCheck className="h-4 w-4 mr-1" />
                      <span>Updated Weekly</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="group">
                  Explore Full Demo Dashboard
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Call to action - Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to transform your clinical development?</h3>
          <p className="max-w-2xl mx-auto mb-6">
            Schedule a personalized demo with our team to see how LumenTrialGuide.AI can 
            address your specific challenges and drive better trial outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Request Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedShowcaseSection;