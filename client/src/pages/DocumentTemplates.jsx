/**
 * Document Templates for eCTD Co-Author Module
 * 
 * This component displays available regulatory document templates
 * that can be used with Google Docs for eCTD submissions.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  LayoutTemplate, 
  Plus, 
  Copy,
  ExternalLink,
  CheckCircle,
  Tag,
  Globe,
  Filter,
  Loader2
} from 'lucide-react';

// Sample template data - in a real implementation, this would be fetched from API
const documentTemplates = [
  {
    id: 1,
    title: "Module 2.5 Clinical Overview",
    description: "Template for ICH M4E Clinical Overview with standard formatting for regulatory submissions",
    category: "clinical",
    region: "global",
    tags: ["ICH", "M4E"],
    uses: 128,
    lastUpdated: "2025-03-15"
  },
  {
    id: 2,
    title: "Module 2.7 Clinical Summary",
    description: "Standard template for Clinical Summary following ICH guidelines with integrated cross-references",
    category: "clinical",
    region: "global",
    tags: ["ICH", "M4E"],
    uses: 87,
    lastUpdated: "2025-04-02"
  },
  {
    id: 3,
    title: "Module 3.2 Quality Template",
    description: "Complete quality template for drug substance and product sections with CMC formatting",
    category: "quality",
    region: "global",
    tags: ["ICH", "M4Q", "CMC"],
    uses: 104,
    lastUpdated: "2025-01-20"
  },
  {
    id: 4,
    title: "FDA Module 1 Administrative",
    description: "FDA-specific administrative information template with regional requirements",
    category: "administrative",
    region: "us",
    tags: ["FDA", "Module 1"],
    uses: 56,
    lastUpdated: "2025-02-11"
  },
  {
    id: 5,
    title: "Module 2.4 Nonclinical Overview",
    description: "Template for nonclinical pharmacology, pharmacokinetics, and toxicology overview",
    category: "nonclinical",
    region: "global",
    tags: ["ICH", "M4S"],
    uses: 91,
    lastUpdated: "2025-04-18"
  },
  {
    id: 6,
    title: "EMA Module 1 Regional",
    description: "EMA-specific administrative information template with EU regional requirements",
    category: "administrative",
    region: "eu",
    tags: ["EMA", "Module 1", "EU"],
    uses: 43,
    lastUpdated: "2025-03-28"
  }
];

export default function DocumentTemplates() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const filteredTemplates = documentTemplates.filter(template => {
    if (selectedCategory !== "all" && template.category !== selectedCategory) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleUseTemplate = (templateId) => {
    setLoading(true);
    // Simulate template usage
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Template Selected",
        description: "Opening template in Google Docs editor...",
        variant: "default",
      });
      // In real implementation, this would redirect to editor with selected template
    }, 1000);
  };

  const getRegionBadge = (region) => {
    switch (region) {
      case "global":
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Global</Badge>;
      case "us":
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">FDA (US)</Badge>;
      case "eu":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">EMA (EU)</Badge>;
      default:
        return <Badge variant="outline">{region}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <LayoutTemplate className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-semibold">Document Templates</h1>
          <Badge className="ml-2">Global</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="nonclinical">Nonclinical</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="administrative">Administrative</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <Card key={template.id} className="border border-slate-200 hover:border-blue-200 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          {getRegionBadge(template.region)}
                        </div>
                        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-slate-100">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <span className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {template.uses} uses
                          </span>
                          <span className="mx-2">•</span>
                          <span>Updated: {template.lastUpdated}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          <Copy className="h-4 w-4 mr-1.5" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleUseTemplate(template.id)}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Use Template
                              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center bg-white rounded-lg border border-dashed border-slate-300">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-700">No templates found</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                      We couldn't find any templates matching your search criteria.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}