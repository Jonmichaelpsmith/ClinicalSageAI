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
    icon: <Flask className="h-8 w-8 text-emerald-500" />,
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
                      <RocketLaunch className="h-8 w-8 text-blue-600" />
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