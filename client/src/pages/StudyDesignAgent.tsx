
import React, { useState, useEffect } from "react";
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
  
  const indications = reports && Array.isArray(reports) ? Array.from(new Set(reports.map((r: CsrReport) => r.indication))) : [];

  // State for tracking free trial
  const [trialSessionStart, setTrialSessionStart] = useState<number | null>(null);
  const [remainingTrialTime, setRemainingTrialTime] = useState<number | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  
  // Initialize or get existing session start timestamp
  useEffect(() => {
    const storedSessionStart = sessionStorage.getItem('agent_session_start');
    if (storedSessionStart) {
      setTrialSessionStart(parseInt(storedSessionStart));
    }
  }, []);
  
  // Calculate and update remaining trial time
  useEffect(() => {
    if (trialSessionStart) {
      const checkRemainingTime = () => {
        const now = Date.now();
        const elapsed = now - trialSessionStart;
        const remaining = Math.max(0, Math.floor((300000 - elapsed) / 1000)); // 5 minutes in ms
        
        setRemainingTrialTime(remaining);
        
        // Check if trial has expired
        if (remaining <= 0 && !trialExpired) {
          setTrialExpired(true);
        }
      };
      
      // Check immediately and then set interval
      checkRemainingTime();
      const intervalId = setInterval(checkRemainingTime, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [trialSessionStart, trialExpired]);
  
  const handleSendMessage = async () => {
    if (!userQuery.trim()) return;
    
    // Initialize session time if not already set
    if (!trialSessionStart) {
      const now = Date.now();
      setTrialSessionStart(now);
      sessionStorage.setItem('agent_session_start', now.toString());
    }
    
    // If trial has expired, show subscription message
    if (trialExpired) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "user",
          content: userQuery,
          timestamp: new Date()
        },
        {
          role: "assistant",
          content: "🔒 Your free trial has expired. Please subscribe to continue using the Study Design Agent.",
          timestamp: new Date()
        }
      ]);
      setUserQuery("");
      return;
    }
    
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
    
    try {
      // Call the actual API endpoint
      const response = await fetch('/api/study-design-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          indication: selectedIndication,
          phase: selectedPhase,
          sessionStart: trialSessionStart
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        // Handle API error
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.message || "Failed to get a response. Please try again."}`,
            timestamp: new Date()
          }
        ]);
      } else if (data.trialExpired) {
        // Handle expired trial
        setTrialExpired(true);
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "🔒 Your free trial has expired. Please subscribe to continue using the Study Design Agent.",
            timestamp: new Date()
          }
        ]);
      } else {
        // Update remaining trial time if provided
        if (data.response.remainingTrialTime !== undefined) {
          setRemainingTrialTime(data.response.remainingTrialTime);
        }
        
        // Add AI response to chat
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.response.content,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error("Error calling study design agent API:", error);
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, I encountered a technical error. Please try again later.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
      setUserQuery("");
    }
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
                    {indications.map((indication) => (
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
                  <Badge variant="outline">{reports && Array.isArray(reports) ? reports.length : 0}+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Therapeutic areas</span>
                  <Badge variant="outline">{indications.length}</Badge>
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
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 text-primary mr-2" />
                    Study Design Assistant
                    {remainingTrialTime !== null && (
                      <Badge variant="outline" className="ml-2 text-xs bg-amber-50">
                        BETA
                      </Badge>
                    )}
                  </CardTitle>
                  {remainingTrialTime !== null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {remainingTrialTime > 0 
                        ? `🕐 Free trial: ${Math.floor(remainingTrialTime / 60)}m ${remainingTrialTime % 60}s remaining` 
                        : "🔒 Free trial expired. Please subscribe to continue."}
                    </div>
                  )}
                </div>
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
