import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, FileText, Microscope, PieChart, BarChart3,
  Calendar, Users, FileType, Brain, Beaker, ArrowRight,
  Dna, PlusCircle, Rocket, Lightbulb, Braces, Database
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define use case types
type UseCase = {
  id: number;
  title: string;
  description: string;
  category: "design" | "analysis" | "regulatory" | "operations" | "commercial";
  difficulty: "beginner" | "intermediate" | "advanced";
  components: string[];
  tags: string[];
  icon: React.ReactNode;
};

// Sample use cases library
const useCases: UseCase[] = [
  {
    id: 1,
    title: "Optimizing Clinical Trial Design",
    description: "Learn how to use historical trial data to optimize your clinical trial design, including endpoint selection, sample size calculation, and inclusion/exclusion criteria.",
    category: "design",
    difficulty: "intermediate",
    components: ["AI Protocol Generator", "Study Design Agent", "Statistical Modeling"],
    tags: ["protocol", "design", "endpoints", "criteria"],
    icon: <FileText className="h-8 w-8 text-blue-500" />,
  },
  {
    id: 2,
    title: "Biomarker-based Patient Selection",
    description: "Identify optimal patient populations for your trials by analyzing biomarker data across similar studies and predicting response rates.",
    category: "design",
    difficulty: "advanced",
    components: ["Biomarker Analytics", "Predictive Modeling", "Patient Stratification"],
    tags: ["biomarkers", "stratification", "precision medicine"],
    icon: <Microscope className="h-8 w-8 text-purple-500" />,
  },
  {
    id: 3,
    title: "Competitive Landscape Analysis",
    description: "Analyze the competitive trial landscape in your therapeutic area to identify gaps, opportunities, and differentiation strategies.",
    category: "commercial",
    difficulty: "intermediate",
    components: ["Competitive Benchmarking", "Market Analysis", "Trend Visualization"],
    tags: ["competition", "benchmarking", "market"],
    icon: <PieChart className="h-8 w-8 text-orange-500" />,
  },
  {
    id: 4,
    title: "Statistical Power Optimization",
    description: "Use advanced statistical methods to optimize your trial's statistical power while minimizing sample size requirements.",
    category: "analysis",
    difficulty: "advanced",
    components: ["Statistical Modeling", "Power Calculation", "Sample Size Optimizer"],
    tags: ["statistics", "power", "sample size"],
    icon: <BarChart3 className="h-8 w-8 text-green-500" />,
  },
  {
    id: 5,
    title: "Adaptive Trial Design",
    description: "Implement adaptive trial designs that can adjust based on interim results, potentially saving time and resources.",
    category: "design",
    difficulty: "advanced",
    components: ["Adaptive Design Simulator", "Interim Analysis", "Bayesian Methods"],
    tags: ["adaptive", "interim", "bayesian"],
    icon: <Calendar className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: 6,
    title: "Site Selection Optimization",
    description: "Identify optimal clinical trial sites based on historical performance, patient demographics, and enrollment rates.",
    category: "operations",
    difficulty: "intermediate",
    components: ["Site Analytics", "Enrollment Predictor", "Geographic Mapping"],
    tags: ["sites", "enrollment", "geography"],
    icon: <Users className="h-8 w-8 text-red-500" />,
  },
  {
    id: 7,
    title: "Regulatory Submission Strategy",
    description: "Develop a comprehensive regulatory strategy based on analysis of similar approved products and submission patterns.",
    category: "regulatory",
    difficulty: "intermediate",
    components: ["Regulatory Intelligence", "Submission Analyzer", "Requirements Engine"],
    tags: ["regulatory", "submission", "approval"],
    icon: <FileType className="h-8 w-8 text-amber-500" />,
  },
  {
    id: 8,
    title: "CNS Trial Optimization",
    description: "Specialized toolkit for optimizing CNS trials, focusing on reducing placebo response and identifying responsive patient populations.",
    category: "design",
    difficulty: "advanced",
    components: ["CNS Endpoint Library", "Placebo Response Predictor", "Responder Analysis"],
    tags: ["CNS", "neurology", "placebo", "psychiatry"],
    icon: <Brain className="h-8 w-8 text-cyan-500" />,
  },
  {
    id: 9,
    title: "Dose-Finding Optimization",
    description: "Determine optimal dosing strategies for your compound using AI-powered analysis of similar compounds and mechanisms.",
    category: "design",
    difficulty: "advanced",
    components: ["Dose-Response Modeler", "PK/PD Simulator", "Therapeutic Index Analyzer"],
    tags: ["dosing", "PK/PD", "safety margin"],
    icon: <Beaker className="h-8 w-8 text-emerald-500" />,
  },
  {
    id: 10,
    title: "Protocol Risk Assessment",
    description: "Identify potential risks in your protocol before implementation, including operational challenges and potential scientific issues.",
    category: "design",
    difficulty: "beginner",
    components: ["Protocol Analyzer", "Risk Identifier", "Complexity Scorer"],
    tags: ["risk", "protocol", "feasibility"],
    icon: <Beaker className="h-8 w-8 text-pink-500" />,
  },
  {
    id: 11,
    title: "Oncology Trial Enrichment",
    description: "Strategies for enriching oncology trials with patients most likely to respond to your treatment approach.",
    category: "design",
    difficulty: "advanced",
    components: ["Biomarker Response Predictor", "Cancer Subtype Analyzer", "Response Rate Simulator"],
    tags: ["oncology", "enrichment", "biomarkers", "response"],
    icon: <Dna className="h-8 w-8 text-rose-500" />,
  },
  {
    id: 12,
    title: "Custom Use Case Builder",
    description: "Create your own custom use case by combining different TrialSage components to address your specific clinical development needs.",
    category: "operations",
    difficulty: "intermediate",
    components: ["Component Library", "Workflow Builder", "Custom Analysis"],
    tags: ["custom", "workflow", "bespoke"],
    icon: <PlusCircle className="h-8 w-8 text-teal-500" />,
  },
];

