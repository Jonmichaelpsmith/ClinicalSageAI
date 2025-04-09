
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
