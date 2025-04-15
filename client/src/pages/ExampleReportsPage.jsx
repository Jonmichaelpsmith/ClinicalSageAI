import React, { useState } from "react";
import { 
  FileBarChart2, 
  Download, 
  FileText, 
  Filter, 
  Search,
  SlidersHorizontal,
  AlertCircle,
  Calendar,
  Tag,
  ChevronDown,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

// Example report data
const exampleReports = [
  {
    id: 1,
    title: "Adalimumab Clinical Evaluation Report",
    type: "CER",
    date: "March 15, 2025",
    category: "Immunology",
    description: "Comprehensive Clinical Evaluation Report for Adalimumab with 5-year safety data analysis, literature review, and risk-benefit assessment.",
    tags: ["FDA FAERS", "Literature Review", "Safety Analysis"],
    featuredImage: "adalimumab",
    badgeText: "Enhanced",
    badgeVariant: "default",
    downloadUrl: "#",
    previewUrl: "#"
  },
  {
    id: 2,
    title: "Semaglutide Post-Market Surveillance Report",
    type: "CER",
    date: "February 28, 2025",
    category: "Endocrinology",
    description: "Post-market surveillance report for Semaglutide with safety signal detection, adverse event clustering, and regulatory recommendations.",
    tags: ["Adverse Events", "Signal Detection", "Visualizations"],
    featuredImage: "semaglutide",
    badgeText: "AI-Generated",
    badgeVariant: "default",
    downloadUrl: "#",
    previewUrl: "#"
  },
  {
    id: 3,
    title: "Pembrolizumab CER with Advanced Safety Monitoring",
    type: "CER",
    date: "January 10, 2025",
    category: "Oncology",
    description: "Enhanced Clinical Evaluation Report for Pembrolizumab featuring comprehensive adverse event monitoring across multiple indications.",
    tags: ["Oncology", "Immuno-Oncology", "Multi-Indication"],
    featuredImage: "pembrolizumab",
    badgeText: "Premium",
    badgeVariant: "default",
    downloadUrl: "#",
    previewUrl: "#"
  },
  {
    id: 4,
    title: "Infliximab Regulatory Compliance Report",
    type: "CER",
    date: "December 5, 2024",
    category: "Immunology",
    description: "Regulatory-focused Clinical Evaluation Report for Infliximab with detailed compliance analysis for FDA, EMA, and PMDA requirements.",
    tags: ["Regulatory", "Global", "Compliance"],
    featuredImage: "infliximab",
    badgeText: "Regulatory",
    badgeVariant: "outline",
    downloadUrl: "#",
    previewUrl: "#"
  },
  {
    id: 5,
    title: "Ustekinumab Annual Safety Update Report",
    type: "CER",
    date: "November 15, 2024",
    category: "Dermatology",
    description: "Annual update to Clinical Evaluation Report for Ustekinumab with focus on dermatological indications and emerging safety signals.",
    tags: ["Annual Update", "Dermatology", "Psoriasis"],
    featuredImage: "ustekinumab",
    badgeText: "Annual",
    badgeVariant: "outline",
    downloadUrl: "#",
    previewUrl: "#"
  },
  {
    id: 6,
    title: "Apixaban Comparative Safety Analysis",
    type: "CER",
    date: "October 20, 2024",
    category: "Cardiology",
    description: "Comparative Clinical Evaluation Report for Apixaban with head-to-head analysis against other NOACs using real-world evidence.",
    tags: ["Comparative", "NOAC", "Real-World Evidence"],
    featuredImage: "apixaban",
    badgeText: "Comparative",
    badgeVariant: "outline",
    downloadUrl: "#",
    previewUrl: "#"
  }
];

// Component for the gradient backgrounds
const ReportGradient = ({ type, className = "" }) => {
  const gradients = {
    adalimumab: "from-sky-500 to-indigo-600",
    semaglutide: "from-emerald-500 to-teal-600",
    pembrolizumab: "from-purple-500 to-indigo-600",
    infliximab: "from-amber-500 to-orange-600",
    ustekinumab: "from-rose-500 to-pink-600",
    apixaban: "from-blue-500 to-cyan-600",
    default: "from-gray-700 to-gray-900"
  };

  const gradient = gradients[type] || gradients.default;
  
  return (
    <div className={`h-40 bg-gradient-to-r ${gradient} flex items-center justify-center ${className}`}>
      <FileBarChart2 className="h-16 w-16 text-white" />
    </div>
  );
};

export default function ExampleReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Filter reports based on search term and filters
  const filteredReports = exampleReports.filter(report => {
    const matchesSearch = 
      searchTerm === "" || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "" || report.category === categoryFilter;
    const matchesType = typeFilter === "" || report.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  // Get unique categories and types for filters
  const categories = [...new Set(exampleReports.map(report => report.category))];
  const types = [...new Set(exampleReports.map(report => report.type))];
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/use-case-library">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Use Cases
          </Button>
        </Link>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Example Reports</h1>
        <p className="text-muted-foreground max-w-3xl">
          Browse our library of example Clinical Evaluation Reports (CERs) and other regulatory documents
          to see how LumenTrialGuide.AI can help your organization maintain compliance and generate 
          insights from post-market surveillance data.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Reports Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <Card key={report.id} className="overflow-hidden flex flex-col h-full">
              <ReportGradient type={report.featuredImage} />
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <Badge variant={report.badgeVariant}>{report.badgeText}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{report.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{report.category}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {report.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={report.previewUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-1" />
                    Preview
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <a href={report.downloadUrl} download>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How are these example reports created?</AccordionTrigger>
            <AccordionContent>
              These example reports are generated using our CER Solutions platform, which combines
              real data from FDA FAERS with AI-powered narrative generation and visualization tools.
              Each report follows either MEDDEV 2.7/1 Rev. 4 structure (for medical devices) or 
              similar pharmaceutical industry standards for post-market surveillance reporting.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I customize these reports for my products?</AccordionTrigger>
            <AccordionContent>
              Yes! LumenTrialGuide.AI's CER Solutions allow you to generate custom reports for your
              specific products using NDC codes or other product identifiers. Our platform will pull
              the relevant data from FDA FAERS and other sources, apply AI-powered analysis, and 
              create a comprehensive report tailored to your product's safety profile.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>How often are CERs typically updated?</AccordionTrigger>
            <AccordionContent>
              The frequency of CER updates depends on regulatory requirements and product risk profiles.
              Typically, high-risk products require annual updates, while lower-risk products may update
              every 2-5 years. With LumenTrialGuide.AI, you can set up automated monitoring to continuously
              track safety signals and generate updates when significant changes are detected.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Do these reports meet regulatory requirements?</AccordionTrigger>
            <AccordionContent>
              Yes, our reports are designed to meet the requirements of major regulatory bodies including
              FDA, EMA, PMDA, and others. The structure and content follow established guidelines such as
              MEDDEV 2.7/1 Rev. 4 for medical devices and similar pharmaceutical industry standards. 
              However, final regulatory compliance is the responsibility of the manufacturer or sponsor.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>Can I integrate this with my existing systems?</AccordionTrigger>
            <AccordionContent>
              LumenTrialGuide.AI offers API access and integration options to connect with your existing
              regulatory information management systems, safety databases, or document management platforms.
              Our team can help set up custom workflows to ensure seamless integration with your current processes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-8 rounded-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Ready to Generate Your Own CERs?</h2>
            <p className="mb-6">
              Start creating comprehensive Clinical Evaluation Reports for your products with our 
              automated CER Solutions platform. Access FDA FAERS data, AI-powered analysis, and 
              regulatory-compliant reporting in one seamless workflow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/cer-generator">
                <Button className="bg-white text-indigo-700 hover:bg-slate-100">
                  Try CER Generator
                </Button>
              </Link>
              <Link href="/enhanced-cer-dashboard">
                <Button variant="outline" className="border-white text-white hover:bg-indigo-700">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 flex flex-col gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart2 className="h-5 w-5 text-indigo-300" />
                <span className="font-medium">Start with an NDC code</span>
              </div>
              <p className="text-sm text-indigo-100">
                Simply enter your product's NDC code and our system will fetch all relevant adverse event data.
              </p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-indigo-300" />
                <span className="font-medium">Receive a complete report</span>
              </div>
              <p className="text-sm text-indigo-100">
                Get a comprehensive CER with all required sections, data visualizations, and regulatory narratives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}