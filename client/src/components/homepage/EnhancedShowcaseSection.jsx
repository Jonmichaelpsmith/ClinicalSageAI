import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  PieChart, 
  LineChart, 
  BookOpen, 
  FileCheck, 
  Users, 
  ExternalLink, 
  Eye, 
  BrainCircuit,
  Lightbulb,
  ChevronRight,
  Beaker,
  Search,
  ArrowRight
} from 'lucide-react';

/**
 * Enhanced Showcase Section for Homepage
 * 
 * This component highlights the key capabilities of the platform with:
 * - Prominent example reports section
 * - Interactive demo options
 * - Role-based intelligence suites
 * - Clear CTAs for exploring each feature
 */
const EnhancedShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('reports');
  
  // Demo reports that showcase platform capabilities
  const exampleReports = [
    {
      title: "Protocol Optimization Report",
      description: "AI-powered enhancement recommendations for Phase II oncology trials",
      icon: <BrainCircuit className="h-5 w-5" />,
      path: "/example-reports?type=protocol",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      badges: ["Oncology", "Phase II", "35+ CSRs"],
      mainCTA: "View Example"
    },
    {
      title: "IND Summary Package",
      description: "Regulatory-ready summary for FDA submission with citations",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/example-reports?type=regulatory",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-indigo-600",
      badges: ["Regulatory", "FDA Aligned", "IND Ready"],
      mainCTA: "View Package"
    },
    {
      title: "Trial Success Prediction",
      description: "Statistical model predicting trial outcomes with 92% confidence",
      icon: <LineChart className="h-5 w-5" />,
      path: "/example-reports?type=prediction",
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      badges: ["ML Powered", "Risk Analysis", "Quantitative"],
      mainCTA: "View Prediction"
    }
  ];
  
  // Interactive demos that allow users to test platform functionality
  const interactiveDemos = [
    {
      title: "Study Design Agent Demo",
      description: "Chat with our AI agent about your protocol design questions",
      icon: <BrainCircuit className="h-5 w-5" />,
      path: "/study-design-agent?demo=true",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      timeEstimate: "5 min demo",
      mainCTA: "Start Demo"
    },
    {
      title: "Protocol Analyzer Demo",
      description: "See how our system analyzes protocols with regulatory insights",
      icon: <FileText className="h-5 w-5" />,
      path: "/protocol/upload?demo=true",
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-600",
      timeEstimate: "3 min demo",
      mainCTA: "Try Analysis"
    },
    {
      title: "CSR Intelligence Search",
      description: "Search our database of 1,900+ structured CSR trials",
      icon: <Search className="h-5 w-5" />,
      path: "/reports?demo=true",
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-blue-600",
      timeEstimate: "2 min demo",
      mainCTA: "Search CSRs"
    }
  ];
  
  // Role-based intelligence packages
  const roleSuites = [
    {
      title: "Clinical Development",
      description: "Design smarter trials with evidence-based protocol optimization",
      icon: <Beaker className="h-5 w-5" />,
      path: "/use-cases#planner",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      persona: "For Study Planners",
      mainCTA: "View Suite"
    },
    {
      title: "Regulatory Affairs",
      description: "Streamline submissions with IND-ready summaries and validation",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/use-cases#regulatory",
      color: "bg-purple-500", 
      gradient: "from-purple-500 to-indigo-600",
      persona: "For Reg Affairs",
      mainCTA: "View Suite"
    },
    {
      title: "Biostatistics",
      description: "Advanced modeling, endpoint selection and dropout forecasting",
      icon: <LineChart className="h-5 w-5" />,
      path: "/use-cases#biostats",
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      persona: "For Biostatisticians",
      mainCTA: "View Suite"
    },
    {
      title: "Executive Level",
      description: "Strategic intelligence dashboards for senior decision makers",
      icon: <PieChart className="h-5 w-5" />,
      path: "/use-cases#ceo",
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-600",
      persona: "For Leadership",
      mainCTA: "View Suite"
    }
  ];

  return (
    <section className="py-12 px-4 bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Enhanced Section Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
            Evidence-Based Intelligence
          </Badge>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">
            Discover LumenTrialGuide.AI Capabilities
          </h2>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Explore our example reports, try interactive demos, and see how our intelligence 
            suites transform clinical development across different roles
          </p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-1 mb-5">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              Example Reports
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'demos' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('demos')}
            >
              Interactive Demos
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'roles' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('roles')}
            >
              Role-Based Suites
            </button>
          </div>
        </div>

        {/* Example Reports Grid */}
        {activeTab === 'reports' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exampleReports.map((report, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${report.gradient} text-white p-4`}>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                        {report.icon}
                        Report Example
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mt-3 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm opacity-90">{report.description}</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Based on real CSR intelligence</span>
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
                    <Link href={report.path}>
                      <Button className={`bg-gradient-to-r ${report.gradient} text-white hover:opacity-90 gap-1.5`}>
                        <Eye className="h-3.5 w-3.5" />
                        {report.mainCTA}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/example-reports">
                <Button variant="outline" size="lg" className="group">
                  View All Example Reports
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Interactive Demos Grid */}
        {activeTab === 'demos' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interactiveDemos.map((demo, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${demo.gradient} text-white p-4`}>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                        {demo.icon}
                        Interactive
                      </Badge>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {demo.timeEstimate}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mt-3 mb-1">
                      {demo.title}
                    </h3>
                    <p className="text-sm opacity-90">{demo.description}</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>No login required - instant access</span>
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
                    <Link href={demo.path}>
                      <Button className={`bg-gradient-to-r ${demo.gradient} text-white hover:opacity-90 gap-1.5`}>
                        <ArrowRight className="h-3.5 w-3.5" />
                        {demo.mainCTA}
                      </Button>
                    </Link>
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
          </>
        )}

        {/* Role-Based Suites Grid */}
        {activeTab === 'roles' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleSuites.map((suite, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${suite.gradient} text-white p-4`}>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                        {suite.icon}
                        {suite.persona}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mt-3 mb-1">
                      {suite.title}
                    </h3>
                    <p className="text-sm opacity-90">{suite.description}</p>
                  </div>
                  <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-center dark:bg-gray-900">
                    <Link href={suite.path}>
                      <Button variant="outline" className={`border-${suite.color.replace('bg-', '')} text-${suite.color.replace('bg-', '')} hover:bg-${suite.color.replace('bg-', '')}/10 gap-1.5`}>
                        {suite.icon}
                        {suite.mainCTA}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/use-cases">
                <Button variant="outline" size="lg" className="group">
                  Compare All Intelligence Suites
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EnhancedShowcaseSection;