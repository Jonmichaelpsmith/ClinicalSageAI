
import React from "react";
import { motion } from "framer-motion";
import {
  FileText, Brain, Search, BarChart2, BookOpen, AreaChart,
  Database, Microscope, Beaker, Lock, PieChart, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductFeatures() {
  const featureCategories = [
    {
      id: "extraction",
      label: "CSR Extraction",
      features: [
        {
          title: "Structured Data Extraction",
          description: "Automatically extract key clinical trial data points from unstructured CSR PDFs into searchable formats.",
          icon: <FileText className="h-8 w-8 text-primary" />,
          benefits: ["Save 80+ hours of manual review per CSR", "Standardized formatting across trials", "Searchable data warehouse"]
        },
        {
          title: "Endpoint Recognition",
          description: "Identify primary, secondary and exploratory endpoints with their corresponding measurements and time points.",
          icon: <Search className="h-8 w-8 text-indigo-500" />,
          benefits: ["Complete endpoint cataloging", "Statistical significance tracking", "Outcome interpretation"]
        },
        {
          title: "Population Analysis",
          description: "Extract patient demographics, inclusion/exclusion criteria, and enrollment statistics.",
          icon: <Database className="h-8 w-8 text-blue-500" />,
          benefits: ["Patient profile optimization", "Enrollment prediction", "Demographic insights"]
        },
      ]
    },
    {
      id: "design",
      label: "Trial Design",
      features: [
        {
          title: "AI Protocol Generator",
          description: "Create optimized protocol drafts based on similar historical trials with complete endpoint and criteria recommendations.",
          icon: <Brain className="h-8 w-8 text-violet-500" />,
          benefits: ["60% faster protocol development", "Enhanced protocol quality", "Reduced protocol amendments"]
        },
        {
          title: "Study Design Agent",
          description: "Interactive AI assistant trained on patterns from successful CSRs to guide your study design decisions.",
          icon: <BookOpen className="h-8 w-8 text-emerald-500" />,
          benefits: ["Expert guidance on demand", "Evidence-based recommendations", "Design optimization"]
        },
        {
          title: "Biomarker Analysis",
          description: "Cross-study analysis of biomarker response patterns to optimize patient selection strategies.",
          icon: <Microscope className="h-8 w-8 text-purple-500" />,
          benefits: ["Enhanced response prediction", "Target population refinement", "Precision medicine approach"]
        },
      ]
    },
    {
      id: "analytics",
      label: "Advanced Analytics",
      features: [
        {
          title: "Competitive Benchmarking",
          description: "Compare your trial design to competitors and identify differentiation opportunities within your therapeutic area.",
          icon: <BarChart2 className="h-8 w-8 text-orange-500" />,
          benefits: ["Market positioning insights", "Competitor strategy analysis", "Differentiation opportunities"]
        },
        {
          title: "Statistical Modeling",
          description: "Forecast trial success, identify risk factors, and simulate virtual trials based on historical data.",
          icon: <AreaChart className="h-8 w-8 text-green-500" />,
          benefits: ["Risk factor identification", "Sample size optimization", "Success probability forecasting"]
        },
        {
          title: "Dose-Finding Optimization",
          description: "Determine optimal dosing strategies using AI-powered analysis of similar compounds and mechanisms.",
          icon: <Beaker className="h-8 w-8 text-amber-500" />,
          benefits: ["Informed dose selection", "Safety margin optimization", "Therapeutic index analysis"]
        },
      ]
    },
    {
      id: "integration",
      label: "Enterprise Features",
      features: [
        {
          title: "Secure Collaboration",
          description: "Enterprise-grade security with role-based access controls and audit logging for team collaboration.",
          icon: <Lock className="h-8 w-8 text-slate-500" />,
          benefits: ["Role-based permissions", "Secure data sharing", "Compliance tracking"]
        },
        {
          title: "API Integration",
          description: "Connect TrialSage to your existing systems with our comprehensive API for seamless data workflows.",
          icon: <PieChart className="h-8 w-8 text-red-500" />,
          benefits: ["Custom data pipelines", "CTMS integration", "EDC system connection"]
        },
        {
          title: "White-Labeling",
          description: "Enterprise plans include white-label options for integrating TrialSage capabilities into your platform.",
          icon: <Rocket className="h-8 w-8 text-teal-500" />,
          benefits: ["Branded experience", "Custom deployment", "Seamless integration"]
        },
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
        <h1 className="text-3xl font-bold mb-4">TrialSage Features</h1>
        <p className="text-slate-600 max-w-3xl text-lg">
          Our AI-powered platform transforms Clinical Study Reports into valuable, structured intelligence 
          for biotech companies. Streamline trial design, gain competitive insights, and make data-driven 
          decisions with our comprehensive feature set.
        </p>
      </div>

      <Tabs defaultValue="extraction" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {featureCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {featureCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {category.features.map((feature, index) => (
                <Card key={index} className="overflow-hidden border-slate-200">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <Button size="lg" className="rounded-full px-8">
                Learn More About {category.label}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your clinical development?</h2>
          <p className="text-slate-600 mb-6">
            Join leading biotech companies that are using TrialSage to accelerate trial design,
            reduce costs, and improve regulatory success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8">
              Request Demo
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from "react";
import { 
  Beaker, Database, LineChart, PieChart, Search, FileText, 
  Brain, Award, Microscope, Users, Clipboard, Zap 
} from "lucide-react";

import { PageContainer, HeaderSection, ContentSection } from "@/components/layout";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function ProductFeatures() {
  return (
    <PageContainer>
      <HeaderSection>
        <Navbar />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4 py-8 md:py-12">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary px-3 py-1">
              Product Features
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              TrialSage Features & Capabilities
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Powerful tools for clinical study design and protocol optimization
            </p>
          </div>
        </div>
      </HeaderSection>
      
      <ContentSection>
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="space-y-12">
            {/* CSR Intelligence */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">Core Platform</Badge>
                <h2 className="text-3xl font-bold tracking-tighter">CSR Intelligence</h2>
                <p className="text-muted-foreground text-lg">Extract actionable insights from clinical study reports</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Database className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Structured Report Repository</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Access a comprehensive library of processed CSRs with normalized data formats and searchable fields</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Search className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Advanced Search & Filtering</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Find relevant CSRs by indication, phase, endpoint type, target population, and other key parameters</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <PieChart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Comparative Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Compare study designs, statistical approaches, and outcomes across multiple trials and sponsors</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Protocol Design */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">Study Design Suite</Badge>
                <h2 className="text-3xl font-bold tracking-tighter">Protocol Design</h2>
                <p className="text-muted-foreground text-lg">Create evidence-based clinical trial protocols</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Brain className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>AI Protocol Generator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Generate protocol templates based on successful precedent trials and regulatory standards</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Study Design Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Interactive AI assistant that helps craft and optimize trial designs with evidence-based recommendations</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Clipboard className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Protocol Optimizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Review and enhance your existing protocol with targeted suggestions for improvement</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Analytics */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300">Advanced Analytics</Badge>
                <h2 className="text-3xl font-bold tracking-tighter">Biostatistics & Modeling</h2>
                <p className="text-muted-foreground text-lg">Make data-driven decisions for trial design</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <LineChart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Statistical Modeling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Explore sample size, power calculations, and endpoint selection with interactive visualizations</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Microscope className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Endpoint Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Analyze endpoint selection patterns and performance across similar trials</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Patient Population Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Optimize inclusion/exclusion criteria with real-world evidence from similar studies</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Integration & Export */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300">Workflow Integration</Badge>
                <h2 className="text-3xl font-bold tracking-tighter">Collaboration & Export</h2>
                <p className="text-muted-foreground text-lg">Share insights and integrate with your workflow</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Research Dossiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Create and share curated collections of CSRs with annotations and team notes</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>API Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Integrate TrialSage data and insights directly into your existing tools and systems</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <Beaker className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Client Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Customized analytics and reports tailored to your specific pipeline and therapeutic areas</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to transform your clinical trial design?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/pricing">
                <Button size="lg" className="h-11">See Pricing</Button>
              </Link>
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
