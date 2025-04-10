import { useState } from "react";
import { motion } from "framer-motion";
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

export default function UseCaseLibrary() {
  const [showContactForm, setShowContactForm] = useState(false);
  
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
          </Tabs>
          
          <div className="mt-16 text-center">
            <div className="space-y-2 max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Need a Custom Use Case?</h2>
              <p className="text-muted-foreground">
                Our team can help you apply TrialSage to your specific clinical development challenges
              </p>
            </div>
            
            {!showContactForm ? (
              <Button onClick={() => setShowContactForm(true)} size="lg" className="px-8">
                Request Custom Use Case
              </Button>
            ) : (
              <>
                <div className="max-w-md mx-auto p-6 bg-card rounded-lg border shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Complete this form and our team will reach out within 24 hours to discuss your specific use case
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <input 
                          type="text" 
                          id="firstName" 
                          className="w-full p-2 rounded-md border bg-background" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <input 
                          type="text" 
                          id="lastName" 
                          className="w-full p-2 rounded-md border bg-background" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full p-2 rounded-md border bg-background" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium">Company</label>
                      <input 
                        type="text" 
                        id="company" 
                        className="w-full p-2 rounded-md border bg-background" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Describe Your Use Case</label>
                      <textarea 
                        id="description" 
                        rows={4}
                        className="w-full p-2 rounded-md border bg-background resize-none" 
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setShowContactForm(false)}>
                      Cancel
                    </Button>
                    <Button>Request Custom Use Case</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ContentSection>
    </PageContainer>
  );
}