// Filter and search capabilities
function UseCaseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);

  // Filter use cases based on search term and filters
  const filteredUseCases = useCases.filter((useCase) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = 
      categoryFilter === "all" || 
      useCase.category === categoryFilter;

    // Difficulty filter
    const matchesDifficulty = 
      difficultyFilter === "all" || 
      useCase.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Use case detail component
  const UseCaseDetail = ({ useCase }: { useCase: UseCase }) => {
    return (
      <Card className="w-full mb-4">
        <CardHeader>
          <div className="flex items-center gap-4">
            {useCase.icon}
            <div>
              <CardTitle>{useCase.title}</CardTitle>
              <CardDescription>
                <Badge variant={
                  useCase.difficulty === "beginner" ? "outline" : 
                  useCase.difficulty === "intermediate" ? "secondary" : 
                  "destructive"
                } className="mr-2">
                  {useCase.difficulty.charAt(0).toUpperCase() + useCase.difficulty.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {useCase.category.charAt(0).toUpperCase() + useCase.category.slice(1)}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{useCase.description}</p>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Components Used:</h4>
            <div className="flex flex-wrap gap-2">
              {useCase.components.map((component, idx) => (
                <Badge key={idx} variant="secondary">
                  {component}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Implementation Steps:</h4>
            <ol className="pl-5 text-sm text-slate-600 space-y-2 list-decimal">
              <li>Configure data sources and import clinical trial reports</li>
              <li>Select analysis parameters and configure components</li>
              <li>Run initial analysis and review automated insights</li>
              <li>Refine parameters based on feedback and domain expertise</li>
              <li>Generate final reports and export actionable recommendations</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setSelectedUseCase(null)}>
            Back to List
          </Button>
          <Button className="flex items-center gap-2">
            Implement Use Case <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Use case card component
  const UseCaseCard = ({ useCase }: { useCase: UseCase }) => {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow" 
        onClick={() => setSelectedUseCase(useCase)}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            {useCase.icon}
            <CardTitle className="text-lg">{useCase.title}</CardTitle>
          </div>
          <CardDescription>
            <Badge variant={
              useCase.difficulty === "beginner" ? "outline" : 
              useCase.difficulty === "intermediate" ? "secondary" : 
              "destructive"
            } className="mr-2">
              {useCase.difficulty.charAt(0).toUpperCase() + useCase.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline">
              {useCase.category.charAt(0).toUpperCase() + useCase.category.slice(1)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 line-clamp-3">{useCase.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-1">
            {useCase.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {useCase.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{useCase.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Use Case Library</h2>
        <p className="text-slate-600 max-w-3xl">
          Explore proven applications of TrialSage in clinical trial design, analysis, and execution. 
          Leverage our extensive library of use cases to accelerate your clinical development.
        </p>
      </div>

      {selectedUseCase ? (
        <UseCaseDetail useCase={selectedUseCase} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by title, description, or tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Use Cases</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="design">Trial Design</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredUseCases.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium text-slate-700">No use cases found</h3>
                  <p className="text-slate-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUseCases.map((useCase) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Rocket className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle>Featured Use Case: AI-Powered Protocol Generation</CardTitle>
                        <CardDescription>Generate optimized protocol drafts based on historical trials</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Key Benefits
                        </h4>
                        <ul className="text-sm space-y-1 text-slate-600 list-disc pl-5">
                          <li>Reduce protocol development time by 60%</li>
                          <li>Optimize endpoint selection</li>
                          <li>Improve protocol quality and consistency</li>
                          <li>Reduce amendments by identifying issues early</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Braces className="h-4 w-4 text-emerald-500" />
                          Core Components
                        </h4>
                        <ul className="text-sm space-y-1 text-slate-600 list-disc pl-5">
                          <li>AI Protocol Generator</li>
                          <li>Endpoint Recommendation Engine</li>
                          <li>Inclusion/Exclusion Criteria Builder</li>
                          <li>Schedule of Assessments Optimizer</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Database className="h-4 w-4 text-violet-500" />
                          Data Sources
                        </h4>
                        <ul className="text-sm space-y-1 text-slate-600 list-disc pl-5">
                          <li>Your historical CSR repository</li>
                          <li>Anonymized industry protocol database</li>
                          <li>Regulatory guidance documents</li>
                          <li>Published literature</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Explore This Use Case</Button>
                  </CardFooter>
                </Card>
                
                {useCases
                  .filter(uc => [3, 4, 9].includes(uc.id))
                  .map(useCase => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {useCases
                  .filter(uc => uc.category === "design")
                  .map(useCase => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {useCases
                  .filter(uc => uc.category === "analysis" || uc.components.some(c => c.includes("Analytic") || c.includes("Analytics")))
                  .map(useCase => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2 py-8">
                      <h3 className="text-lg font-medium">Integration Use Cases Coming Soon</h3>
                      <p className="text-slate-500 max-w-lg mx-auto">
                        We're working on expanding our integration capabilities with CTMS, EDC, and other clinical systems.
                        Check back soon for new integration use cases.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-3">Create Your Own Use Case</h3>
            <p className="text-slate-600 mb-4">
              Don't see a use case that matches your specific needs? Work with our team to create a custom solution
              tailored to your clinical development challenges.
            </p>
            <Button>Request Custom Use Case</Button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default UseCaseLibrary;
import React from "react";
import { 
  Microscope, Calendar, ArrowRight, Beaker, FileSearch, 
  PieChart, Lock, Users, SlidersHorizontal, GraduationCap 
} from "lucide-react";

import { PageContainer, HeaderSection, ContentSection } from "@/components/layout";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function UseCaseLibrary() {
  return (
    <PageContainer>
      <HeaderSection>
        <Navbar />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4 py-8 md:py-12">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary px-3 py-1">
              Use Case Library
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              How Teams Use TrialSage
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Real-world applications for biotech companies at every stage
            </p>
          </div>
        </div>
      </HeaderSection>
      
      <ContentSection>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <Tabs defaultValue="biotech" className="space-y-8">
            <TabsList className="w-full max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-4 h-auto">
              <TabsTrigger value="biotech" className="py-3">Biotech Founders</TabsTrigger>
              <TabsTrigger value="clinical" className="py-3">Clinical Operations</TabsTrigger>
              <TabsTrigger value="regulatory" className="py-3">Regulatory Teams</TabsTrigger>
              <TabsTrigger value="investors" className="py-3">VCs & Investors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="biotech" className="space-y-8">
              <div className="space-y-2 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold">For Biotech Founders & CEOs</h2>
                <p className="text-lg text-muted-foreground">
                  Plan clinical development more effectively with data-backed decisions, 
                  avoid costly design errors, and minimize reliance on expensive consultants.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Phase 1 Planning</CardTitle>
                    <CardDescription>First-in-human study design</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Analyze dosing strategies, safety monitoring parameters, and inclusion/exclusion criteria from 
                      similar compounds to design a Phase 1 study with the highest chance of success.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <FileSearch className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Due Diligence Support</CardTitle>
                    <CardDescription>Fundraising preparation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Generate comprehensive trial landscape reports to validate your development plan
                      and strengthen investor presentations with data-backed rationale for program strategy.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Beaker className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Pipeline Strategy</CardTitle>
                    <CardDescription>Multi-asset planning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Determine optimal clinical development paths for multiple assets by
                      comparing precedent development timelines and identifying strategic efficiencies.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="clinical" className="space-y-8">
              <div className="space-y-2 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold">For Clinical Operations</h2>
                <p className="text-lg text-muted-foreground">
                  Streamline protocol development with evidence-based templates, optimize study design,
                  and align with regulatory precedent to accelerate approval pathways.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <SlidersHorizontal className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Endpoint Selection</CardTitle>
                    <CardDescription>Evidence-based approach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Analyze endpoint performance across similar trials to select primary and secondary
                      endpoints most likely to demonstrate clinical benefit and gain regulatory approval.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Patient Population Definition</CardTitle>
                    <CardDescription>Inclusion/exclusion criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Refine your trial population based on analysis of similar studies,
                      identifying optimal balance between recruitment feasibility and clinical effect size.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <PieChart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Statistical Planning</CardTitle>
                    <CardDescription>Power calculations & analysis plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Design statistical approaches with confidence by benchmarking sample sizes,
                      effect sizes, and statistical methods against successful precedent trials.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="regulatory" className="space-y-8">
              <div className="space-y-2 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold">For Regulatory Affairs</h2>
                <p className="text-lg text-muted-foreground">
                  Strengthen regulatory submissions with precedent-based rationales, prepare for agency
                  interactions, and align trial designs with successful approval pathways.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <GraduationCap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Regulatory Precedent</CardTitle>
                    <CardDescription>Approval pathway planning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Build regulatory submissions with evidence-based rationales, citing precedent
                      trials and regulatory decisions to support your development strategy.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Lock className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>IND/CTA Preparation</CardTitle>
                    <CardDescription>Application support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Strengthen regulatory applications with well-documented rationales for protocol
                      design elements, citing relevant precedent from successful submissions.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Microscope className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Agency Meeting Preparation</CardTitle>
                    <CardDescription>Pre-submission interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Prepare for regulatory agency meetings with comprehensive data packages
                      that anticipate questions and provide evidence-based justifications.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="investors" className="space-y-8">
              <div className="space-y-2 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold">For VCs & Investors</h2>
                <p className="text-lg text-muted-foreground">
                  Enhance due diligence with independent analysis of clinical development plans,
                  evaluate trial feasibility, and assess competitive positioning.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <FileSearch className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Due Diligence</CardTitle>
                    <CardDescription>Investment evaluation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Assess the quality and feasibility of clinical development plans with
                      objective third-party data on comparable trials and development timelines.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <PieChart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Competitive Analysis</CardTitle>
                    <CardDescription>Market positioning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Compare clinical development strategies across competing assets to identify
                      competitive advantages, risks, and potential differentiators.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border rounded-xl shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Timeline Assessment</CardTitle>
                    <CardDescription>Development path validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Validate projected development timelines against historical precedent to
                      ensure realistic planning and capital allocation.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      See Example <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-16 text-center space-y-6">
            <h2 className="text-3xl font-bold">Have a specific use case in mind?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-11">Contact Our Team</Button>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-11">Try Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </ContentSection>
    </PageContainer>
  );
}
