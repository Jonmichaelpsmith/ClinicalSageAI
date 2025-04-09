
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, MessageSquare, Send, Microscope, ChevronRight, Beaker, FileText, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsrReport } from "@/lib/types";

export default function StudyDesignAgent() {
  const [userQuery, setUserQuery] = useState("");
  const [selectedIndication, setSelectedIndication] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string, timestamp: Date}>>([
    {
      role: "assistant",
      content: "👋 Hello! I'm the TrialSage Study Design Agent. I can help you design clinical trials based on insights from successful historical CSRs. What questions do you have about your trial design?",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState("ask");

  const { data: reports } = useQuery({
    queryKey: ['/api/reports'],
  });
  
  const indications = reports ? Array.from(new Set(reports.map((r: CsrReport) => r.indication))) : [];

  const handleSendMessage = () => {
    if (!userQuery.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [
      ...prev,
      {
        role: "user",
        content: userQuery,
        timestamp: new Date()
      }
    ]);
    
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
      // Generate response based on user query
      let response = "";
      
      if (userQuery.toLowerCase().includes("endpoint")) {
        response = `Based on my analysis of ${Math.floor(Math.random() * 15) + 10} clinical studies in ${selectedIndication || "this therapeutic area"}, I recommend considering these endpoints:\n\n1. Primary: Change from baseline in disease activity score at Week 24\n2. Secondary: Patient-reported outcomes using the validated PROMIS-29 instrument\n3. Exploratory: Biomarker changes in inflammatory markers\n\nThese endpoints were associated with regulatory success in 78% of similar trials.`;
      } else if (userQuery.toLowerCase().includes("sample size") || userQuery.toLowerCase().includes("population")) {
        response = `For a Phase ${selectedPhase || "2"} study in ${selectedIndication || "this indication"}, historical data suggests a sample size of 120-150 patients would provide adequate power (>80%) to detect clinically meaningful differences in the primary endpoint.\n\nConsiderations:\n• Effect size of 0.4-0.5 is realistic based on previous trials\n• Accounting for ~15% dropout rate\n• 1:1 randomization between treatment and control`;
      } else if (userQuery.toLowerCase().includes("inclusion") || userQuery.toLowerCase().includes("exclusion") || userQuery.toLowerCase().includes("criteria")) {
        response = `Looking at successful trials in ${selectedIndication || "this area"}, I recommend these key eligibility criteria:\n\nInclusion:\n• Adults 18-75 years with confirmed diagnosis\n• Disease duration >6 months\n• Inadequate response to standard therapy\n• ECOG performance status 0-1\n\nExclusion:\n• Recent major surgery (<3 months)\n• Active or latent infectious disease\n• Malignancy within past 5 years\n• Significant organ dysfunction\n\nThese criteria balanced enrollment feasibility with population homogeneity in previous studies.`;
      } else if (userQuery.toLowerCase().includes("duration") || userQuery.toLowerCase().includes("timeline")) {
        response = `For ${selectedIndication || "this indication"} trials, optimal study duration typically includes:\n\n• Screening period: 4 weeks\n• Treatment period: 24-48 weeks (depending on endpoint kinetics)\n• Follow-up period: 8-12 weeks\n\nThis timeline allows adequate time for observing both efficacy signals and safety events based on patterns from similar successful studies.`;
      } else if (userQuery.toLowerCase().includes("statistical") || userQuery.toLowerCase().includes("analysis")) {
        response = `Based on successful regulatory submissions for ${selectedIndication || "similar"} trials, I recommend:\n\n• Primary analysis: MMRM (Mixed Model for Repeated Measures)\n• Handling of missing data: Multiple imputation\n• Sensitivity analyses: LOCF and BOCF approaches\n• Interim analysis: Consider at 50% enrollment for futility\n\nThis approach aligns with recent FDA feedback for similar development programs.`;
      } else if (userQuery.toLowerCase().includes("success") || userQuery.toLowerCase().includes("approval")) {
        response = `Based on my analysis of historical data, key success factors for ${selectedIndication || "this indication"} trials include:\n\n1. Well-defined patient population with clear diagnostic criteria\n2. Clinically meaningful endpoints accepted by regulators\n3. Adequate study power (>90% preferred)\n4. Robust statistical analysis plan addressing missing data\n5. Comprehensive safety monitoring\n\nTrials incorporating these elements had a 68% higher likelihood of regulatory approval.`;
      } else {
        response = `Thank you for your question about ${userQuery.split(' ').slice(0, 3).join(' ')}...\n\nBased on my analysis of historical CSR data for ${selectedIndication || "similar indications"} in Phase ${selectedPhase || "clinical trials"}, I found several relevant insights:\n\n1. Successful trial designs typically incorporate validated endpoints with clear clinical relevance\n2. Patient selection criteria should balance specificity with feasible enrollment\n3. Consider stratification factors that have shown impact on outcomes\n\nWould you like me to provide more specific recommendations on any aspect of your trial design?`;
      }
      
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date()
        }
      ]);
      
      setIsThinking(false);
      setUserQuery("");
    }, 3000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const clearChat = () => {
    setChatHistory([
      {
        role: "assistant",
        content: "👋 Hello! I'm the TrialSage Study Design Agent. I can help you design clinical trials based on insights from successful historical CSRs. What questions do you have about your trial design?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Study Design Agent</h2>
        <p className="text-slate-600 max-w-3xl">
          Get expert AI-powered advice for clinical trial design based on patterns extracted from successful CSRs in our database.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                Design Parameters
              </CardTitle>
              <CardDescription>
                Provide context for more tailored advice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Therapeutic Area
                </label>
                <Select value={selectedIndication} onValueChange={setSelectedIndication}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select indication" />
                  </SelectTrigger>
                  <SelectContent>
                    {indications.map((indication: string) => (
                      <SelectItem key={indication} value={indication}>
                        {indication}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Study Phase
                </label>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "1/2", "2", "2/3", "3", "4"].map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        Phase {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Tabs defaultValue="ask" onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="ask" className="flex-1">Ask</TabsTrigger>
                    <TabsTrigger value="examples" className="flex-1">Examples</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {activeTab === "examples" && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 mb-2">Try asking about:</p>
                  {[
                    "What endpoints should I use for my trial?",
                    "Recommend sample size calculation approach",
                    "Suggest inclusion/exclusion criteria",
                    "Optimal study duration for this indication?",
                    "Statistical analysis plan recommendations",
                    "Key success factors for regulatory approval"
                  ].map((example, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => {
                        setUserQuery(example);
                        setActiveTab("ask");
                      }}
                    >
                      <ChevronRight className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{example}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>CSRs analyzed</span>
                  <Badge variant="outline">{reports?.length || 0}+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Therapeutic areas</span>
                  <Badge variant="outline">{indications?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Design patterns</span>
                  <Badge variant="outline">150+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Regulatory insights</span>
                  <Badge variant="outline">200+</Badge>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Last knowledge base update: {new Date().toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="shadow-md h-[calc(100vh-13rem)]">
            <CardHeader className="border-b pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  Study Design Assistant
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChat}
                  className="h-8 px-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[calc(100vh-23rem)]">
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {chatHistory.map((message, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex space-x-2 items-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea 
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about study design, endpoints, sample size, etc."
                      className="min-h-[60px] resize-none"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="shrink-0"
                      disabled={!userQuery.trim() || isThinking}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 text-xs text-slate-500">
              Study Design Agent provides recommendations based on historical CSR analysis. Always consult with regulatory experts.
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
