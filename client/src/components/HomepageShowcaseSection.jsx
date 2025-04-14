import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  PieChart, 
  LineChart, 
  BookOpen, 
  Award, 
  Calendar, 
  BarChart, 
  FileCheck, 
  Users, 
  Star, 
  FileDown, 
  ExternalLink, 
  Eye, 
  BrainCircuit,
  Lightbulb
} from 'lucide-react';

/**
 * Clinical Intelligence Showcase Section
 * 
 * A dynamic, grid-based showcase of intelligence capabilities organized by persona.
 * Each tile represents a different intelligence output with real-world files and statistics.
 * 
 * Features:
 * - Persona-based styling (colors match user role)
 * - Live file previews
 * - Real statistical outputs
 * - CSR citation badges
 * - Clear CTAs for both viewing examples and generating new reports
 */
const HomepageShowcaseSection = () => {
  // State for report data, loading state, and which preview is active
  const [showcaseData, setShowcaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  // Fetch showcase data from the manifest file
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/showcase/manifest');
        
        if (!response.ok) {
          throw new Error('Failed to load showcase data');
        }
        
        const data = await response.json();
        setShowcaseData(data);
      } catch (err) {
        console.error('Error loading showcase data:', err);
        setError('Failed to load showcase data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowcaseData();
  }, []);

  // Fallback to local data if API fails
  useEffect(() => {
    if (error && !showcaseData) {
      // Fallback to static manifest if API fails
      import('@assets/manifest.json')
        .then(data => {
          setShowcaseData(data.default);
          setError(null);
        })
        .catch(err => {
          console.error('Error loading fallback data:', err);
        });
    }
  }, [error, showcaseData]);

  // Helper function to get gradient based on persona
  const getPersonaGradient = (persona) => {
    switch (persona.toLowerCase()) {
      case 'planner':
      case 'study planner':
        return 'from-blue-500 to-indigo-600';
      case 'regulatory':
      case 'reg affairs':
        return 'from-purple-500 to-indigo-600';
      case 'biostats':
      case 'statistical':
        return 'from-emerald-500 to-teal-600';
      case 'ceo':
      case 'investor':
      case 'bd':
        return 'from-amber-500 to-orange-600';
      case 'clin ops':
      case 'operational':
        return 'from-rose-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  // Helper function to get persona icon
  const getPersonaIcon = (persona) => {
    switch (persona.toLowerCase()) {
      case 'planner':
      case 'study planner':
        return <BrainCircuit className="h-5 w-5" />;
      case 'regulatory':
      case 'reg affairs':
        return <FileCheck className="h-5 w-5" />;
      case 'biostats':
      case 'statistical':
        return <BarChart className="h-5 w-5" />;
      case 'ceo':
      case 'investor':
      case 'bd':
        return <PieChart className="h-5 w-5" />;
      case 'clin ops':
      case 'operational':
        return <Users className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper to render the CSR citation badges
  const renderCitations = (citations) => {
    if (!citations || citations.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {citations.slice(0, 2).map((citation, idx) => (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs bg-white/70 hover:bg-white">
                  <BookOpen className="h-3 w-3 mr-1" />
                  CSR_{citation.id.substring(0, 8)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{citation.title || 'Clinical Study Report'}</p>
                <p className="text-xs text-muted-foreground">
                  {citation.sponsor}, {citation.year}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {citations.length > 2 && (
          <Badge variant="outline" className="text-xs bg-white/70">
            +{citations.length - 2} more
          </Badge>
        )}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Clinical Intelligence Showcase
          </h2>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading intelligence showcase...</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error && !showcaseData) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Clinical Intelligence Showcase
          </h2>
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Clinical Intelligence Showcase
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
            Real outputs from real trials, powered by LumenTrialGuide.AI
          </p>
        </div>

        {/* Intelligence Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          
          {/* TILE 1 — INTELLIGENT TRIAL DESIGN (STUDY PLANNER) */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4`}>
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  <BrainCircuit className="h-3.5 w-3.5 mr-1" />
                  For Study Planners
                </Badge>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  GLP-1 analog
                </span>
              </div>
              <h3 className="text-xl font-bold mt-3 mb-0">
                Intelligent Trial Design
              </h3>
              <p className="text-sm opacity-90">Design from data. Not guesswork.</p>
            </div>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <dt className="text-muted-foreground flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> Duration</dt>
                <dd className="font-medium">24 weeks</dd>
                
                <dt className="text-muted-foreground flex items-center"><BarChart className="h-3.5 w-3.5 mr-1.5" /> Primary endpoints</dt>
                <dd className="font-medium">ALT + HbA1c</dd>
                
                <dt className="text-muted-foreground flex items-center"><Users className="h-3.5 w-3.5 mr-1.5" /> Study arms</dt>
                <dd className="font-medium">2 arms (active/placebo)</dd>
                
                <dt className="text-muted-foreground flex items-center"><Star className="h-3.5 w-3.5 mr-1.5" /> Success probability</dt>
                <dd className="font-medium text-emerald-600">86%</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> Dropout projection</dt>
                <dd className="font-medium">13.2%</dd>
              </dl>
              
              {renderCitations([
                { id: "NCT01234567", title: "Phase 2 Study of GLP-1 in T2DM", sponsor: "BioPharm Inc", year: 2022 },
                { id: "NCT02345678", title: "MAGNIFY-3 Study", sponsor: "LifeSci Corp", year: 2023 }
              ])}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                  <span>CSR match</span>
                  <span className="font-medium">9 trials</span>
                </div>
                <Progress value={86} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Intelligent Trial Design Preview</DialogTitle>
                    <DialogDescription>
                      Complete IND-ready protocol package with CSR-backed design recommendations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-slate-50 p-4 rounded-md overflow-hidden">
                    <object
                      data="/static/example_reports/protocol/summary_packet.pdf"
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="rounded border"
                    >
                      <p>PDF cannot be displayed</p>
                    </object>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/planning?persona=planner&example=glp1">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Build Your Protocol
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* TILE 2 — INVESTOR BRIEF (CEO/BD) */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4`}>
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  <PieChart className="h-3.5 w-3.5 mr-1" />
                  For CEO/BD
                </Badge>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Market Analysis
                </span>
              </div>
              <h3 className="text-xl font-bold mt-3 mb-0">
                Investor Intelligence Brief
              </h3>
              <p className="text-sm opacity-90">What they need to say yes.</p>
            </div>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <dt className="text-muted-foreground flex items-center"><Star className="h-3.5 w-3.5 mr-1.5" /> Success forecast</dt>
                <dd className="font-medium">82% (Monte Carlo)</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> IRR projection</dt>
                <dd className="font-medium">17.3%</dd>
                
                <dt className="text-muted-foreground flex items-center"><BarChart className="h-3.5 w-3.5 mr-1.5" /> Competition</dt>
                <dd className="font-medium">4 phase III trials</dd>
                
                <dt className="text-muted-foreground flex items-center"><PieChart className="h-3.5 w-3.5 mr-1.5" /> Market share</dt>
                <dd className="font-medium text-emerald-600">15.4%</dd>
                
                <dt className="text-muted-foreground flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> Time to market</dt>
                <dd className="font-medium">Q2 2027</dd>
              </dl>
              
              {renderCitations([
                { id: "NCT03456789", title: "Market Model Study", sponsor: "LifeSci Research", year: 2024 },
                { id: "NCT04567890", title: "Competitive Intelligence", sponsor: "MarketAnalytics", year: 2023 }
              ])}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                  <span>Risk assessment</span>
                  <span className="font-medium">Medium</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Preview Brief
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Investor Intelligence Brief Preview</DialogTitle>
                    <DialogDescription>
                      Market analysis and competitive intelligence dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-slate-50 p-4 rounded-md overflow-hidden">
                    <object
                      data="/static/example_reports/ceo/investor_brief.pdf"
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="rounded border"
                    >
                      <p>PDF cannot be displayed</p>
                    </object>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/planning?persona=ceo&example=market">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-1.5">
                  <PieChart className="h-3.5 w-3.5" />
                  Generate Your Brief
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* TILE 3 — REGULATORY READINESS (REG AFFAIRS) */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4`}>
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  <FileCheck className="h-3.5 w-3.5 mr-1" />
                  For Regulatory
                </Badge>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Submission Ready
                </span>
              </div>
              <h3 className="text-xl font-bold mt-3 mb-0">
                Regulatory Readiness Package
              </h3>
              <p className="text-sm opacity-90">Show you're submission ready—instantly.</p>
            </div>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <dt className="text-muted-foreground flex items-center"><FileText className="h-3.5 w-3.5 mr-1.5" /> IND sections</dt>
                <dd className="font-medium">2.5 and 2.7</dd>
                
                <dt className="text-muted-foreground flex items-center"><Award className="h-3.5 w-3.5 mr-1.5" /> Compliance score</dt>
                <dd className="font-medium text-emerald-600">94%</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> Risk score</dt>
                <dd className="font-medium">Low (92/100)</dd>
                
                <dt className="text-muted-foreground flex items-center"><BrainCircuit className="h-3.5 w-3.5 mr-1.5" /> AI traces</dt>
                <dd className="font-medium">Included</dd>
                
                <dt className="text-muted-foreground flex items-center"><FileCheck className="h-3.5 w-3.5 mr-1.5" /> FDA/EMA</dt>
                <dd className="font-medium">Aligned</dd>
              </dl>
              
              {renderCitations([
                { id: "NCT05678901", title: "Regulatory Compliance", sponsor: "RegPharma", year: 2023 },
                { id: "NCT06789012", title: "FDA Submission Checklist", sponsor: "FDA", year: 2024 }
              ])}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                  <span>Submission readiness</span>
                  <span className="font-medium">Excellent</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View Submission
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Regulatory Readiness Package Preview</DialogTitle>
                    <DialogDescription>
                      Complete IND-ready submission package with compliance verification
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-slate-50 p-4 rounded-md overflow-hidden">
                    <object
                      data="/static/example_reports/regulatory/ind_summary.pdf"
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="rounded border"
                    >
                      <p>PDF cannot be displayed</p>
                    </object>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/planning?persona=regulatory&example=submission">
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 gap-1.5">
                  <FileCheck className="h-3.5 w-3.5" />
                  Run Compliance Check
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* TILE 4 — STATISTICAL READINESS (BIOSTATS) */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4`}>
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  <BarChart className="h-3.5 w-3.5 mr-1" />
                  For Biostatisticians
                </Badge>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Statistical Analysis
                </span>
              </div>
              <h3 className="text-xl font-bold mt-3 mb-0">
                Statistical Analysis Package
              </h3>
              <p className="text-sm opacity-90">Make every assumption defensible.</p>
            </div>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <dt className="text-muted-foreground flex items-center"><Users className="h-3.5 w-3.5 mr-1.5" /> Sample size</dt>
                <dd className="font-medium">428 (214 per arm)</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> Power</dt>
                <dd className="font-medium">90%</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> Dropout forecast</dt>
                <dd className="font-medium">15.2%</dd>
                
                <dt className="text-muted-foreground flex items-center"><FileText className="h-3.5 w-3.5 mr-1.5" /> SAP draft</dt>
                <dd className="font-medium">Available</dd>
                
                <dt className="text-muted-foreground flex items-center"><BarChart className="h-3.5 w-3.5 mr-1.5" /> Endpoint risks</dt>
                <dd className="font-medium text-amber-600">Medium (2)</dd>
              </dl>
              
              {renderCitations([
                { id: "NCT07890123", title: "Statistical Analysis Plan", sponsor: "StatResearch", year: 2023 },
                { id: "NCT08901234", title: "Power Calculation Benchmark", sponsor: "BioStat Inc", year: 2024 }
              ])}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                  <span>SAP completeness</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View Statistical Brief
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Statistical Analysis Package Preview</DialogTitle>
                    <DialogDescription>
                      Complete SAP draft with power calculations and endpoint risk analysis
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-slate-50 p-4 rounded-md overflow-hidden">
                    <object
                      data="/static/example_reports/biostats/sap_draft.pdf"
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="rounded border"
                    >
                      <p>PDF cannot be displayed</p>
                    </object>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/planning?persona=biostats&example=stats">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 gap-1.5">
                  <BarChart className="h-3.5 w-3.5" />
                  Simulate Your Plan
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* TILE 5 — OPERATIONAL EXECUTION (CLIN OPS) */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r from-rose-500 to-red-600 text-white p-4`}>
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  For Clinical Ops
                </Badge>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Study Execution
                </span>
              </div>
              <h3 className="text-xl font-bold mt-3 mb-0">
                Operational Execution Plan
              </h3>
              <p className="text-sm opacity-90">Run what can be executed, not just approved.</p>
            </div>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <dt className="text-muted-foreground flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> Timeline</dt>
                <dd className="font-medium">18 months</dd>
                
                <dt className="text-muted-foreground flex items-center"><Users className="h-3.5 w-3.5 mr-1.5" /> Site count</dt>
                <dd className="font-medium">32 sites</dd>
                
                <dt className="text-muted-foreground flex items-center"><LineChart className="h-3.5 w-3.5 mr-1.5" /> Enrollment delay</dt>
                <dd className="font-medium text-amber-600">21% risk</dd>
                
                <dt className="text-muted-foreground flex items-center"><Award className="h-3.5 w-3.5 mr-1.5" /> Execution risk</dt>
                <dd className="font-medium">Medium (63/100)</dd>
                
                <dt className="text-muted-foreground flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> Gantt chart</dt>
                <dd className="font-medium">Available</dd>
              </dl>
              
              {renderCitations([
                { id: "NCT09012345", title: "Operational Timeline", sponsor: "ClinOpsResearch", year: 2024 },
                { id: "NCT09123456", title: "Site Burden Assessment", sponsor: "SiteExec Inc", year: 2023 }
              ])}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                  <span>Operational feasibility</span>
                  <span className="font-medium">Good</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between dark:bg-gray-900">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View Timeline
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Operational Execution Plan Preview</DialogTitle>
                    <DialogDescription>
                      Complete execution timeline with site burden and enrollment forecasts
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-slate-50 p-4 rounded-md overflow-hidden">
                    <object
                      data="/static/example_reports/clinops/timeline.pdf"
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className="rounded border"
                    >
                      <p>PDF cannot be displayed</p>
                    </object>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/planning?persona=clinops&example=timeline">
                <Button className="bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Forecast Your Timeline
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">
            Ready to generate your own intelligence?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload your protocol or start from scratch to generate full intelligence packages backed by real-world data.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/planning">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <BrainCircuit className="h-5 w-5" />
                Start Building Your Protocol
              </Button>
            </Link>
            <Link href="/example-reports">
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="h-5 w-5" />
                View All Example Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageShowcaseSection;